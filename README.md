
# CampusTrade Marketplace

CampusTrade is a university-focused marketplace developed as a Final Year Project for Universiti Tunku Abdul Rahman (UTAR). It provides students with one platform to buy and sell second-hand items, browse official club merchandise, communicate with other users, arrange meetups, report lost or found belongings, and receive campus announcements.

The system combines a React single-page application with Supabase services and AI-assisted student ID extraction. It is designed to make campus trading more convenient while supporting student-only registration, multi-factor authentication, real-time communication, and administrative moderation.

## Key Features

### Student authentication and identity

- Registration restricted to `@1utar.my` institutional email addresses
- AI-assisted extraction of a student's name and ID number from a UTAR student card image
- Email and password authentication through Supabase Auth
- Optional Time-based One-Time Password (TOTP) multi-factor authentication
- MFA challenges during login and sensitive password changes
- Email-based password recovery with an additional MFA challenge when MFA is enabled

### Campus marketplace

- Create, edit, browse, search, and filter second-hand product listings
- View detailed product and seller information
- User-specific shopping cart stored locally in the browser
- Buyer order requests and seller accept/reject workflows
- Order status updates and inventory visibility management
- Seller dashboard for listings and incoming requests

### Real-time chat and meetup coordination

- Buyer-to-seller messaging associated with marketplace orders
- Real-time message delivery using Supabase Realtime subscriptions
- Image attachments stored with Supabase Storage
- Read receipts and unread-message notifications
- Interactive meetup proposals with date, time, location, and response status

### Club merchandise

- Dedicated catalogue for official student club merchandise
- Search and filtering by club
- Admin-only creation, editing, visibility control, and deletion of merchandise

### Lost and found

- Report lost or found belongings with descriptions and photo evidence
- Browse and filter active reports
- Contact reporters through a separate real-time conversation flow
- Mark reports as resolved when an item is recovered

### Administration and announcements

- Admin dashboard for user, listing, and club merchandise management
- Publish, edit, hide, or remove campus announcements
- Support for announcement images and PDF attachments
- Role-based access checks for administrative pages and actions

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI components | Radix UI primitives, Material UI, Lucide React |
| Routing | React Router |
| Backend services | Supabase Auth, PostgreSQL, Realtime, and Storage |
| AI integration | Google Gemini multimodal API |
| Deployment | Vercel |

## System Architecture

CampusTrade follows a service-based web architecture:

1. The React single-page application renders the interface and manages local UI state.
2. Supabase Auth manages user sessions, password recovery, and TOTP factors.
3. Supabase PostgreSQL stores profiles, products, orders, messages, meetup proposals, lost-and-found reports, and announcements.
4. Supabase Realtime listens for database changes to update chats, order notifications, and meetup information.
5. Supabase Storage stores listing photos, chat attachments, report evidence, and announcement files.
6. The Gemini multimodal API analyses uploaded student card images and extracts registration details.
7. Vercel builds and hosts the frontend application.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- A Supabase project
- A Google AI Studio API key for the Gemini integration

### Installation

```bash
git clone <your-repository-url>
cd FYP_Marketplace
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Do not commit the `.env` file or any service-role keys to the repository.

Configure the required Supabase database tables, Row Level Security policies, Realtime tables, authentication redirect URLs, and the `campus-images` storage bucket. SQL files included in this repository provide setup for relevant order and announcement functionality.

Start the local development server:

```bash
npm run dev
```

Vite will display the local address, normally `http://localhost:5173`.

## Build and Verification

Create a production build:

```bash
npm run build
```

Run the automated checks:

```bash
node --test tests/*.test.mjs
```

## Deployment Notes

The frontend is designed for deployment on Vercel. Add the three `VITE_` environment variables to the Vercel project settings and configure Supabase Auth with both the production password-reset URL and the required local development redirect URLs.

Because Vite exposes `VITE_` variables to the browser, production deployments should proxy the Gemini request through a protected serverless function instead of exposing a long-lived unrestricted API key. Apply appropriate API restrictions and usage limits.

## Project Scope

CampusTrade is an academic prototype developed for demonstration and evaluation. AI-assisted ID extraction improves the registration workflow but should not be treated as definitive identity or document-authenticity verification without additional institutional checks.

## Acknowledgements

The initial user-interface concept was created from the [CampusTrade Marketplace UI Design](https://www.figma.com/design/h9NUbfZUauGdCwsIKJcVOH/CampusTrade-Marketplace-UI-Design) and was extended into a functional full-stack prototype.
