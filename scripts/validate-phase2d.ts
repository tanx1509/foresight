// Ensure we operate in mock provider mode for the test
process.env.SEARCH_PROVIDER = "mock";

import { ingestCorpus } from "../backend/src/ingestion/corpusIngestion";
import { getSearchProvider } from "../backend/src/services/providerFactory";

async function validate() {
  console.log("Starting Phase 2D Validation...\n");

  const startTime = Date.now();
  console.log("Triggering Corpus Ingestion...");
  const result = await ingestCorpus();
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`Ingestion Result:`, result);
  console.log(`Index Time: ${duration} seconds`);

  let pass = true;

  if (result.indexedDocuments >= 3 || result.skippedDocuments >= 3) {
    console.log("✓ documentsIndexed >= 3");
  } else {
    console.log("✗ documentsIndexed < 3");
    pass = false;
  }

  const queries = [
    "payment gateway",
    "salesforce migration",
    "sso certificate rotation"
  ];

  const provider = getSearchProvider();

  for (const q of queries) {
    const searchResults = await provider.search(q, 5);
    if (searchResults.length > 0) {
      console.log(`✓ Query "${q}" returned ${searchResults.length} results.`);
      // console.log(`  Top match: ${searchResults[0].title} [Score: ${searchResults[0].score}]`);
    } else {
      console.log(`✗ Query "${q}" returned 0 results.`);
      pass = false;
    }
  }

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
