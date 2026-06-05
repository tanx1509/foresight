// Ensure we operate in mock operational provider mode for the test
process.env.OPERATIONAL_PROVIDER = "mock";

import { runAuditorAgent } from "../backend/src/agents";
import { getOperationalProvider } from "../backend/src/services/operationalProviderFactory";
import fs from "fs";
import path from "path";

async function validate() {
  console.log("Starting Phase 2E Validation...\n");

  const startTime = Date.now();
  console.log("1. Loading provider.");
  const provider = getOperationalProvider();

  let pass = true;

  const runTest = async (capacity: number, expectedSeverity: string) => {
    fs.writeFileSync(
      path.resolve(__dirname, '../data/operational/sprint.json'), 
      JSON.stringify({ capacityPercentage: capacity, availableHours: 48, velocity30Day: 34 })
    );

    const auditorResponse = await runAuditorAgent();
    const capacityConstraint = auditorResponse.data.find(c => c.category === "capacity");
    
    if (capacityConstraint && capacityConstraint.severity === expectedSeverity) {
      console.log(`✓ capacity=${capacity} expects ${expectedSeverity} (Passed)`);
    } else {
      console.log(`✗ capacity=${capacity} expects ${expectedSeverity} (Failed: got ${capacityConstraint?.severity})`);
      pass = false;
    }
    return auditorResponse;
  };

  console.log("\n2. Executing AUDITOR capacity tests.");
  await runTest(92, "High");
  await runTest(75, "Medium");
  const finalResponse = await runTest(45, "Low");

  console.log("\n3. Asserting General Requirements.");
  if (finalResponse.data.length >= 3) {
    console.log("✓ at least 3 constraints generated");
  } else {
    console.log(`✗ generated ${finalResponse.data.length} constraints (expected >= 3)`);
    pass = false;
  }

  const prConstraint = finalResponse.data.find(c => c.category === "metrics");
  if (prConstraint && prConstraint.severity === "High") {
    console.log("✓ PR metrics severity classification works");
  } else {
    console.log("✗ PR metrics severity classification failed");
    pass = false;
  }

  const deployConstraint = finalResponse.data.find(c => c.category === "delays");
  if (deployConstraint && deployConstraint.severity === "High") {
    console.log("✓ deployment severity classification works");
  } else {
    console.log("✗ deployment severity classification failed");
    pass = false;
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\nAuditor completed validation in ${duration} seconds.`);

  console.log("\n-------------------------");
  if (pass) {
    console.log("PASS");
    process.exit(0);
  } else {
    console.log("FAIL");
    process.exit(1);
  }
}

validate().catch(err => {
  console.error("Validation failed:", err);
  process.exit(1);
});
