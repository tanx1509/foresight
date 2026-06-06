import "dotenv/config";

export const teamsConfig = {
  appId: process.env.TEAMS_APP_ID || "",
  appPassword: process.env.TEAMS_APP_PASSWORD || "",
  tenantId: process.env.TEAMS_TENANT_ID || ""
};
