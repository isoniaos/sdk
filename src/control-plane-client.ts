import type {
  Address,
  BodyDto,
  ChainId,
  DiagnosticsDto,
  GovernanceGraphDto,
  MandateDto,
  OrganizationDto,
  OrganizationOverviewDto,
  ProposalDto,
  ProposalRouteExplanationDto,
  ProposalSummaryDto,
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

export interface IsoniaControlPlaneClient {
  readonly diagnostics: IsoniaDiagnosticsClient;
  getHealth(): Promise<IsoniaHealthDto>;
  getVersion(): Promise<IsoniaVersionDto>;
  getOrganizations(): Promise<OrganizationDto[]>;
  getOrganization(orgId: string): Promise<OrganizationDto>;
  getOrganizationOverview(orgId: string): Promise<OrganizationOverviewDto>;
  getBodies(orgId: string): Promise<BodyDto[]>;
  getRoles(orgId: string): Promise<RoleDto[]>;
  getMandates(orgId: string): Promise<MandateDto[]>;
  getHolderMandates(orgId: string, address: Address): Promise<MandateDto[]>;
  getProposals(orgId: string): Promise<ProposalSummaryDto[]>;
  getProposal(orgId: string, proposalId: string): Promise<ProposalDto>;
  getProposalRoute(
    orgId: string,
    proposalId: string,
  ): Promise<ProposalRouteExplanationDto>;
  getGraph(orgId: string): Promise<GovernanceGraphDto>;
}

export function createIsoniaControlPlaneClient(
  options: IsoniaControlPlaneClientOptions,
): IsoniaControlPlaneClient {
  return new DefaultIsoniaControlPlaneClient(options);
}

class DefaultIsoniaControlPlaneClient implements IsoniaControlPlaneClient {
  readonly diagnostics: IsoniaDiagnosticsClient;
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
    this.diagnostics = {
      get: () => this.getDiagnostics(),
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
