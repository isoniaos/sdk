# @isonia/sdk

Pure TypeScript SDK for IsoniaOS Control Plane REST APIs.

## Scope

`@isonia/sdk` contains:

- typed REST client helpers for existing Control Plane endpoints;
- v0.8-compatible public archive, decision-record, accountability, and external-resource reads;
- endpoint path construction helpers;
- shared response typing via `@isonia/types`.

It does not contain React, NestJS, UI code, SaaS code, provider integrations, chain RPC calls, or governance authority logic.

## Install During Early Development

Until the public beta package registry release, depend on pinned GitHub tags:

```json
{
  "dependencies": {
    "@isonia/sdk": "github:isoniaos/sdk#<reviewed-sdk-tag-or-commit>"
  }
}
```

This v0.8-compatible SDK line depends on the v0.8 shared type package:

```json
{
  "dependencies": {
    "@isonia/types": "github:isoniaos/types#v0.8.0-alpha.3"
  }
}
```

Do not depend on `master` for application or deployment code. Use a tag or immutable commit SHA so installs are reproducible.

The SDK builds against its declared `@isonia/types` package dependency. Do not add TypeScript path aliases from `@isonia/types` to a sibling `../types` repository; local package linking should still preserve the package boundary. The SDK has no runtime dependency beyond `@isonia/types`.

## Usage

```ts
import { createIsoniaControlPlaneClient } from "@isonia/sdk";

const client = createIsoniaControlPlaneClient({
  baseUrl: "http://localhost:3000",
});

const organizations = await client.getOrganizations();
const policies = await client.policies.list("1");
const route = await client.getProposalRoute("1", "7");
const archive = await client.getPublicArchive("1");
const decisionRecord = await client.getDecisionRecord("1", "7");
const accountability = await client.getAccountabilityRecord("1", "7");
const resources = await client.getExternalResources("1", "7");
const executionPermissions = await client.getExecutionPermissions("1");
const diagnostics = await client.diagnostics.get();
```

## v0.8 Selector-Aware Proposal Actions

Proposal reads remain typed with the shared `ProposalDto` from `@isonia/types`. In `0.8.0-alpha.3`, that DTO may include `actionSelector` when Control Plane has indexed selector-aware protocol proposal events. The protocol proposal action identity is:

```txt
targetAddress + value + actionSelector + dataHash
```

The SDK only exposes typed REST payloads and a small presence helper:

```ts
import { hasKnownActionSelector } from "@isonia/sdk";

const proposal = await client.getProposal("1", "7");

if (hasKnownActionSelector(proposal)) {
  console.log(proposal.actionSelector);
}
```

`actionSelector` is a protocol-level `bytes4` selector field. The SDK does not decode arbitrary customer ABIs, parse calldata, look up selector names, call chain RPC, or infer authority from target-contract events.

Endpoint path helpers are exported for tests, mocks, and adapter code:

```ts
import { controlPlanePaths } from "@isonia/sdk/control-plane-paths";

const path = controlPlanePaths.proposalRoute("1", "7");
```

## v0.8 Archive and Accountability Reads

The v0.8 SDK line adds typed GET helpers for Control Plane public archive and accountability read models. These methods only fetch typed REST payloads; the SDK does not decide whether external resources, manual annotations, provider records, or accountability evidence are authoritative.

```ts
const archive = await client.archive.get("1");
const decisions = await client.decisionRecords.list("1");
const decision = await client.decisionRecords.get("1", "7");
const accountability = await client.accountability.get("1", "7");
const resources = await client.externalResources.listForProposal("1", "7");
```

Direct methods are also available:

```ts
await client.getPublicArchive("1");
await client.getDecisionRecords("1");
await client.getDecisionRecord("1", "7");
await client.getAccountabilityRecord("1", "7");
await client.getExternalResources("1", "7");
```

## v0.8 Execution Permission Registry Reads

The SDK exposes the Control Plane execution-permission registry read model through the direct client and nested helper:

