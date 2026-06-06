import { DecisionRecord } from "../decisionStore";

export function buildDecisionRecordCard(record: DecisionRecord) {
  let color = "Accent";
  if (record.status === "APPROVED") color = "Good";
  if (record.status === "DELAYED") color = "Attention";
  if (record.status === "UNDER_REVIEW") color = "Warning";

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "FORESIGHT Decision Recorded",
        weight: "Bolder",
        size: "Large"
      },
      {
        type: "TextBlock",
        text: `**Status:** ${record.status}`,
        color: color,
        size: "Medium"
      },
      {
        type: "FactSet",
        facts: [
          { title: "Decision Type", value: record.decisionText },
          { title: "Action Taken", value: record.action },
          { title: "Timestamp", value: record.timestamp },
          { title: "Scenarios Acknowledged", value: `${record.acknowledgedScenarios.length} / ${record.scenarioCount}` },
          { title: "Azure Work Items", value: record.azureWorkItems.join(", ") || "None" }
        ]
      }
    ]
  };
}
