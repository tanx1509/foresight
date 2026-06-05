import express from "express";
import cors from "cors";
import { 
  runSignalAgent, 
  runHistorianAgent, 
  runAuditorAgent, 
  runChallengerAgent, 
  runSynthesizerAgent 
} from "./agents";
import { DecisionRecord, FailureSimulation } from "@foresight/shared";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const decisionRecords: DecisionRecord[] = [];
const DB_FILE = path.join(__dirname, "../../decision_records.json");

const saveRecords = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(decisionRecords, null, 2));
};

app.post("/api/simulate", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const signal = await runSignalAgent(prompt);
    const historian = await runHistorianAgent(signal.data, prompt);
    const auditor = await runAuditorAgent();
    const challenger = await runChallengerAgent(signal.data, historian.data);
    const synthesizer = await runSynthesizerAgent(signal.data, historian.data, auditor.data, challenger.data);

    const simulation: FailureSimulation = {
      context: signal.data,
      retrievedDocuments: historian.data,
      constraints: auditor.data,
      assumptions: challenger.data,
      scenarios: synthesizer.data,
      agentTraces: {
        SIGNAL: signal.reasoningTrace,
        HISTORIAN: historian.reasoningTrace,
        AUDITOR: auditor.reasoningTrace,
        CHALLENGER: challenger.reasoningTrace,
        SYNTHESIZER: synthesizer.reasoningTrace
      }
    };

    res.json(simulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});

app.post("/api/decisions", (req, res) => {
  const { action, simulationData } = req.body;
  const record: DecisionRecord = {
    decisionId: `dec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    simulationData
  };
  decisionRecords.push(record);
  saveRecords();
  res.json({ success: true, record });
});

app.listen(PORT, () => {
  console.log(`FORESIGHT Backend Phase 1 running on http://localhost:${PORT}`);
  console.log(`Runtime Configuration check:`);
  console.log(`> SEARCH_PROVIDER: ${process.env.SEARCH_PROVIDER || 'mock'}`);
});
