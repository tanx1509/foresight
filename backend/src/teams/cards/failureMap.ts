export function buildFailureMapCard(simulation: any, decisionId: string) {
  const { context, scenarios, decisionRecords } = simulation;

  const scenarioItems = scenarios.map((scenario: any) => {
    const dr = decisionRecords?.find((r: any) => r.scenarioId === scenario.id);
    
    let color = "Good";
    if (scenario.severity === "Critical") color = "Attention";
    else if (scenario.severity === "High") color = "Warning";
    else if (scenario.severity === "Medium") color = "Warning";
    else if (scenario.severity === "Low") color = "Accent";
    
    return {
      type: "Container",
      style: "emphasis",
      bleed: true,
      spacing: "Medium",
      items: [
        {
          type: "TextBlock",
          text: `**${scenario.title}**`,
          size: "Medium",
          color: color
        },
        {
          type: "FactSet",
          facts: [
            { title: "Severity", value: scenario.severity },
            { title: "Evidence", value: `${scenario.supportingEvidenceIds?.length || dr?.evidence?.length || 0} Sources` },
            ...(dr?.azureWorkItemId ? [{ title: "Azure ID", value: `${dr.azureWorkItemId}` }] : [])
          ]
        },
        buildScenarioDetail(scenario, dr)
      ]
    };
  });

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "FORESIGHT Failure Simulation",
        weight: "Bolder",
        size: "Large"
      },
      {
        type: "FactSet",
        facts: [
          { title: "Decision Type", value: context.decisionType },
          { title: "Confidence", value: context.confidence },
          { title: "Generated", value: new Date().toISOString() },
          { title: "Scenarios", value: `${scenarios.length}` }
        ]
      },
      ...scenarioItems,
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.Submit",
            title: "Acknowledge & Proceed",
            style: "positive",
            data: {
              action: "acknowledgeAndProceed",
              decisionId: decisionId
            }
          },
          {
            type: "Action.Submit",
            title: "Request Review",
            data: {
              action: "requestReview",
              decisionId: decisionId
            }
          },
          {
            type: "Action.Submit",
            title: "Delay Decision",
            style: "destructive",
            data: {
              action: "delayDecision",
              decisionId: decisionId
            }
          }
        ]
      }
    ]
  };
}

function buildScenarioDetail(scenario: any, dr: any) {
  return {
    type: "ActionSet",
    actions: [
      {
        type: "Action.ShowCard",
        title: "View Details",
        card: {
          type: "AdaptiveCard",
          body: [
            {
              type: "TextBlock",
              text: "**Causal Chain**"
            },
            {
              type: "TextBlock",
              text: scenario.causalChain?.join(" ➔ ") || "N/A",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Impact**"
            },
            {
              type: "TextBlock",
              text: scenario.impact || "N/A",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Mitigation**"
            },
            {
              type: "TextBlock",
              text: scenario.mitigationRecommendations?.join(", ") || "N/A",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Evidence Sources**"
            },
            {
              type: "TextBlock",
              text: dr?.evidence?.join(", ") || "None",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Constraints**"
            },
            {
              type: "TextBlock",
              text: dr?.constraints?.join("\n") || "None",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Assumptions**"
            },
            {
              type: "TextBlock",
              text: dr?.assumptions?.join("\n") || "None",
              wrap: true
            }
          ]
        }
      }
    ]
  };
}
