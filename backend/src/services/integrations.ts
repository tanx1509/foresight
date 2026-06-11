import axios from "axios";
import { FailureSimulation } from "@foresight/shared";
import { getCurrentSprint } from "./azureDevops";

export type IntegrationId = "azure" | "teams" | "copilot" | "sharechat";

export interface IntegrationStatus {
  id: IntegrationId;
  name: string;
  configured: boolean;
  status: "ready" | "missing_config" | "error";
  description: string;
  requiredEnv: string[];
  optionalEnv?: string[];
  setupUrl: string;
  details?: string;
}

interface IntegrationMessage {
  title: string;
  text: string;
  decisionId?: string;
  url?: string;
}

const appBaseUrl = () => process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const apiBaseUrl = () => process.env.PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function hasAll(keys: string[]) {
  return keys.every((key) => {
    const value = process.env[key]?.trim();
    return Boolean(value) && !value.includes("YOUR_") && !value.includes("YOUR-") && !value.includes("example.com");
  });
}

function status(
  id: IntegrationId,
  name: string,
  description: string,
  requiredEnv: string[],
  setupUrl: string,
  optionalEnv?: string[]
): IntegrationStatus {
  const configured = hasAll(requiredEnv);
  return {
    id,
    name,
    configured,
    status: configured ? "ready" : "missing_config",
    description,
    requiredEnv,
    optionalEnv,
    setupUrl
  };
}

export function getIntegrationStatuses(): IntegrationStatus[] {
  return [
    status(
      "azure",
      "Azure",
      "Azure OpenAI powers agent reasoning, Azure AI Search can retrieve memory, and Azure DevOps creates mitigation work items.",
      ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_DEVOPS_ORG_URL", "AZURE_DEVOPS_PROJECT", "AZURE_DEVOPS_TEAM", "AZURE_DEVOPS_PAT"],
      "https://portal.azure.com/",
      ["AZURE_OPENAI_DEPLOYMENT", "AZURE_OPENAI_API_VERSION", "AZURE_SEARCH_ENDPOINT", "AZURE_SEARCH_KEY", "AZURE_SEARCH_INDEX", "AZURE_DEVOPS_WORK_ITEM_TYPE"]
    ),
    status(
      "teams",
      "Microsoft Teams",
      "Posts simulation summaries to a Teams channel and accepts bot-style messages through /api/teams/message.",
      ["TEAMS_WEBHOOK_URL"],
      "https://teams.microsoft.com/",
      ["TEAMS_BOT_APP_ID", "TEAMS_BOT_PASSWORD", "TEAMS_CHANNEL_ID"]
    ),
    status(
      "copilot",
      "Microsoft Copilot",
      "Exposes /api/copilot/simulate for Copilot Studio actions and can notify a configured Copilot webhook.",
      ["COPILOT_WEBHOOK_URL"],
      "https://copilotstudio.microsoft.com/",
      ["COPILOT_AGENT_ID", "COPILOT_TENANT_ID", "COPILOT_API_KEY"]
    ),
    status(
      "sharechat",
      "ShareChat",
      "Sends approved decision summaries to a configured ShareChat webhook or automation bridge.",
      ["SHARECHAT_WEBHOOK_URL"],
      "https://sharechat.com/",
      ["SHARECHAT_BOT_TOKEN", "SHARECHAT_CHANNEL_ID"]
    )
  ];
}

function formatSimulationSummary(simulation: FailureSimulation, decisionId?: string): IntegrationMessage {
  const title = simulation.context?.decisionType || "FORESIGHT Decision Simulation";
  const topScenario = simulation.scenarios?.[0];
  const risk = topScenario ? `${topScenario.severity}: ${topScenario.title}` : "No critical scenario generated";
  const confidence = simulation.confidenceBreakdown?.overall ?? simulation.context?.confidence ?? "unknown";
  const decisionUrl = decisionId ? `${appBaseUrl()}/plan/${decisionId}` : appBaseUrl();

  return {
    title,
    decisionId,
    url: decisionUrl,
    text: [
      `Decision: ${title}`,
      `Top risk: ${risk}`,
      `Confidence: ${confidence}`,
      `Recommended path: ${simulation.options?.[0]?.title || "Review simulation dashboard"}`,
      `Open: ${decisionUrl}`
    ].join("\n")
  };
}

async function postTeams(message: IntegrationMessage) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true, reason: "TEAMS_WEBHOOK_URL is not configured" };

  await axios.post(webhookUrl, {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: message.title,
    themeColor: "0F6CBD",
    title: `FORESIGHT: ${message.title}`,
    text: message.text.replace(/\n/g, "<br/>"),
    potentialAction: message.url ? [{
      "@type": "OpenUri",
      name: "Open decision",
      targets: [{ os: "default", uri: message.url }]
    }] : []
  });

  return { skipped: false };
}

async function postCopilot(message: IntegrationMessage) {
  const webhookUrl = process.env.COPILOT_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true, reason: "COPILOT_WEBHOOK_URL is not configured" };

  await axios.post(
    webhookUrl,
    {
      source: "foresight",
      type: "decision.simulation",
      title: message.title,
      text: message.text,
      decisionId: message.decisionId,
      url: message.url
    },
    process.env.COPILOT_API_KEY
      ? { headers: { Authorization: `Bearer ${process.env.COPILOT_API_KEY}` } }
      : undefined
  );

  return { skipped: false };
}

async function postShareChat(message: IntegrationMessage) {
  const webhookUrl = process.env.SHARECHAT_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true, reason: "SHARECHAT_WEBHOOK_URL is not configured" };

  await axios.post(
    webhookUrl,
    {
      channelId: process.env.SHARECHAT_CHANNEL_ID,
      message: message.text,
      title: message.title,
      decisionId: message.decisionId,
      url: message.url
    },
    process.env.SHARECHAT_BOT_TOKEN
      ? { headers: { Authorization: `Bearer ${process.env.SHARECHAT_BOT_TOKEN}` } }
      : undefined
  );

  return { skipped: false };
}

export async function publishSimulationToIntegrations(simulation: FailureSimulation, decisionId?: string) {
  const message = formatSimulationSummary(simulation, decisionId);
  const results = await Promise.allSettled([
    postTeams(message),
    postCopilot(message),
    postShareChat(message)
  ]);

  return results.map((result, index) => ({
    integration: ["teams", "copilot", "sharechat"][index],
    ok: result.status === "fulfilled",
    result: result.status === "fulfilled" ? result.value : undefined,
    error: result.status === "rejected" ? result.reason?.message || "Unknown error" : undefined
  }));
}

export async function testIntegration(id: IntegrationId) {
  if (id === "azure") {
    const azureStatus = getIntegrationStatuses().find((item) => item.id === "azure")!;
    if (!azureStatus.configured) return azureStatus;
    await getCurrentSprint();
    return { ...azureStatus, details: "Azure DevOps sprint API responded successfully." };
  }

  const message: IntegrationMessage = {
    title: "FORESIGHT integration test",
    text: `FORESIGHT test from ${apiBaseUrl()} at ${new Date().toISOString()}`,
    url: appBaseUrl()
  };

  if (id === "teams") await postTeams(message);
  if (id === "copilot") await postCopilot(message);
  if (id === "sharechat") await postShareChat(message);

  const current = getIntegrationStatuses().find((item) => item.id === id)!;
  return { ...current, details: `${current.name} test message sent.` };
}
