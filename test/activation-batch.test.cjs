const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES,
  ActivationCapabilityStatus,
  ActivationExecutionMode,
  BodyKind,
  ProposalType,
  RoleType,
} = require("@isonia/types");
const {
  createAdminBatchActivationPlan,
  getAdminBatchActivationFunctionName,
  isContractBatchActivationMode,
  isSerialActivationMode,
  isWalletBatchEip5792Mode,
} = require("../dist/activation-batch.js");

const bodyInput = {
  kind: BodyKind.GeneralCouncil,
  metadataURI: "ipfs://body",
};

const roleInput = {
  bodyId: "1",
  roleType: RoleType.Approver,
  metadataURI: "ipfs://role",
};

const mandateInput = {
  roleId: "1",
  holder: "0x0000000000000000000000000000000000000001",
  startTime: "0",
  endTime: "0",
  proposalTypeMask: "15",
  spendingLimit: "0",
};

const policyRuleInput = {
  proposalType: ProposalType.Standard,
  requiredApprovalBodies: ["1"],
  vetoBodies: [],
  executorBody: "1",
  timelockSeconds: "0",
  enabled: true,
};

test("creates a contract-batch activation plan in deterministic order", () => {
  const plan = createAdminBatchActivationPlan({
    executionMode: ActivationExecutionMode.ContractBatch,
    bodies: {
      orgId: "1",
      inputs: [
        bodyInput,
        {
          kind: BodyKind.TreasuryCommittee,
          metadataURI: "ipfs://treasury",
        },
      ],
    },
    roles: {
      orgId: "1",
      inputs: [roleInput],
    },
    mandates: {
      orgId: "1",
      inputs: [mandateInput],
    },
    policyRules: {
      orgId: "1",
      inputs: [policyRuleInput],
    },
  });

  assert.equal(plan.executionMode, ActivationExecutionMode.ContractBatch);
  assert.equal(plan.fallbackExecutionMode, ActivationExecutionMode.Serial);
  assert.equal(plan.callCount, 4);
  assert.equal(plan.totalItemCount, 5);
  assert.deepEqual(
    plan.calls.map((call) => call.functionName),
    [
      ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies,
      ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateRoles,
      ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
      ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchSetPolicyRules,
    ],
  );
  assert.deepEqual(
    plan.calls.map((call) => call.group),
    ["bodies", "roles", "mandates", "policyRules"],
  );
  assert.deepEqual(
    plan.calls.map((call) => call.executionMode),
    [
      ActivationExecutionMode.ContractBatch,
      ActivationExecutionMode.ContractBatch,
      ActivationExecutionMode.ContractBatch,
      ActivationExecutionMode.ContractBatch,
    ],
  );
  assert.equal(plan.calls[0].orgId, "1");
  assert.deepEqual(plan.calls[0].inputs, [
    bodyInput,
    {
      kind: BodyKind.TreasuryCommittee,
      metadataURI: "ipfs://treasury",
    },
  ]);
});

test("omits empty batch groups", () => {
  const plan = createAdminBatchActivationPlan({
    executionMode: ActivationExecutionMode.ContractBatch,
    bodies: {
      orgId: "1",
      inputs: [],
    },
    roles: {
      orgId: "1",
      inputs: [],
    },
    mandates: {
      orgId: "1",
      inputs: [mandateInput],
    },
    policyRules: {
      orgId: "1",
      inputs: [],
    },
  });

  assert.equal(plan.callCount, 1);
  assert.equal(plan.totalItemCount, 1);
  assert.equal(
    plan.calls[0].functionName,
    ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
  );
});

test("returns shared admin batch function name constants by group", () => {
  assert.equal(
    getAdminBatchActivationFunctionName("bodies"),
    ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies,
  );
  assert.equal(
    getAdminBatchActivationFunctionName("roles"),
    ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateRoles,
  );
  assert.equal(
    getAdminBatchActivationFunctionName("mandates"),
    ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchAssignMandates,
  );
  assert.equal(
    getAdminBatchActivationFunctionName("policyRules"),
    ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchSetPolicyRules,
  );
});

test("supports serial fallback mode metadata", () => {
  const plan = createAdminBatchActivationPlan({
    executionMode: ActivationExecutionMode.Serial,
    bodies: {
      orgId: "1",
      inputs: [bodyInput],
    },
  });

  assert.equal(plan.executionMode, ActivationExecutionMode.Serial);
  assert.equal(plan.calls[0].executionMode, ActivationExecutionMode.Serial);
  assert.equal(isSerialActivationMode(plan.executionMode), true);
  assert.equal(isContractBatchActivationMode(plan.executionMode), false);
  assert.equal(isWalletBatchEip5792Mode(plan.executionMode), false);
});

test("prefers contract batch only when contract capabilities support requested calls", () => {
  const plan = createAdminBatchActivationPlan({
    capabilities: {
      availableModes: [
        ActivationExecutionMode.Serial,
        ActivationExecutionMode.ContractBatch,
      ],
      flags: {
        serial: true,
        contractBatch: true,
        walletBatchEip5792: false,
      },
      contractBatch: {
        status: ActivationCapabilityStatus.Supported,
        supportedFunctions: [
          ADMIN_BATCH_ACTIVATION_FUNCTION_NAMES.BatchCreateBodies,
        ],
      },
    },
    bodies: {
      orgId: "1",
      inputs: [bodyInput],
    },
  });

  assert.equal(plan.executionMode, ActivationExecutionMode.ContractBatch);
  assert.equal(isContractBatchActivationMode(plan.executionMode), true);
});

test("does not treat EIP-5792 wallet batch as the default mode", () => {
  const plan = createAdminBatchActivationPlan({
    capabilities: {
      availableModes: [
        ActivationExecutionMode.Serial,
        ActivationExecutionMode.WalletBatchEip5792,
      ],
      flags: {
        serial: true,
        contractBatch: false,
        walletBatchEip5792: true,
      },
      contractBatch: {
        status: ActivationCapabilityStatus.Unsupported,
        supportedFunctions: [],
      },
      walletBatchEip5792: {
        status: ActivationCapabilityStatus.Prototype,
        standard: "eip5792",
      },
    },
    bodies: {
      orgId: "1",
      inputs: [bodyInput],
    },
  });

  assert.equal(plan.executionMode, ActivationExecutionMode.Serial);
  assert.equal(isWalletBatchEip5792Mode(plan.executionMode), false);
});
