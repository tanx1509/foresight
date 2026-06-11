import axios from "axios";

export async function getCurrentSprint() {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const team = process.env.AZURE_DEVOPS_TEAM;
  const pat = process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !project || !team) {
    throw new Error(
      "Missing Azure DevOps configuration: ORG_URL, PROJECT, or TEAM."
    );
  }

  const url =
    `${orgUrl}/${encodeURIComponent(project)}/${encodeURIComponent(team)}` +
    `/_apis/work/teamsettings/iterations?$timeframe=current&api-version=7.1`;

  const headers: Record<string, string> = {};

  if (pat) {
    const auth = Buffer.from(`:${pat}`).toString("base64");
    headers["Authorization"] = `Basic ${auth}`;
  }

  const response = await axios.get(url, { headers });

  console.log("=== CURRENT SPRINT RESPONSE ===");
  console.log(JSON.stringify(response.data, null, 2));

  const iterations = response.data.value;

  if (!iterations || iterations.length === 0) {
    throw new Error("No current sprint found in Azure DevOps.");
  }

  return iterations[0];
}

export async function getTeamCapacity(iterationId: string) {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const team = process.env.AZURE_DEVOPS_TEAM;
  const pat = process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !project || !team) {
    throw new Error(
      "Missing Azure DevOps configuration: ORG_URL, PROJECT, or TEAM."
    );
  }

  const url =
    `${orgUrl}/${encodeURIComponent(project)}/${encodeURIComponent(team)}` +
    `/_apis/work/teamsettings/iterations/${iterationId}/capacities?api-version=7.1`;

  const headers: Record<string, string> = {};

  if (pat) {
    const auth = Buffer.from(`:${pat}`).toString("base64");
    headers["Authorization"] = `Basic ${auth}`;
  }

  const response = await axios.get(url, { headers });

  console.log("=== AZURE CAPACITY RESPONSE ===");
  console.log(JSON.stringify(response.data, null, 2));

  return response.data;
}

export async function getTeamVelocity() {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const team = process.env.AZURE_DEVOPS_TEAM;
  const pat = process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !project || !team) {
    throw new Error("Missing Azure DevOps configuration.");
  }

  const url =
    `${orgUrl}/${encodeURIComponent(project)}/${encodeURIComponent(team)}` +
    `/_apis/work/teamsettings/iterations?$timeframe=current&api-version=7.1`;

  const headers: Record<string, string> = {};

  if (pat) {
    const auth = Buffer.from(`:${pat}`).toString("base64");
    headers["Authorization"] = `Basic ${auth}`;
  }

  const response = await axios.get(url, { headers });

  console.log("=== VELOCITY RESPONSE ===");
  console.log(JSON.stringify(response.data, null, 2));

  return response.data.value || [];
}

export async function getSprintWorkItems() {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const pat = process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !project || !pat) {
    throw new Error("Missing Azure configuration.");
  }

  const auth = Buffer.from(`:${pat}`).toString("base64");

  const headers = {
    Authorization: `Basic ${auth}`
  };

  const wiqlUrl =
    `${orgUrl}/${project}/_apis/wit/wiql?api-version=7.1`;

  const wiqlQuery = {
    query: `
      SELECT [System.Id]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
      ORDER BY [System.ChangedDate] DESC
    `
  };

  const response = await axios.post(
    wiqlUrl,
    wiqlQuery,
    { headers }
  );

  return response.data.workItems || [];
}

export async function createWorkItem(
  title: string,
  description: string
) {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const pat = process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !project || !pat) {
    throw new Error("Missing Azure configuration.");
  }

  const auth = Buffer.from(`:${pat}`).toString("base64");

  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json-patch+json"
  };

  const workItemType = encodeURIComponent(process.env.AZURE_DEVOPS_WORK_ITEM_TYPE || "Issue");
  const url =
    `${orgUrl}/${encodeURIComponent(project)}` +
    `/_apis/wit/workitems/%24${workItemType}?api-version=7.1`;

  const body = [
    {
      op: "add",
      path: "/fields/System.Title",
      value: title
    },
    {
      op: "add",
      path: "/fields/System.Description",
      value: description
    }
  ];

  try {
    const response = await axios.post(
      url,
      body,
      { headers }
    );
    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error("=== FULL AZURE ERROR BODY ===");
      console.error(JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
}
