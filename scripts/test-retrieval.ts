import { getSearchProvider } from "../backend/src/services/providerFactory";

async function run() {
  // Ensure we are strictly using the mock provider
  process.env.SEARCH_PROVIDER = "mock";
  const provider = getSearchProvider();
  
  const prompts = [
    "Should we deploy the new payment gateway next week?",
    "Should we migrate CRM to Salesforce?",
    "Should we migrate our Kubernetes cluster?",
    "Should we launch the July 15 SSO migration?"
  ];

  for (const p of prompts) {
    console.log(`\n=== PROMPT: "${p}" ===`);
    const results = await provider.search(p, 5);
    results.forEach((r, i) => {
      console.log(`${i + 1}. [${r.score}] ${r.title} (ID: ${r.id})`);
    });
  }
}

run().catch(console.error);
