import {
  ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES,
  ORGANIZATION_FINALIZATION_STATUSES,
  POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS,
  type BootstrapAdminOperation,
  type NumericString,
  type OrganizationFinalizationContractFunctionName,
  type OrganizationFinalizationStatus,
} from "@isonia/types";

export type OrganizationFinalizationFunctionKind = "finalize" | "read";

export type OrganizationFinalizationRequiredSignerRole = "bootstrap_admin";

export type PostFinalizationBlockedBootstrapAdminOperation =
  (typeof POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS)[number];

export interface CreateOrganizationFinalizationPlanInput {
  readonly orgId: NumericString;
  readonly label?: string;
}

export interface CreateOrganizationFinalizationReadPlanInput {
  readonly orgId: NumericString;
  readonly label?: string;
}

export interface OrganizationFinalizationPlan {
  readonly kind: "organization_finalization";
  readonly functionName: typeof ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.FinalizeOrganization;
  readonly orgId: NumericString;
  readonly itemCount: 1;
  readonly label: string;
  readonly requiredSignerRole: OrganizationFinalizationRequiredSignerRole;
  readonly irreversible: true;
  readonly blockedBootstrapAdminOperationsAfterFinalization: readonly PostFinalizationBlockedBootstrapAdminOperation[];
}

export interface OrganizationFinalizationReadPlan {
  readonly kind: "organization_finalization_read";
  readonly functionName: typeof ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.IsOrganizationFinalized;
  readonly orgId: NumericString;
  readonly itemCount: 1;
  readonly label: string;
  readonly readOnly: true;
}

const FUNCTION_NAMES_BY_KIND = {
  finalize: ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.FinalizeOrganization,
  read: ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.IsOrganizationFinalized,
} as const satisfies Readonly<
  Record<
    OrganizationFinalizationFunctionKind,
    OrganizationFinalizationContractFunctionName
  >
>;

export function createOrganizationFinalizationPlan(
  input: CreateOrganizationFinalizationPlanInput,
): OrganizationFinalizationPlan {
  return {
    kind: "organization_finalization",
    functionName:
      ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.FinalizeOrganization,
    orgId: input.orgId,
    itemCount: 1,
    label: input.label ?? "Finalize organization",
    requiredSignerRole: "bootstrap_admin",
    irreversible: true,
    blockedBootstrapAdminOperationsAfterFinalization:
      POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS,
  };
}

export function createOrganizationFinalizationReadPlan(
  input: CreateOrganizationFinalizationReadPlanInput,
): OrganizationFinalizationReadPlan {
  return {
    kind: "organization_finalization_read",
    functionName:
      ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.IsOrganizationFinalized,
    orgId: input.orgId,
    itemCount: 1,
    label: input.label ?? "Read organization finalization status",
    readOnly: true,
  };
}

export function getOrganizationFinalizationFunctionName(
  kind: OrganizationFinalizationFunctionKind,
): OrganizationFinalizationContractFunctionName {
  return FUNCTION_NAMES_BY_KIND[kind];
}

export function isOrganizationFinalizedStatus(
  status: OrganizationFinalizationStatus,
): status is typeof ORGANIZATION_FINALIZATION_STATUSES.Finalized {
  return status === ORGANIZATION_FINALIZATION_STATUSES.Finalized;
}

export function isOrganizationNotFinalizedStatus(
  status: OrganizationFinalizationStatus,
): status is typeof ORGANIZATION_FINALIZATION_STATUSES.NotFinalized {
  return status === ORGANIZATION_FINALIZATION_STATUSES.NotFinalized;
}

export function isBootstrapAdminOperationBlockedAfterFinalization(
  operation: BootstrapAdminOperation | string,
): operation is PostFinalizationBlockedBootstrapAdminOperation {
  return POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS.includes(
    operation as PostFinalizationBlockedBootstrapAdminOperation,
  );
}
