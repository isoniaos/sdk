# IsoniaOS SDK Agent Rules

These rules apply to Codex and other AI agents working in `sdk`.

## Repository Purpose

`@isonia/sdk` provides typed clients and helpers for IsoniaOS consumers.

Primary responsibilities:

- typed REST clients for Control Plane endpoints;
- request path construction and response typing;
- viem-based protocol helpers where useful;
- contract address and deployment helper types;
- route, proposal, source disclosure, accountability, and capability helpers that are generic and UI-free.

## Dependency Boundaries

Allowed dependencies:

```txt
@isonia/types
viem
```

Do not add:

- React;
- App Core imports;
- Control Plane internals;
- SaaS imports;
- provider UI packages;
- provider API assumptions;
- demo-stack or integration-lab fixture assumptions.

## App Core Boundary

Endpoint helpers belong in the SDK before App Core duplicates fetch wrappers.

When a typed SDK method exists, App Core should use it rather than bypassing the SDK.

The SDK is not a source of governance authority. It should expose typed access and helpers, not decide protocol truth.

## Provider and Runtime Rules

- Do not treat external providers as IsoniaOS authority by default.
- Do not add Snapshot, Safe, Tally, Agora, GitHub, Discourse, or block explorer API behavior unless explicitly scoped as generic adapter/client work.
- Do not infer runtime capability from package version strings.
- Use explicit deployment profile and capability metadata where runtime capability needs to be represented.

## Versioning and Claims

- Keep package versions as SemVer without a leading `v`.
- Do not create Git tags automatically.
- Update `CHANGELOG.md` under `Unreleased` for user-visible SDK changes.
- Do not introduce production, audit, public beta, SaaS, legal, provider-completeness, or ISO launch-readiness claims.

## Verification

For SDK behavior changes, run the strongest relevant subset:

- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm build`
- `git diff --check`

For AGENTS-only changes, `git diff --check` is sufficient.
