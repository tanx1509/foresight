# FORESIGHT Integration Guide

## Start Commands

Install dependencies once:

```bash
npm install
```

Run the full app:

```bash
npm run dev
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Integration status API: http://localhost:3001/api/integrations

## Environment Files

Copy these examples:

```bash
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local
```

The backend reads `backend/.env` when you run the backend workspace. The frontend reads `frontend/.env.local`.

## Azure

Add these in `backend/.env`:

```bash
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com
AZURE_OPENAI_API_KEY=YOUR_AZURE_OPENAI_KEY
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-10-21
AZURE_SEARCH_ENDPOINT=https://YOUR-SEARCH-SERVICE.search.windows.net
AZURE_SEARCH_KEY=YOUR_AZURE_SEARCH_ADMIN_OR_QUERY_KEY
AZURE_SEARCH_INDEX=foresight-memory
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/YOUR_ORG
AZURE_DEVOPS_PROJECT=YOUR_PROJECT
AZURE_DEVOPS_TEAM=YOUR_TEAM
AZURE_DEVOPS_PAT=YOUR_PAT_WITH_WORK_ITEMS_READ_WRITE
AZURE_DEVOPS_WORK_ITEM_TYPE=Issue
```

Where to get them:

- Azure OpenAI endpoint/key: Azure Portal -> your Azure OpenAI resource -> Keys and Endpoint.
- Deployment name: Azure AI Foundry or Azure OpenAI Studio -> Deployments.
- Azure AI Search endpoint/key/index: Azure Portal -> Azure AI Search service -> Overview, Keys, and Indexes.
- Azure DevOps org URL: open your organization in Azure DevOps and copy `https://dev.azure.com/<org>`.
- Project/team: Azure DevOps -> Project settings -> Teams.
- PAT: Azure DevOps -> User settings -> Personal access tokens. Give it Work Items read/write access.

## Microsoft Teams

Add this in `backend/.env`:

```bash
TEAMS_WEBHOOK_URL=https://YOUR_TEAMS_WEBHOOK_URL
```

Where to get it:

- In Teams, open the target channel and create an Incoming Webhook or a Workflows/Power Automate flow with an HTTP trigger.
- Paste the webhook URL as `TEAMS_WEBHOOK_URL`.

Inbound test endpoint:

```bash
POST http://localhost:3001/api/teams/message
{ "message": "@foresight Should we migrate payments next quarter?" }
```

## Microsoft Copilot

Add this in `backend/.env`:

```bash
COPILOT_WEBHOOK_URL=https://YOUR_COPILOT_OR_POWER_AUTOMATE_WEBHOOK_URL
COPILOT_API_KEY=OPTIONAL_BEARER_TOKEN
```

Where to get it:

- In Copilot Studio, create an action/custom connector that calls FORESIGHT.
- For local testing, expose the backend with a tunnel and point Copilot Studio to:
  `POST https://YOUR_PUBLIC_API_URL/api/copilot/simulate`
- If you want FORESIGHT to push updates into Copilot, use a Copilot Studio or Power Automate HTTP trigger URL as `COPILOT_WEBHOOK_URL`.

Request body:

```json
{ "prompt": "Should we replace Okta with Microsoft Entra ID in Q3?" }
```

## ShareChat

Add this in `backend/.env`:

```bash
SHARECHAT_WEBHOOK_URL=https://YOUR_SHARECHAT_WEBHOOK_OR_BRIDGE_URL
SHARECHAT_BOT_TOKEN=OPTIONAL_BEARER_TOKEN
SHARECHAT_CHANNEL_ID=OPTIONAL_CHANNEL_ID
```

Where to get it:

- Use your ShareChat business/developer webhook if your account has one.
- If your ShareChat workflow is managed through another automation service, paste that HTTP trigger URL as `SHARECHAT_WEBHOOK_URL`.

Inbound test endpoint:

```bash
POST http://localhost:3001/api/sharechat/message
{ "message": "Analyze a Salesforce migration for 450 account executives." }
```

## How The App Functions

1. You submit a decision from the FORESIGHT home page.
2. The Signal agent classifies the decision.
3. The Historian agent retrieves related prior failures from the local corpus/index.
4. The Auditor agent checks operational constraints.
5. The Challenger agent generates adversarial failure assumptions.
6. The Synthesizer agent produces scenarios, recommendations, rollback plans, and confidence.
7. If Azure DevOps is configured, mitigation work items are created.
8. If Teams, Copilot, or ShareChat webhooks are configured, FORESIGHT posts a summary to those destinations.

The app remains usable without cloud credentials. Missing integrations show as not configured, and the core simulation runs with local/mock data.
