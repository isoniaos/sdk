const assert = require("node:assert/strict");
const test = require("node:test");

const {
  CONTROL_PLANE_API_VERSION,
  buildControlPlanePath,
  controlPlanePaths,
} = require("../dist/control-plane-paths.js");
const { createIsoniaControlPlaneClient } = require("../dist/index.js");

test("exports the v0.1 API version segment", () => {
  assert.equal(CONTROL_PLANE_API_VERSION, "v1");
});

test("builds system endpoint paths", () => {
  assert.equal(controlPlanePaths.health(), "/v1/health");
  assert.equal(controlPlanePaths.version(), "/v1/version");
  assert.equal(controlPlanePaths.diagnostics(), "/v1/diagnostics");
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
  assert.equal(controlPlanePaths.policies("1"), "/v1/orgs/1/policies");
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

test("fetches diagnostics through the nested diagnostics client", async () => {
  const diagnostics = {
    apiVersion: "v1",
    chainId: 31337,
    confirmations: 5,
    contracts: [],
    latestChainBlock: "120",
    latestSafeBlock: "115",
    lastScannedBlocks: [],
    rawEventCounts: {
      observed: 0,
      confirmed: 1,
      processed: 2,
      failed: 0,
      orphaned: 0,
    },
    projectionBacklog: 1,
    failedProjectionCount: 0,
    staleDataIndicators: [],
    generatedAt: "2026-04-29T12:00:00.000Z",
  };
  const calls = [];
  const client = createIsoniaControlPlaneClient({
    baseUrl: "http://localhost:3000/",
    fetcher: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => diagnostics,
      };
    },
  });

  assert.deepEqual(await client.diagnostics.get(), diagnostics);
  assert.equal(calls[0].url, "http://localhost:3000/v1/diagnostics");
  assert.equal(calls[0].init.method, "GET");
});

test("fetches policies through the nested policies client", async () => {
  const policies = [
    {
      chainId: 31337,
      orgId: "1",
      proposalType: "standard",
      version: "2",
      requiredApprovalBodies: ["1", "2"],
      vetoBodies: ["9"],
      executorBody: "3",
      timelockSeconds: "60",
      enabled: true,
      dataStatus: "confirmed",
    },
  ];
  const calls = [];
  const client = createIsoniaControlPlaneClient({
    baseUrl: "http://localhost:3000/",
    fetcher: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => policies,
      };
    },
  });

  assert.deepEqual(await client.policies.list("1"), policies);
  assert.equal(calls[0].url, "http://localhost:3000/v1/orgs/1/policies");
  assert.equal(calls[0].init.method, "GET");
});
