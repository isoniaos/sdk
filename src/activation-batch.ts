import {
  ActivationCapabilityStatus,
  ActivationExecutionMode,
  ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES,
  type ActivationCapabilities,
  type AdminBatchActivationFunctionName,
  type BatchAssignMandatesInput,
  type BatchCreateBodiesInput,
  type BatchCreateRolesInput,
  type BatchSetPolicyRulesInput,
  type BodyCreateInput,
  type MandateAssignInput,
  type NumericString,
  type PolicyRuleSetInput,
  type RoleCreateInput,
} from "@isonia/types";

export type AdminBatchActivationGroupName =
  | "bodies"
  | "roles"
  | "mandates"
  | "policyRules";

export interface CreateAdminBatchActivationPlanInput {
  readonly bodies?: BatchCreateBodiesInput;
  readonly roles?: BatchCreateRolesInput;
  readonly mandates?: BatchAssignMandatesInput;
  readonly policyRules?: BatchSetPolicyRulesInput;
  readonly executionMode?: ActivationExecutionMode;
  readonly capabilities?: ActivationCapabilities;
}

interface AdminBatchActivationPlanCallBase<
  TGroupName extends AdminBatchActivationGroupName,
  TFunctionName extends AdminBatchActivationFunctionName,
  TInput,
> {
  readonly group: TGroupName;
  readonly functionName: TFunctionName;
  readonly orgId: NumericString;
  readonly inputs: readonly TInput[];
  readonly itemCount: number;
  readonly executionMode: ActivationExecutionMode;
  readonly label: string;
}

export type CreateBodiesActivationPlanCall = AdminBatchActivationPlanCallBase<
  "bodies",
  typeof ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies,
  BodyCreateInput
>;

export type CreateRolesActivationPlanCall = AdminBatchActivationPlanCallBase<
  "roles",
  typeof ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateRoles,
  RoleCreateInput
>;

export type AssignMandatesActivationPlanCall = AdminBatchActivationPlanCallBase<
  "mandates",
  typeof ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
  MandateAssignInput
>;

export type SetPolicyRulesActivationPlanCall =
  AdminBatchActivationPlanCallBase<
    "policyRules",
    typeof ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchSetPolicyRules,
    PolicyRuleSetInput
  >;

export type AdminBatchActivationPlanCall =
  | CreateBodiesActivationPlanCall
  | CreateRolesActivationPlanCall
  | AssignMandatesActivationPlanCall
  | SetPolicyRulesActivationPlanCall;

export interface AdminBatchActivationPlan {
  readonly executionMode: ActivationExecutionMode;
  readonly fallbackExecutionMode: ActivationExecutionMode.Serial;
  readonly calls: readonly AdminBatchActivationPlanCall[];
  readonly callCount: number;
  readonly totalItemCount: number;
}

const FUNCTION_NAMES_BY_GROUP = {
  bodies: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies,
  roles: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateRoles,
  mandates: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
  policyRules: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchSetPolicyRules,
} as const satisfies Readonly<
  Record<AdminBatchActivationGroupName, AdminBatchActivationFunctionName>
>;

export function createAdminBatchActivationPlan(
  input: CreateAdminBatchActivationPlanInput,
): AdminBatchActivationPlan {
  const requestedFunctionNames = getRequestedFunctionNames(input);
  const executionMode =
    input.executionMode ??
    getDefaultExecutionMode(input.capabilities, requestedFunctionNames);
  const calls = createPlanCalls(input, executionMode);

  return {
    executionMode,
    fallbackExecutionMode: ActivationExecutionMode.Serial,
    calls,
    callCount: calls.length,
    totalItemCount: calls.reduce((total, call) => total + call.itemCount, 0),
  };
}

export function getAdminBatchActivationFunctionName(
  groupName: AdminBatchActivationGroupName,
): AdminBatchActivationFunctionName {
  return FUNCTION_NAMES_BY_GROUP[groupName];
}

