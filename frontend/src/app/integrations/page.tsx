import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const envBlocks = [
  {
    title: "Azure",
    body: "Azure OpenAI keys come from Azure Portal -> Azure OpenAI resource -> Keys and Endpoint. Deployment name comes from Azure AI Foundry / Azure OpenAI Studio -> Deployments. Azure DevOps values come from your DevOps organization, project settings, team settings, and User settings -> Personal access tokens.",
    env: [
      "AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com",
      "AZURE_OPENAI_API_KEY=YOUR_AZURE_OPENAI_KEY",
      "AZURE_OPENAI_DEPLOYMENT=gpt-4o",
      "AZURE_SEARCH_ENDPOINT=https://YOUR-SEARCH-SERVICE.search.windows.net",
      "AZURE_SEARCH_KEY=YOUR_AZURE_SEARCH_ADMIN_OR_QUERY_KEY",
      "AZURE_SEARCH_INDEX=foresight-memory",
      "AZURE_DEVOPS_ORG_URL=https://dev.azure.com/YOUR_ORG",
      "AZURE_DEVOPS_PROJECT=YOUR_PROJECT",
      "AZURE_DEVOPS_TEAM=YOUR_TEAM",
      "AZURE_DEVOPS_PAT=YOUR_PAT_WITH_WORK_ITEMS_READ_WRITE"
    ],
    href: "https://portal.azure.com/"
  },
  {
    title: "Microsoft Teams",
    body: "Create an Incoming Webhook in the target channel, or create a Teams Workflow / Power Automate flow with an HTTP trigger. Paste that URL as the webhook.",
    env: ["TEAMS_WEBHOOK_URL=https://YOUR_TEAMS_WEBHOOK_URL"],
    href: "https://teams.microsoft.com/"
  },
  {
    title: "Microsoft Copilot",
    body: "In Copilot Studio, add an action/custom connector that calls POST /api/copilot/simulate. To receive outbound FORESIGHT summaries, use a Copilot Studio or Power Automate HTTP trigger URL.",
    env: [
      "COPILOT_WEBHOOK_URL=https://YOUR_COPILOT_OR_POWER_AUTOMATE_WEBHOOK_URL",
      "COPILOT_API_KEY=OPTIONAL_BEARER_TOKEN"
    ],
    href: "https://copilotstudio.microsoft.com/"
  },
  {
    title: "ShareChat",
    body: "Use your ShareChat business/developer webhook if available, or an automation bridge HTTP trigger that posts into your ShareChat workflow.",
    env: [
      "SHARECHAT_WEBHOOK_URL=https://YOUR_SHARECHAT_WEBHOOK_OR_BRIDGE_URL",
      "SHARECHAT_BOT_TOKEN=OPTIONAL_BEARER_TOKEN",
      "SHARECHAT_CHANNEL_ID=OPTIONAL_CHANNEL_ID"
    ],
    href: "https://sharechat.com/"
  }
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-fluent-bg text-fluent-text">
      <div className="max-w-5xl mx-auto px-5 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-fluent-brand hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to FORESIGHT
        </Link>

        <div className="mt-5 border border-fluent-border bg-fluent-surface rounded-sm p-5">
          <h1 className="text-[22px] font-semibold">Integration Setup Guide</h1>
          <p className="text-[13px] text-fluent-text-muted mt-2 max-w-3xl">
            Copy the example env files, paste your platform links and keys, then restart the backend and frontend.
          </p>

          <div className="mt-4 bg-fluent-bg border border-fluent-border-subtle rounded-sm p-3 text-[12px] font-mono leading-6">
            <div>copy .env.example .env</div>
            <div>copy backend\.env.example backend\.env</div>
            <div>copy frontend\.env.local.example frontend\.env.local</div>
            <div>npm install</div>
            <div>npm run dev</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {envBlocks.map((block) => (
            <section key={block.title} className="border border-fluent-border bg-fluent-surface rounded-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[15px] font-semibold">{block.title}</h2>
                <a href={block.href} target="_blank" rel="noreferrer" className="text-fluent-brand">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-[12px] text-fluent-text-muted mt-2 leading-5">{block.body}</p>
              <pre className="mt-3 bg-fluent-bg border border-fluent-border-subtle rounded-sm p-3 overflow-auto text-[11px] leading-5">
                {block.env.join("\n")}
              </pre>
            </section>
          ))}
        </div>

        <section className="mt-4 border border-fluent-border bg-fluent-surface rounded-sm p-4">
          <h2 className="text-[15px] font-semibold">How FORESIGHT Runs</h2>
          <p className="text-[12px] text-fluent-text-muted mt-2 leading-5">
            A decision prompt flows through Signal, Historian, Auditor, Challenger, and Synthesizer agents.
            The app returns risks, evidence, constraints, rollback plans, and recommended execution paths.
            Azure DevOps creates mitigation work items when configured, while Teams, Copilot, and ShareChat receive summary notifications through their webhooks.
          </p>
        </section>
      </div>
    </main>
  );
}
