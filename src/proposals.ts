import type { ProposalDto } from "@isonia/types";

export function hasKnownActionSelector(proposal: ProposalDto): boolean {
  return proposal.actionSelector !== undefined;
}
