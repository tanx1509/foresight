import { getSearchProvider } from '../src/services/providerFactory';

async function validate() {
  const query = "Should we deploy payment gateway next week?";
  console.log(`Running Validation Query: "${query}"\n`);
  
  const provider = getSearchProvider();
  const results = await provider.search(query, 5);

  console.log("Top 5 Retrieved Documents:");
  results.forEach((res, i) => {
    console.log(`\n[Rank ${i+1}] Score: ${res.score} | File: ${res.title}`);
    console.log(`Excerpt: ${res.content.substring(0, 150)}...`);
  });
}

validate().catch(console.error);