```ts
const permissions = await client.getExecutionPermissions("1");
const samePermissions = await client.executionPermissions.get("1");
```

The matching path helper is available for tests, mocks, and adapters:

```ts
const path = controlPlanePaths.organizationExecutionPermissions("1");
```

Execution permission registry reads expose configured IsoniaOS protocol target and selector rules. They do not decode customer target contracts, provider records, or external tool state, and they do not make arbitrary target events governance authority.

## Admin Batch Activation Helpers

The SDK uses `@isonia/types@v0.8.0-alpha.3` and includes typed helper utilities for planning contract batch activation payloads. These helpers produce deterministic plain objects for App Core or another caller to consume; they do not execute wallet transactions, encode ABI calldata, or own runtime chain behavior.

```ts
import { createAdminBatchActivationPlan } from "@isonia/sdk";
import { ActivationExecutionMode } from "@isonia/types";

const plan = createAdminBatchActivationPlan({
  executionMode: ActivationExecutionMode.ContractBatch,
  bodies: {
    orgId: "1",
    inputs: [{ kind: "general_council", metadataURI: "ipfs://body" }],
  },
});
```

Serial activation remains the reliable fallback. Contract-level typed batch activation is the preferred v0.7 optimization when deployment capabilities support it. EIP-5792 wallet batching remains optional/prototype diagnostics and is not selected as the default mode.

The activation helper module is also available as a subpath export:

```ts
import { createAdminBatchActivationPlan } from "@isonia/sdk/activation-batch";
```

## Bootstrap Finalization Helpers

The SDK uses `@isonia/types@v0.8.0-alpha.3` and includes small planning/read helpers for bootstrap finalization. These helpers describe the intended `finalizeOrganization` call and `isOrganizationFinalized` read as deterministic plain objects; they do not execute wallet transactions, encode ABI calldata, or manage providers.

```ts
import {
  createOrganizationFinalizationPlan,
  createOrganizationFinalizationReadPlan,
  isBootstrapAdminOperationBlockedAfterFinalization,
} from "@isonia/sdk/finalization";

const finalizationPlan = createOrganizationFinalizationPlan({ orgId: "1" });
const readPlan = createOrganizationFinalizationReadPlan({ orgId: "1" });
const blocked = isBootstrapAdminOperationBlockedAfterFinalization(
  "batch_create_bodies",
);
```

Finalization is irreversible in this alpha. Finalized organizations remain active and readable, while bootstrap-admin mutation helpers can use the shared blocked-operation metadata to label or disable post-finalization bootstrap actions. Emergency/recovery flows and governance-controlled post-finalization mutation semantics are not implemented in this SDK line.

## Supported Endpoints

```txt
GET /v1/health
GET /v1/version
GET /v1/diagnostics
GET /v1/orgs
GET /v1/orgs/:orgId
GET /v1/orgs/:orgId/overview
GET /v1/orgs/:orgId/archive
GET /v1/orgs/:orgId/bodies
GET /v1/orgs/:orgId/roles
GET /v1/orgs/:orgId/mandates
GET /v1/orgs/:orgId/holders/:address/mandates
GET /v1/orgs/:orgId/policies
GET /v1/orgs/:orgId/execution-permissions
GET /v1/orgs/:orgId/decision-records
GET /v1/orgs/:orgId/proposals
GET /v1/orgs/:orgId/proposals/:proposalId
GET /v1/orgs/:orgId/proposals/:proposalId/route
GET /v1/orgs/:orgId/proposals/:proposalId/decision-record
GET /v1/orgs/:orgId/proposals/:proposalId/accountability
GET /v1/orgs/:orgId/proposals/:proposalId/external-resources
GET /v1/orgs/:orgId/graph
```

## Scripts

```txt
pnpm install
pnpm typecheck
pnpm build
pnpm test
```

The `prepare` script builds `dist` when the package is installed from GitHub.
