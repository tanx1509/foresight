export interface AgentStatus {
  agentName: string;
  status: "waiting" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface AgentActivityFeed {
  decisionId: string;
  agents: AgentStatus[];
}

const activityStore = new Map<string, AgentActivityFeed>();

export function initializeActivity(decisionId: string, agents: string[]) {
  activityStore.set(decisionId, {
    decisionId,
    agents: agents.map(name => ({ agentName: name, status: "waiting" }))
  });
}

export function startAgent(decisionId: string, agentName: string) {
  const feed = activityStore.get(decisionId);
  if (!feed) return;
  const agent = feed.agents.find(a => a.agentName === agentName);
  if (agent) {
    agent.status = "running";
    agent.startedAt = new Date().toISOString();
  }
}

export function completeAgent(decisionId: string, agentName: string, status: "completed" | "failed" = "completed") {
  const feed = activityStore.get(decisionId);
  if (!feed) return;
  const agent = feed.agents.find(a => a.agentName === agentName);
  if (agent && agent.startedAt) {
    agent.status = status;
    agent.completedAt = new Date().toISOString();
    agent.durationMs = new Date(agent.completedAt).getTime() - new Date(agent.startedAt).getTime();
  }
}

export function getActivity(decisionId: string): AgentActivityFeed | undefined {
  return activityStore.get(decisionId);
}

export function getLatestActivity(): AgentActivityFeed | undefined {
  const values = Array.from(activityStore.values());
  return values[values.length - 1];
}