export function isContractBatchActivationMode(
  mode: ActivationExecutionMode,
): mode is ActivationExecutionMode.ContractBatch {
  return mode === ActivationExecutionMode.ContractBatch;
}

export function isSerialActivationMode(
  mode: ActivationExecutionMode,
): mode is ActivationExecutionMode.Serial {
  return mode === ActivationExecutionMode.Serial;
}

export function isWalletBatchEip5792Mode(
  mode: ActivationExecutionMode,
): mode is ActivationExecutionMode.WalletBatchEip5792 {
  return mode === ActivationExecutionMode.WalletBatchEip5792;
}

function getRequestedFunctionNames(
  input: CreateAdminBatchActivationPlanInput,
): readonly AdminBatchActivationFunctionName[] {
  const functionNames: AdminBatchActivationFunctionName[] = [];

  if (hasItems(input.bodies)) {
    functionNames.push(ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies);
  }

  if (hasItems(input.roles)) {
    functionNames.push(ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateRoles);
  }

  if (hasItems(input.mandates)) {
    functionNames.push(
      ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
    );
  }

  if (hasItems(input.policyRules)) {
    functionNames.push(
      ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchSetPolicyRules,
    );
  }

  return functionNames;
}

function getDefaultExecutionMode(
  capabilities: ActivationCapabilities | undefined,
  requestedFunctionNames: readonly AdminBatchActivationFunctionName[],
): ActivationExecutionMode {
  if (
    isContractBatchSupportedForRequestedFunctions(
      capabilities,
      requestedFunctionNames,
    )
  ) {
    return ActivationExecutionMode.ContractBatch;
  }

  return ActivationExecutionMode.Serial;
}

function isContractBatchSupportedForRequestedFunctions(
  capabilities: ActivationCapabilities | undefined,
  requestedFunctionNames: readonly AdminBatchActivationFunctionName[],
): boolean {
  if (
    capabilities === undefined ||
    !capabilities.flags.contractBatch ||
    capabilities.contractBatch.status !== ActivationCapabilityStatus.Supported
  ) {
    return false;
  }

  const supportedFunctions = new Set(
    capabilities.contractBatch.supportedFunctions,
  );
  return requestedFunctionNames.every((functionName) =>
    supportedFunctions.has(functionName),
  );
}

function createPlanCalls(
  input: CreateAdminBatchActivationPlanInput,
  executionMode: ActivationExecutionMode,
): AdminBatchActivationPlanCall[] {
  const calls: AdminBatchActivationPlanCall[] = [];

  if (hasItems(input.bodies)) {
    calls.push({
      group: "bodies",
      functionName: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies,
      orgId: input.bodies.orgId,
      inputs: input.bodies.inputs,
      itemCount: input.bodies.inputs.length,
      executionMode,
      label: "Create bodies",
    });
  }

  if (hasItems(input.roles)) {
    calls.push({
      group: "roles",
      functionName: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateRoles,
      orgId: input.roles.orgId,
      inputs: input.roles.inputs,
      itemCount: input.roles.inputs.length,
      executionMode,
      label: "Create roles",
    });
  }

  if (hasItems(input.mandates)) {
    calls.push({
      group: "mandates",
      functionName: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
      orgId: input.mandates.orgId,
      inputs: input.mandates.inputs,
      itemCount: input.mandates.inputs.length,
      executionMode,
      label: "Assign mandates",
    });
  }

  if (hasItems(input.policyRules)) {
    calls.push({
      group: "policyRules",
      functionName: ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchSetPolicyRules,
      orgId: input.policyRules.orgId,
      inputs: input.policyRules.inputs,
      itemCount: input.policyRules.inputs.length,
      executionMode,
      label: "Set policy rules",
    });
  }

  return calls;
}

function hasItems<TInput>(
  batch: { readonly inputs: readonly TInput[] } | undefined,
): batch is { readonly inputs: readonly TInput[] } {
  return batch !== undefined && batch.inputs.length > 0;
}
