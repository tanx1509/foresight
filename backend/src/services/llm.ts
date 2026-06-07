import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function callAzureOpenAI(systemPrompt: string, userPrompt: string, isJson: boolean = true) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  if (!endpoint || !apiKey) {
    console.warn("Missing Azure OpenAI credentials. Returning mock response.");
    return null;
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  try {
    const response = await axios.post(
      url,
      {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        response_format: isJson ? { type: "json_object" } : { type: "text" }
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;
    return isJson ? JSON.parse(content) : content;
  } catch (err: any) {
    console.error("Azure OpenAI Error:", err.response?.data || err.message);
    return null;
  }
}
