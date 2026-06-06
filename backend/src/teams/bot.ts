import { runSimulationWorkflow } from "../services/simulator";
import { TeamsMessage, TeamsInvocationResult } from "./types";
import { initializeActivity, getActivity } from "./activityStore";
import { buildActivityFeedCard } from "./cards/activityFeed";

export async function handleTeamsMessage(payload: TeamsMessage): Promise<TeamsInvocationResult> {
  const { message } = payload;
  
  if (!message) {
    return { status: "ignored" };
  }

  // Detect @FORESIGHT mentions
  // For the foundation, we just look for the mention, extract the intent and run it.
  const isMentioned = message.toLowerCase().includes("@foresight");
  
  // Extract message text (strip out @foresight)
  const prompt = message.replace(/@foresight/i, "").trim();

  // If there's no real prompt left, ignore
  if (!prompt) {
    return { status: "ignored" };
  }

  const decisionId = `teams-${Date.now()}`;
  initializeActivity(decisionId, ["SIGNAL", "HISTORIAN", "AUDITOR", "CHALLENGER", "SYNTHESIZER"]);

  try {
    // Call existing simulation pipeline
    const result = await runSimulationWorkflow(prompt, decisionId);
    
    return {
      status: "success",
      response: {
        simulation: result,
        activityFeed: buildActivityFeedCard(getActivity(decisionId)!)
      }
    };
  } catch (error) {
    console.error("[Teams Bot] Error executing simulation:", error);
    return {
      status: "error"
    };
  }
}
