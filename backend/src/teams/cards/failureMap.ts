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
      ...(scenarios.length > 0 ? scenarioItems : [
        {
          type: "Container",
          style: "good",
          bleed: true,
          spacing: "Medium",
          items: [
            {
              type: "TextBlock",
              text: "✅ No Critical Risks Detected",
              size: "Medium",
              weight: "Bolder",
              color: "Good"
            },
            {
              type: "TextBlock",
              text: "Based on the retrieved historical evidence and current operational constraints, the proposed decision carries minimal risk. You may proceed safely.",
              wrap: true
            }
          ]
        }
      ]),
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
              text: "**WHY THIS SCENARIO EXISTS**",
              color: "Attention",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: scenario.whyGenerated ? `• ${scenario.whyGenerated.join("\n• ")}` : "No reasoning available.",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**EVIDENCE**",
              color: "Accent",
              weight: "Bolder"
            },
            ...(scenario.evidence && scenario.evidence.length > 0 ? scenario.evidence.map((ev: any) => ({
              type: "TextBlock",
              text: `*Source:* **${ev.source}**\n\n*Excerpt:* "${ev.excerpt}"`,
              wrap: true,
              isSubtle: true
            })) : [{ type: "TextBlock", text: "No direct evidence provided.", wrap: true }]),
            {
              type: "TextBlock",
              text: "**REASONING CHAIN**",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: scenario.reasoning || "N/A",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Causal Chain**",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: scenario.causalChain?.join(" ➔ ") || "N/A",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Impact**",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: scenario.impact || "N/A",
              wrap: true
            },
            {
              type: "TextBlock",
              text: "**Mitigation**",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: scenario.mitigationRecommendations?.join(", ") || "N/A",
              wrap: true
            }
          ]
        }
      }
    ]
  };
}
