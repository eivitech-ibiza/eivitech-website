export type CrmViewFilter =
  | "all"
  | "qualified"
  | "high"
  | "won"
  | "lost"
  | "approved"
  | `status:${string}`;

export type CrmFilterableLead = {
  status: string;
  priority: string;
  qualificationOutcome?: string | null;
};

export function isCrmQualified(lead: CrmFilterableLead): boolean {
  // The qualification milestone is explicitly stored by the workflow,
  // independent of the current funnel step or score.
  return lead.qualificationOutcome === "qualified";
}

export function filterCrmLeads<T extends CrmFilterableLead>(leads: T[], filter: CrmViewFilter): T[] {
  switch (filter) {
    case "all": return leads;
    case "qualified": return leads.filter(isCrmQualified);
    case "high": return leads.filter((lead) => lead.priority === "alta");
    case "won":
    case "approved": return leads.filter((lead) => lead.status === "won");
    case "lost": return leads.filter((lead) => lead.status === "lost");
    default:
      if (filter.startsWith("status:")) {
        const status = filter.slice("status:".length);
        return leads.filter((lead) => lead.status === status);
      }
      return leads;
  }
}
