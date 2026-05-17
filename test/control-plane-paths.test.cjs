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

test("builds public archive and accountability endpoint paths", () => {
  assert.equal(controlPlanePaths.publicArchive("1"), "/v1/orgs/1/archive");
  assert.equal(
    controlPlanePaths.decisionRecords("1"),
    "/v1/orgs/1/decision-records",
  );
  assert.equal(
    controlPlanePaths.decisionRecord("1", "7"),
    "/v1/orgs/1/proposals/7/decision-record",
  );
  assert.equal(
    controlPlanePaths.accountabilityRecord("1", "7"),
    "/v1/orgs/1/proposals/7/accountability",
  );
  assert.equal(
    controlPlanePaths.externalResources("1", "7"),
    "/v1/orgs/1/proposals/7/external-resources",
  );
});

test("encodes path segments", () => {
  assert.equal(buildControlPlanePath("orgs", "org/1"), "/v1/orgs/org%2F1");
  assert.equal(
    controlPlanePaths.proposal("space org", "proposal #1"),
    "/v1/orgs/space%20org/proposals/proposal%20%231",
  );
  assert.equal(
    controlPlanePaths.publicArchive("space org"),
    "/v1/orgs/space%20org/archive",
  );
  assert.equal(
    controlPlanePaths.decisionRecords("org/1"),
    "/v1/orgs/org%2F1/decision-records",
  );
  assert.equal(
    controlPlanePaths.decisionRecord("space org", "proposal #1"),
    "/v1/orgs/space%20org/proposals/proposal%20%231/decision-record",
  );
  assert.equal(
    controlPlanePaths.accountabilityRecord("space org", "proposal #1"),
    "/v1/orgs/space%20org/proposals/proposal%20%231/accountability",
  );
  assert.equal(
    controlPlanePaths.externalResources("space org", "proposal #1"),
    "/v1/orgs/space%20org/proposals/proposal%20%231/external-resources",
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

test("fetches public archive and accountability read models through direct client methods", async () => {
  const archive = {
    organization: { chainId: 31337, orgId: "1", name: "Demo", status: "active" },
    counts: {
      activeProposals: 1,
      approvedAwaitingExecution: 0,
      executedDecisions: 2,
      failedOrCancelledFollowThrough: 0,
      proposalsWithMissingEvidence: 0,
      manualOnlyStatusRecords: 0,
    },
    proposals: [],
  };
  const decisionRecord = {
    id: "decision-7",
    orgId: "1",
    proposalId: "7",
    decisionResult: "approved",
    requiresExecution: true,
    evidence: [],
    timestamps: {},
  };
  const accountabilityRecord = {
    id: "accountability-7",
    orgId: "1",
    proposalId: "7",
    executionStatus: "pending",
    externalProofs: [],
    manualUpdates: [],
  };
  const externalResources = [
    {
      id: "resource-1",
      orgId: "1",
      proposalId: "7",
      provider: "manual",
      relation: "evidence",
      url: "https://example.com/evidence",
      sourceLabel: "manual",
      trustBoundary: "external",
      authorityClaim: "non_authoritative",
    },
  ];
  const responses = [
    archive,
    decisionRecord,
    accountabilityRecord,
    externalResources,
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
        json: async () => responses.shift(),
      };
    },
  });

  assert.deepEqual(await client.getPublicArchive("1"), archive);
  assert.deepEqual(await client.getDecisionRecord("1", "7"), decisionRecord);
  assert.deepEqual(
    await client.getAccountabilityRecord("1", "7"),
    accountabilityRecord,
  );
  assert.deepEqual(await client.getExternalResources("1", "7"), externalResources);

  assert.deepEqual(
    calls.map((call) => [call.url, call.init.method]),
    [
      ["http://localhost:3000/v1/orgs/1/archive", "GET"],
      [
        "http://localhost:3000/v1/orgs/1/proposals/7/decision-record",
        "GET",
      ],
      ["http://localhost:3000/v1/orgs/1/proposals/7/accountability", "GET"],
      [
        "http://localhost:3000/v1/orgs/1/proposals/7/external-resources",
        "GET",
      ],
    ],
  );
});
