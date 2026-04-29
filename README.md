# @isonia/sdk

Pure TypeScript SDK for IsoniaOS v0.1 Control Plane REST APIs.

## Scope

`@isonia/sdk` contains:

- typed REST client helpers for existing Control Plane endpoints;
- endpoint path construction helpers;
- shared response typing via `@isonia/types`.

It does not contain React, NestJS, UI code, SaaS code, or governance authority logic.

## Install During Early Development

Until the public beta package registry release, depend on pinned GitHub tags:

```json
{
  "dependencies": {
    "@isonia/sdk": "github:isoniaos/sdk#v0.1.0"
  }
}
```

`@isonia/sdk` depends on the matching shared type package:

```json
{
  "dependencies": {
    "@isonia/types": "github:isoniaos/types#v0.1.0"
  }
}
```

Do not depend on `master` for application or deployment code. Use a tag or immutable commit SHA so installs are reproducible.

## Usage

```ts
import { createIsoniaControlPlaneClient } from "@isonia/sdk";

const client = createIsoniaControlPlaneClient({
  baseUrl: "http://localhost:3000",
});

const organizations = await client.getOrganizations();
const route = await client.getProposalRoute("1", "7");
const diagnostics = await client.diagnostics.get();
```

Endpoint path helpers are exported for tests, mocks, and adapter code:

```ts
import { controlPlanePaths } from "@isonia/sdk/control-plane-paths";

const path = controlPlanePaths.proposalRoute("1", "7");
```

## Supported v0.1 Endpoints

```txt
GET /v1/health
GET /v1/version
GET /v1/diagnostics
GET /v1/orgs
GET /v1/orgs/:orgId
GET /v1/orgs/:orgId/overview
GET /v1/orgs/:orgId/bodies
GET /v1/orgs/:orgId/roles
GET /v1/orgs/:orgId/mandates
GET /v1/orgs/:orgId/holders/:address/mandates
GET /v1/orgs/:orgId/proposals
GET /v1/orgs/:orgId/proposals/:proposalId
GET /v1/orgs/:orgId/proposals/:proposalId/route
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
