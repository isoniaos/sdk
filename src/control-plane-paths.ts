export type ControlPlanePathSegment = string | number | bigint;

export const CONTROL_PLANE_API_VERSION = "v1";

export const controlPlanePaths = {
  health: (): string => buildControlPlanePath("health"),
  version: (): string => buildControlPlanePath("version"),
  diagnostics: (): string => buildControlPlanePath("diagnostics"),
  organizations: (): string => buildControlPlanePath("orgs"),
  organization: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId),
  organizationOverview: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "overview"),
  publicArchive: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "archive"),
  bodies: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "bodies"),
  roles: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "roles"),
  mandates: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "mandates"),
  holderMandates: (
    orgId: ControlPlanePathSegment,
    address: ControlPlanePathSegment,
  ): string => buildControlPlanePath("orgs", orgId, "holders", address, "mandates"),
  policies: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "policies"),
  decisionRecords: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "decision-records"),
  proposals: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "proposals"),
  proposal: (
    orgId: ControlPlanePathSegment,
    proposalId: ControlPlanePathSegment,
  ): string => buildControlPlanePath("orgs", orgId, "proposals", proposalId),
  proposalRoute: (
    orgId: ControlPlanePathSegment,
    proposalId: ControlPlanePathSegment,
  ): string =>
    buildControlPlanePath("orgs", orgId, "proposals", proposalId, "route"),
  decisionRecord: (
    orgId: ControlPlanePathSegment,
    proposalId: ControlPlanePathSegment,
  ): string =>
    buildControlPlanePath(
      "orgs",
      orgId,
      "proposals",
      proposalId,
      "decision-record",
    ),
  accountabilityRecord: (
    orgId: ControlPlanePathSegment,
    proposalId: ControlPlanePathSegment,
  ): string =>
    buildControlPlanePath(
      "orgs",
      orgId,
      "proposals",
      proposalId,
      "accountability",
    ),
  externalResources: (
    orgId: ControlPlanePathSegment,
    proposalId: ControlPlanePathSegment,
  ): string =>
    buildControlPlanePath(
      "orgs",
      orgId,
      "proposals",
      proposalId,
      "external-resources",
    ),
  graph: (orgId: ControlPlanePathSegment): string =>
    buildControlPlanePath("orgs", orgId, "graph"),
} as const;

export function buildControlPlanePath(
  ...segments: readonly ControlPlanePathSegment[]
): string {
  return `/${[CONTROL_PLANE_API_VERSION, ...segments.map(encodePathSegment)].join("/")}`;
}

function encodePathSegment(segment: ControlPlanePathSegment): string {
  return encodeURIComponent(String(segment));
}
