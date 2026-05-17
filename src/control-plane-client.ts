import type {
  AccountabilityRecordDto,
  Address,
  BodyDto,
  ChainId,
  DecisionRecordDto,
  DiagnosticsDto,
  ExternalResourceDto,
  GovernanceGraphDto,
  MandateDto,
  OrganizationDto,
  OrganizationOverviewDto,
  OrganizationPoliciesDto,
  ProposalDto,
  ProposalRouteExplanationDto,
  ProposalSummaryDto,
  PublicOrganizationArchiveDto,
  RoleDto,
} from "@isonia/types";
import { controlPlanePaths } from "./control-plane-paths";
import { IsoniaApiError } from "./errors";

export type IsoniaFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export interface IsoniaControlPlaneClientOptions {
  readonly baseUrl: string;
  readonly fetcher?: IsoniaFetch;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface IsoniaHealthDto {
  readonly status: string;
}

export interface IsoniaVersionContractsDto {
  readonly govCoreAddress?: Address;
  readonly govProposalsAddress?: Address;
}

export interface IsoniaVersionDto {
  readonly service: "isonia-control-plane" | string;
  readonly version: string;
  readonly chainId: ChainId;
  readonly contracts: IsoniaVersionContractsDto;
}

export interface IsoniaDiagnosticsClient {
  get(): Promise<DiagnosticsDto>;
}

export interface IsoniaPoliciesClient {
  list(orgId: string): Promise<OrganizationPoliciesDto>;
}

export interface IsoniaArchiveClient {
  get(orgId: string): Promise<PublicOrganizationArchiveDto>;
}

export interface IsoniaDecisionRecordsClient {
  list(orgId: string): Promise<DecisionRecordDto[]>;
  get(orgId: string, proposalId: string): Promise<DecisionRecordDto>;
}

export interface IsoniaAccountabilityClient {
  get(orgId: string, proposalId: string): Promise<AccountabilityRecordDto>;
}

export interface IsoniaExternalResourcesClient {
  listForProposal(
    orgId: string,
    proposalId: string,
  ): Promise<ExternalResourceDto[]>;
}

export interface IsoniaControlPlaneClient {
  readonly archive: IsoniaArchiveClient;
  readonly accountability: IsoniaAccountabilityClient;
  readonly decisionRecords: IsoniaDecisionRecordsClient;
  readonly diagnostics: IsoniaDiagnosticsClient;
  readonly externalResources: IsoniaExternalResourcesClient;
  readonly policies: IsoniaPoliciesClient;
  getHealth(): Promise<IsoniaHealthDto>;
  getVersion(): Promise<IsoniaVersionDto>;
  getOrganizations(): Promise<OrganizationDto[]>;
  getOrganization(orgId: string): Promise<OrganizationDto>;
  getOrganizationOverview(orgId: string): Promise<OrganizationOverviewDto>;
  getPublicArchive(orgId: string): Promise<PublicOrganizationArchiveDto>;
  getBodies(orgId: string): Promise<BodyDto[]>;
  getRoles(orgId: string): Promise<RoleDto[]>;
  getMandates(orgId: string): Promise<MandateDto[]>;
  getHolderMandates(orgId: string, address: Address): Promise<MandateDto[]>;
  getPolicies(orgId: string): Promise<OrganizationPoliciesDto>;
  getDecisionRecords(orgId: string): Promise<DecisionRecordDto[]>;
  getProposals(orgId: string): Promise<ProposalSummaryDto[]>;
  getProposal(orgId: string, proposalId: string): Promise<ProposalDto>;
  getProposalRoute(
    orgId: string,
    proposalId: string,
  ): Promise<ProposalRouteExplanationDto>;
  getDecisionRecord(
    orgId: string,
    proposalId: string,
  ): Promise<DecisionRecordDto>;
  getAccountabilityRecord(
    orgId: string,
    proposalId: string,
  ): Promise<AccountabilityRecordDto>;
  getExternalResources(
    orgId: string,
    proposalId: string,
  ): Promise<ExternalResourceDto[]>;
  getGraph(orgId: string): Promise<GovernanceGraphDto>;
}

export function createIsoniaControlPlaneClient(
  options: IsoniaControlPlaneClientOptions,
): IsoniaControlPlaneClient {
  return new DefaultIsoniaControlPlaneClient(options);
}

class DefaultIsoniaControlPlaneClient implements IsoniaControlPlaneClient {
  readonly archive: IsoniaArchiveClient;
  readonly accountability: IsoniaAccountabilityClient;
  readonly decisionRecords: IsoniaDecisionRecordsClient;
  readonly diagnostics: IsoniaDiagnosticsClient;
  readonly externalResources: IsoniaExternalResourcesClient;
  readonly policies: IsoniaPoliciesClient;
  private readonly baseUrl: string;
  private readonly fetcher: IsoniaFetch;
  private readonly headers: Readonly<Record<string, string>>;

  constructor(options: IsoniaControlPlaneClientOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.fetcher = options.fetcher ?? getDefaultFetch();
    this.headers = {
      accept: "application/json",
      ...options.headers,
    };
    this.archive = {
      get: (orgId) => this.getPublicArchive(orgId),
    };
    this.accountability = {
      get: (orgId, proposalId) =>
        this.getAccountabilityRecord(orgId, proposalId),
    };
    this.decisionRecords = {
      list: (orgId) => this.getDecisionRecords(orgId),
      get: (orgId, proposalId) => this.getDecisionRecord(orgId, proposalId),
    };
    this.diagnostics = {
      get: () => this.getDiagnostics(),
    };
    this.externalResources = {
      listForProposal: (orgId, proposalId) =>
        this.getExternalResources(orgId, proposalId),
    };
    this.policies = {
      list: (orgId) => this.getPolicies(orgId),
    };
  }

  getHealth(): Promise<IsoniaHealthDto> {
    return this.get(controlPlanePaths.health());
  }

  getVersion(): Promise<IsoniaVersionDto> {
    return this.get(controlPlanePaths.version());
  }

  getDiagnostics(): Promise<DiagnosticsDto> {
    return this.get(controlPlanePaths.diagnostics());
  }

  getOrganizations(): Promise<OrganizationDto[]> {
    return this.get(controlPlanePaths.organizations());
  }

  getOrganization(orgId: string): Promise<OrganizationDto> {
    return this.get(controlPlanePaths.organization(orgId));
  }

  getOrganizationOverview(orgId: string): Promise<OrganizationOverviewDto> {
    return this.get(controlPlanePaths.organizationOverview(orgId));
  }

  getPublicArchive(orgId: string): Promise<PublicOrganizationArchiveDto> {
    return this.get(controlPlanePaths.publicArchive(orgId));
  }

  getBodies(orgId: string): Promise<BodyDto[]> {
    return this.get(controlPlanePaths.bodies(orgId));
  }

  getRoles(orgId: string): Promise<RoleDto[]> {
    return this.get(controlPlanePaths.roles(orgId));
  }

  getMandates(orgId: string): Promise<MandateDto[]> {
    return this.get(controlPlanePaths.mandates(orgId));
  }

  getHolderMandates(orgId: string, address: Address): Promise<MandateDto[]> {
    return this.get(controlPlanePaths.holderMandates(orgId, address));
  }

  getPolicies(orgId: string): Promise<OrganizationPoliciesDto> {
    return this.get(controlPlanePaths.policies(orgId));
  }

  getDecisionRecords(orgId: string): Promise<DecisionRecordDto[]> {
    return this.get(controlPlanePaths.decisionRecords(orgId));
  }

  getProposals(orgId: string): Promise<ProposalSummaryDto[]> {
    return this.get(controlPlanePaths.proposals(orgId));
  }

  getProposal(orgId: string, proposalId: string): Promise<ProposalDto> {
    return this.get(controlPlanePaths.proposal(orgId, proposalId));
  }

  getProposalRoute(
    orgId: string,
    proposalId: string,
  ): Promise<ProposalRouteExplanationDto> {
    return this.get(controlPlanePaths.proposalRoute(orgId, proposalId));
  }

  getDecisionRecord(
    orgId: string,
    proposalId: string,
  ): Promise<DecisionRecordDto> {
    return this.get(controlPlanePaths.decisionRecord(orgId, proposalId));
  }

  getAccountabilityRecord(
    orgId: string,
    proposalId: string,
  ): Promise<AccountabilityRecordDto> {
    return this.get(controlPlanePaths.accountabilityRecord(orgId, proposalId));
  }

  getExternalResources(
    orgId: string,
    proposalId: string,
  ): Promise<ExternalResourceDto[]> {
    return this.get(controlPlanePaths.externalResources(orgId, proposalId));
  }

  getGraph(orgId: string): Promise<GovernanceGraphDto> {
    return this.get(controlPlanePaths.graph(orgId));
  }

  private async get<TResponse>(path: string): Promise<TResponse> {
    const method = "GET";
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetcher(url, {
      method,
      headers: this.headers,
    });

    if (!response.ok) {
      throw new IsoniaApiError({
        method,
        path,
        status: response.status,
        statusText: response.statusText,
        url,
        responseText: await response.text(),
      });
    }

    return (await response.json()) as TResponse;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (trimmed.length === 0) {
    throw new Error("Isonia Control Plane baseUrl must not be empty.");
  }
  return trimmed;
}

function getDefaultFetch(): IsoniaFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error(
      "No global fetch implementation is available. Pass a fetcher when creating the Isonia client.",
    );
  }
  return globalThis.fetch.bind(globalThis);
}
