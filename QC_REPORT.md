# CampusTrade QC report

Reviewed 2026-09-15, commit `4cee5d5`. Application source was not changed during QC. This report is the only new tracked-file candidate.

## Coverage and limits

- Production build passed. Vite warned about the approximately 770 kB JavaScript chunk (223 kB gzip).
- Existing `node --test tests/auth.test.mjs` passed. It checks the MFA gate with mocked Auth responses; it is not an end-to-end password test.
- Live student browser: MFA prompt observed; user completed login. Marketplace filtering/search, product details, club feed, lost-and-found board, inbox/chat, cart, profile loading, and admin route denial inspected.
- Cart addition, RM 20 total, reload persistence, and removal passed. Cart restored to its original empty state.
- Opening an existing chat marked messages read. No messages, orders, listings, uploads, or password changes were submitted by QC.
- Browser returned to login during later settings navigation; the cause was not established and is not counted as an application defect.
- Admin write flows, two-account concurrent transactions, fresh registration, email recovery, and live database RLS/trigger configuration were not fully exercised. Email recovery remains limited by the reported email quota. No administrator session or complete live schema/policy export was supplied.
- SQL findings below describe the repository scripts, not proof that the live project has exactly those policies or lacks additional safeguards.

## High-priority findings

### 1. Gemini API key is exposed in the production JavaScript — confirmed artifact inspection

`src/app/components/Register.tsx:52` reads `VITE_GEMINI_API_KEY` and calls Gemini directly from the browser. A value-only check confirmed that the configured key appears in the compiled JavaScript; no key value was printed. Anyone able to load the application can extract it and potentially use its quota. Move OCR/verification behind a server or Edge Function, then rotate the exposed key and apply provider restrictions.

### 2. Email password recovery has no MFA completion step — code-confirmed gap; live recovery pending

`src/app/components/ResetPassword.tsx:15` treats any session as ready, then calls `updateUser` at line 27 without challenging an enrolled factor. `src/app/App.tsx:92` permits this route even when MFA is incomplete. A recovery session at AAL1 for an MFA-enabled account therefore has no way to satisfy an AAL2 password-update requirement on this screen. The earlier Profile fix did not address this separate recovery flow. Test a fresh recovery link for an MFA account and add a recover-and-verify flow that preserves the reset destination.

### 3. Order acceptance and inventory changes can become inconsistent — reproduced with mocked failure

`src/app/components/SellerDashboard.tsx:71` updates the order before updating stock, using cached product quantities. Running the actual extracted handler with a simulated stock-write failure left the order `accepted` and stock unchanged at 1. Concurrent acceptances also lack an atomic stock check and status transition. Move acceptance, stock decrement, and competing-order cancellation into a database transaction/RPC with locking and allowed-transition checks.

### 4. Order insert policy trusts buyer-supplied business fields — repository SQL finding

`supabase-orders.sql:72` checks only `buyer_id = auth.uid()`. It does not validate the supplied seller, price, initial status, ownership, or available stock against the product. The frontend supplies all of these fields (`ProductDetails.tsx:139`). Unless live triggers/other database restrictions enforce them, a client can submit an order with fabricated business values. Compute and validate these values on the server.

### 5. Update policies allow changing more than the intended fields — repository SQL finding

`supabase-orders.sql:133` gives recipients UPDATE access to message rows, not just `read_at`; the policy only preserves `receiver_id`. Without separate column restrictions, a recipient can alter message content or sender fields. Similarly, the meetup policy at line 114 allows either participant to update both acceptance flags and confirmation status. Restrict permitted fields/actions with database enforcement so each participant can accept only for themselves.

### 6. Student can open Club Merchandise Admin — RESOLVED

Opening `/clubmerchcreate` while logged in as a student previously displayed the complete publishing form. This has now been resolved: `ClubMerchAdminCreate.tsx` enforces `is_admin` role verification on mount (redirecting unauthorized users with an "Access Denied" message and preventing form flash) and performs server-side profile verification in `handleSubmit` prior to database insertion. `EditProduct.tsx` similarly restricts club merchandise modifications to administrators.

## Functional defects

### 7. Chat images do not work across sessions/devices — live confirmed

`ChatMeetup.tsx:228` and `LostFoundChat.tsx:288` create a temporary `blob:` URL and save it as `messages.image_url`. In the existing marketplace chat, both inspected attachments used `blob:` URLs and had failed to load. Upload the actual file to storage and persist a durable or signed URL strategy.

### 8. Opening one chat marks another chat type read — live confirmed

`ChatMeetup.tsx:136` and `LostFoundChat.tsx:162` update unread messages by participant IDs without restricting `chat_type` or `item_id`. Before opening marketplace chat, the inbox showed one unread marketplace message and one unread lost-and-found message. Opening only marketplace chat dropped the total from 2 to 0. Scope read updates to the displayed conversation.

