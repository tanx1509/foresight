export interface TeamsMessage {
  message: string;
}

export interface TeamsInvocationResult {
  status: "success" | "error" | "ignored";
  response?: any;
}

export interface AgentStatus {
  agentName: string;
  status: "idle" | "running" | "completed" | "failed";
}
