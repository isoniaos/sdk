const assert = require("node:assert/strict");
const test = require("node:test");

const {
  BOOTSTRAP_ADMIN_OPERATIONS,
  ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES,
  ORGANIZATION_FINALIZATION_STATUSES,
  POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS,
} = require("@isonia/types");
const {
  createOrganizationFinalizationPlan,
  createOrganizationFinalizationReadPlan,
  getOrganizationFinalizationFunctionName,
  isBootstrapAdminOperationBlockedAfterFinalization,
  isOrganizationFinalizedStatus,
  isOrganizationNotFinalizedStatus,
} = require("../dist/finalization.js");
const rootExports = require("../dist/index.js");

test("creates an irreversible organization finalization plan", () => {
  const plan = createOrganizationFinalizationPlan({ orgId: "1" });

  assert.equal(plan.kind, "organization_finalization");
  assert.equal(
    plan.functionName,
    ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.FinalizeOrganization,
  );
  assert.equal(plan.orgId, "1");
  assert.equal(plan.itemCount, 1);
  assert.equal(plan.label, "Finalize organization");
  assert.equal(plan.requiredSignerRole, "bootstrap_admin");
  assert.equal(plan.irreversible, true);
  assert.deepEqual(
    plan.blockedBootstrapAdminOperationsAfterFinalization,
    POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS,
  );
});

test("exports finalization helpers from the root package", () => {
  assert.equal(
    rootExports.createOrganizationFinalizationPlan,
    createOrganizationFinalizationPlan,
  );
  assert.equal(
    rootExports.createOrganizationFinalizationReadPlan,
    createOrganizationFinalizationReadPlan,
  );
  assert.equal(
    rootExports.isBootstrapAdminOperationBlockedAfterFinalization,
    isBootstrapAdminOperationBlockedAfterFinalization,
  );
});

test("creates an organization finalization read plan", () => {
  const plan = createOrganizationFinalizationReadPlan({ orgId: "1" });

  assert.equal(plan.kind, "organization_finalization_read");
  assert.equal(
    plan.functionName,
    ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.IsOrganizationFinalized,
  );
  assert.equal(plan.orgId, "1");
  assert.equal(plan.itemCount, 1);
  assert.equal(plan.label, "Read organization finalization status");
  assert.equal(plan.readOnly, true);
});

test("returns shared organization finalization function names by helper kind", () => {
  assert.equal(
    getOrganizationFinalizationFunctionName("finalize"),
    ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.FinalizeOrganization,
  );
  assert.equal(
    getOrganizationFinalizationFunctionName("read"),
    ORGANIZATION_FINALIZATION_CONTRACT_FUNCTION_NAMES.IsOrganizationFinalized,
  );
});

test("identifies finalized and not-finalized statuses", () => {
  assert.equal(
    isOrganizationFinalizedStatus(
      ORGANIZATION_FINALIZATION_STATUSES.Finalized,
    ),
    true,
  );
  assert.equal(
    isOrganizationFinalizedStatus(
      ORGANIZATION_FINALIZATION_STATUSES.NotFinalized,
    ),
    false,
  );
  assert.equal(
    isOrganizationNotFinalizedStatus(
      ORGANIZATION_FINALIZATION_STATUSES.NotFinalized,
    ),
    true,
  );
  assert.equal(
    isOrganizationNotFinalizedStatus(ORGANIZATION_FINALIZATION_STATUSES.Unknown),
    false,
  );
});

test("identifies bootstrap admin operations blocked after finalization", () => {
  for (const operation of POST_FINALIZATION_BLOCKED_BOOTSTRAP_ADMIN_OPERATIONS) {
    assert.equal(
      isBootstrapAdminOperationBlockedAfterFinalization(operation),
      true,
      operation,
    );
  }
});

test("does not block unknown or non-bootstrap operation names", () => {
  assert.equal(
    isBootstrapAdminOperationBlockedAfterFinalization("unknown_operation"),
    false,
  );
});

test("uses the shared blocked operation set for batch activation operations", () => {
  assert.equal(
    isBootstrapAdminOperationBlockedAfterFinalization(
      BOOTSTRAP_ADMIN_OPERATIONS.BatchCreateBodies,
    ),
    true,
  );
  assert.equal(
    isBootstrapAdminOperationBlockedAfterFinalization(
      BOOTSTRAP_ADMIN_OPERATIONS.BatchCreateRoles,
    ),
    true,
  );
  assert.equal(
    isBootstrapAdminOperationBlockedAfterFinalization(
      BOOTSTRAP_ADMIN_OPERATIONS.BatchAssignMandates,
    ),
    true,
  );
  assert.equal(
    isBootstrapAdminOperationBlockedAfterFinalization(
      BOOTSTRAP_ADMIN_OPERATIONS.BatchSetPolicyRules,
    ),
    true,
  );
});