### 9. Realtime read receipts are never executed — reproduced with installed SDK

`ChatMeetup.tsx:165` and `LostFoundChat.tsx:192` construct update builders without awaiting them or attaching `.then()`. A mocked-fetch check with the installed Supabase client recorded zero requests for the unawaited builder and one after awaiting it. Execute the request and notify the UI only after a successful write.

### 10. Lost-and-found conversations mix different items — code confirmed

`MessagesInbox.tsx` groups chats by participant plus `item_id`, but `LostFoundChat.tsx:135` loads every lost-and-found message between the participants. Its realtime callback also ignores item ID. Two item-specific inbox entries therefore open overlapping histories. Apply the same item scope to history, realtime messages, and read receipts.

### 11. Rejected secondhand orders can remain stuck on “Request sent” — code confirmed

`ProductDetails.tsx:86` sets state for pending/accepted/completed orders but never clears it when an existing pending request becomes rejected or cancelled. The realtime reload retains the old state until remount. Reset derived order state on every successful fetch, including empty/no-active-order results.

### 12. Restocking sold-out merchandise does not make it available — code confirmed

`EditProduct.tsx:149` changes `stock_quantity` without updating `availability`. Once acceptance marks a product `sold`, increasing stock leaves it excluded by `ClubMerchPage.tsx:73`. Loading zero stock also displays 1 because of the truthiness fallback at `EditProduct.tsx:61`. Preserve zero correctly and update stock/availability together according to the intended restock rules.

### 13. Later order updates do not produce a new notification — code confirmed

`MyOrders.tsx:28` saves seen order IDs, and `Navbar.tsx:31` checks only IDs. Once the buyer views an accepted order, a later transition to completed is treated as already seen. Cancellation is excluded from the notification query altogether. Track the last-seen status/version/timestamp per order.

### 14. Failed ID re-verification leaves the previous verified identity usable — code confirmed

`Register.tsx:37` starts a new verification without clearing the previously extracted name/student ID. Failure branches at lines 109–119 only set error text; final registration checks only whether the old name and ID are nonempty. Repro: verify image A, select an invalid image B, then complete registration. Clear prior verification when changing images and enforce verification server-side rather than trusting browser metadata.

### 15. Narrow-screen layout clips controls and removes search — live confirmed

At the inspected 706 px viewport, the document measured 786 px wide and showed horizontal overflow. The sidebar toggle overlapped the brand; right-side controls were clipped. `Navbar.tsx:107` hides the only search field below `md`, leaving no mobile search replacement. Fix flex minimum widths/header wrapping and provide a narrow-screen search control.

### 16. Database errors are presented as empty data — code confirmed

Examples: `MarketplaceFeed.tsx:33` logs errors and renders the same empty state as zero products; `MyOrders.tsx:33` and `SellerDashboard.tsx:33` ignore query errors and substitute empty arrays. Missing columns, permission failures, and outages can therefore look like lost orders or an empty marketplace. Add explicit failure/retry states and preserve previously loaded data where appropriate.

### 17. Installed dependencies have outstanding security advisories — npm audit confirmed

`npm audit --json` reported 13 affected packages: 1 critical, 9 high, 2 moderate, 1 low. `tar` is rated critical; direct dependencies include `vite`, `react-router`, and `react-router-dom`. All entries reported an available fix. Counts include transitive/build dependencies and do not prove these advisories are exploitable in this deployment. Review advisory applicability, update compatible versions, and repeat build/browser regression checks; do not blindly apply a forced major upgrade.

## Additional QC gaps

- Only one automated test exists; there is no configured lint or TypeScript-check script. A passing Vite build does not establish type correctness or end-to-end behavior.
- Repository SQL is not a complete reproducible backend setup: it assumes existing profiles/products/messages/lost-and-found tables and storage configuration. A live schema/policy export is needed for a complete backend QC sign-off.
- `supabase-announcements.sql` creates policies without dropping existing ones; rerunning it can fail on duplicate policies.
- Lost/found reporting accepts future incident dates (`ReportLostFound.tsx:212`, no maximum/date check). A future-dated incident was visible during this pass; confirm intended product rules.
- Registration always says the user can log in immediately, even if Supabase requires email confirmation (`Register.tsx:159`). Verify against the project's email-confirmation settings.

## Suggested repair order

1. Remove/rotate the exposed Gemini key and close database permission gaps.
2. Complete the MFA email-recovery flow and make order acceptance transactional.
3. Fix chat image persistence, conversation scoping, and read receipts.
4. Correct restocking, stale order UI, and notification tracking.
5. Fix responsive layout/error states, update dependencies, and add meaningful end-to-end coverage.

For the next live pass: obtain an admin test session and a second student session, confirm disposable test records, and inspect the actual Supabase policies/triggers. Do not share service-role keys, account passwords, or TOTP secrets in the report.
