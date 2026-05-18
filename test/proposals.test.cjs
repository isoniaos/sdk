const assert = require("node:assert/strict");
const test = require("node:test");

const { hasKnownActionSelector } = require("../dist/proposals.js");
const rootExports = require("../dist/index.js");

test("identifies proposal DTOs with indexed action selectors", () => {
  assert.equal(
    hasKnownActionSelector({
      id: "7",
      orgId: "1",
      proposer: "0x0000000000000000000000000000000000000001",
      proposalType: "standard",
      targetAddress: "0x0000000000000000000000000000000000000002",
      value: "0",
      actionSelector: "0x12345678",
      dataHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      metadataURI: "ipfs://proposal",
      status: "active",
      createdAtBlock: "1",
      createdAt: "2026-05-18T00:00:00.000Z",
    }),
    true,
  );
  assert.equal(
    hasKnownActionSelector({
      id: "8",
      orgId: "1",
      proposer: "0x0000000000000000000000000000000000000001",
      proposalType: "standard",
      targetAddress: "0x0000000000000000000000000000000000000002",
      value: "0",
      dataHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      metadataURI: "ipfs://proposal",
      status: "active",
      createdAtBlock: "1",
      createdAt: "2026-05-18T00:00:00.000Z",
    }),
    false,
  );
});

test("exports proposal helpers from the root package", () => {
  assert.equal(rootExports.hasKnownActionSelector, hasKnownActionSelector);
});
