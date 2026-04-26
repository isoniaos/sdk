const assert = require("node:assert/strict");
const test = require("node:test");

const {
  CONTROL_PLANE_API_VERSION,
  buildControlPlanePath,
  controlPlanePaths,
} = require("../dist/control-plane-paths.js");

test("exports the v0.1 API version segment", () => {
  assert.equal(CONTROL_PLANE_API_VERSION, "v1");
});

test("builds system endpoint paths", () => {
  assert.equal(controlPlanePaths.health(), "/v1/health");
  assert.equal(controlPlanePaths.version(), "/v1/version");
});

test("builds organization endpoint paths", () => {
  assert.equal(controlPlanePaths.organizations(), "/v1/orgs");
  assert.equal(controlPlanePaths.organization("1"), "/v1/orgs/1");
  assert.equal(controlPlanePaths.organizationOverview("1"), "/v1/orgs/1/overview");
});

test("builds body role and mandate endpoint paths", () => {
  const holder = "0x0000000000000000000000000000000000000001";

  assert.equal(controlPlanePaths.bodies("1"), "/v1/orgs/1/bodies");
  assert.equal(controlPlanePaths.roles("1"), "/v1/orgs/1/roles");
  assert.equal(controlPlanePaths.mandates("1"), "/v1/orgs/1/mandates");
  assert.equal(
    controlPlanePaths.holderMandates("1", holder),
    `/v1/orgs/1/holders/${holder}/mandates`,
  );
});

test("builds proposal and graph endpoint paths", () => {
  assert.equal(controlPlanePaths.proposals("1"), "/v1/orgs/1/proposals");
  assert.equal(controlPlanePaths.proposal("1", "7"), "/v1/orgs/1/proposals/7");
  assert.equal(
    controlPlanePaths.proposalRoute("1", "7"),
    "/v1/orgs/1/proposals/7/route",
  );
  assert.equal(controlPlanePaths.graph("1"), "/v1/orgs/1/graph");
});

test("encodes path segments", () => {
  assert.equal(buildControlPlanePath("orgs", "org/1"), "/v1/orgs/org%2F1");
  assert.equal(
    controlPlanePaths.proposal("space org", "proposal #1"),
    "/v1/orgs/space%20org/proposals/proposal%20%231",
  );
});
