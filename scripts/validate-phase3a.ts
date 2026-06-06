import "dotenv/config"; // Load from .env

import { getOperationalProvider } from "../backend/src/services/operationalProviderFactory";
import { runAuditorAgent } from "../backend/src/agents";

async function validate() {
  console.log("Starting Phase 3A Live Azure DevOps Validation...\n");

  const provider = getOperationalProvider();

  try {
    console.log("Fetching sprint metrics directly from Azure DevOps API...");
    const sprint = await provider.getSprintMetrics();

    console.log(`\nSprint Name: ${sprint.sprintName}`);
    console.log(`Capacity Percentage: ${sprint.capacityPercentage}%`);
    console.log(`Available Hours: ${sprint.availableHours}`);
    console.log(`Velocity (30 Day): ${sprint.velocity30Day}`);

    console.log("\nExecuting AUDITOR...");
    const auditorResponse = await runAuditorAgent();

    console.log(`AUDITOR generated ${auditorResponse.data.length} constraints`);
    
    console.log("\nPASS");
  } catch (err: any) {
    console.error(`\nValidation failed due to ADO connection issue or missing credentials: ${err.message}`);
    console.log("\nFAIL");
    process.exit(1);
  }
}

validate();
