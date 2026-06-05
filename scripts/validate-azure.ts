import * as fs from 'fs';
import * as path from 'path';

function validateAzureConfig() {
  console.log("Validating Azure configuration...");
  const envPath = path.resolve(process.cwd(), "../.env");
  const envExamplePath = path.resolve(process.cwd(), "../.env.example");
  
  // Read SEARCH_PROVIDER from process.env or .env
  let provider = process.env.SEARCH_PROVIDER;
  if (!provider && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/SEARCH_PROVIDER=(.*)/);
    if (match) provider = match[1].trim();
  }
  
  if (!provider || provider.toLowerCase() === "mock") {
    console.log("SEARCH_PROVIDER is 'mock' or unset. Skipping Azure credentials validation to maintain local-first execution.");
    return;
  }

  console.log(`Validating keys for provider: ${provider}`);
  const requiredKeys = ["AZURE_SEARCH_ENDPOINT", "AZURE_SEARCH_KEY", "AZURE_OPENAI_ENDPOINT"];
  
  // Since we require these when using Azure, we check process.env or .env
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      let foundInFile = false;
      if (fs.existsSync(envPath)) {
        foundInFile = fs.readFileSync(envPath, 'utf8').includes(`${key}=`);
      }
      if (!foundInFile) {
        console.error(`ERROR: SEARCH_PROVIDER is ${provider} but ${key} is missing in environment or .env file.`);
        process.exit(1);
      }
    }
  }

  console.log("Validation complete. Azure configuration is fully loaded.");
}

validateAzureConfig();
