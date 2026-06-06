import { AgentActivityFeed } from "../activityStore";

export interface ActivityFeedCard {
  type: "AdaptiveCard";
  $schema: string;
  version: string;
  body: any[];
}

export function buildActivityFeedCard(feed: AgentActivityFeed): ActivityFeedCard {
  const agentFacts = feed.agents.map(agent => {
    let icon = "⏳";
    if (agent.status === "completed") icon = "✓";
    if (agent.status === "failed") icon = "❌";
    if (agent.status === "waiting") icon = "🕒";

    let statusText = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
    let value = `${icon} ${statusText}`;
    if (agent.durationMs !== undefined) {
      value += ` (${agent.durationMs}ms)`;
    }

    return {
      title: agent.agentName,
      value
    };
  });

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "FORESIGHT Analysis",
        weight: "Bolder",
        size: "Medium"
      },
      {
        type: "FactSet",
        facts: agentFacts
      }
    ]
  };
}
