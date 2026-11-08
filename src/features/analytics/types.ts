export interface AnalyticsSummary {
  range: { from: string; to: string };
  conversations: {
    total: number;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    byHandling: Record<string, number>;
    perDay: { date: string; count: number }[];
  };
  messages: {
    total: number;
    fromCustomers: number;
    fromAI: number;
    fromTeam: number;
    perDay: { date: string; customers: number; ai: number; team: number }[];
  };
  responseTime: { averageSeconds: number | null; conversationsMeasured: number };
  customers: { new: number; total: number };
}
