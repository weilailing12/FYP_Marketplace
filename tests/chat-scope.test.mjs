import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

const result = await build({ entryPoints: ["src/chatScope.ts"], bundle: true, write: false, format: "esm" });
const { isMarketplaceMessage, isLostFoundMessage } = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
);

test("marketplace scope includes legacy messages but excludes lost-and-found", () => {
  assert.equal(isMarketplaceMessage({ chat_type: "marketplace" }), true);
  assert.equal(isMarketplaceMessage({ chat_type: null }), true);
  assert.equal(isMarketplaceMessage({}), true);
  assert.equal(isMarketplaceMessage({ chat_type: "lostfound" }), false);
});

test("lost-and-found item conversations do not mix", () => {
  const itemA = { chat_type: "lostfound", item_id: "item-a" };
  const itemB = { chat_type: "lostfound", item_id: "item-b" };
  assert.equal(isLostFoundMessage(itemA, "item-a"), true);
  assert.equal(isLostFoundMessage(itemB, "item-a"), false);
  assert.equal(isLostFoundMessage({ chat_type: "marketplace", item_id: "item-a" }, "item-a"), false);
});

test("legacy lost-and-found route without an item retains participant history", () => {
  assert.equal(isLostFoundMessage({ chat_type: "lostfound", item_id: "item-a" }, null), true);
  assert.equal(isLostFoundMessage({ chat_type: "lostfound", item_id: null }, null), true);
});
