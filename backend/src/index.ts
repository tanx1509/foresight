import { createWorkItem } from "./services/azureDevops";
import { saveDecisionRecords, loadDecisionRecords } from "./services/decisionStore";
import { runSimulationWorkflow } from "./services/simulator";
import { handleTeamsMessage } from "./teams/bot";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { 
  runSignalAgent, 
  runHistorianAgent, 
  runAuditorAgent, 
  runChallengerAgent, 
  runSynthesizerAgent 
} from "./agents";
import { ActionDecisionRecord, FailureSimulation } from "@foresight/shared";
import fs from "fs";
import path from "path";

// Bootstrap local storage directories
const BOOTSTRAP_DIRS = [
  "data/corpus",
  "data/processed",
  "data/chunks",
  "data/embeddings",
  "data/index",
  "data/operational"
];
BOOTSTRAP_DIRS.forEach(dir => {
  const fullPath = path.resolve(__dirname, '../../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`[BOOTSTRAP] Created directory: ${dir}`);
  }
});

import { ingestCorpus } from "./ingestion/corpusIngestion";
import { getSearchProvider } from "./services/providerFactory";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/reindex", async (req, res) => {
  try {
    const result = await ingestCorpus();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/debug/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ error: "Missing query 'q'" });
    const searchProvider = getSearchProvider();
    const results = await searchProvider.search(q, 5);
    res.json({
      query: q,
      results: results.map((r: any) => r.title),
      scores: results.map((r: any) => r.score),
      retrievalMethod: "Hybrid (Cosine + TFIDF)"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;

const decisionRecordsStore: ActionDecisionRecord[] = [];
const DB_FILE = path.join(__dirname, "../../decision_records.json");

const saveRecords = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(decisionRecordsStore, null, 2));
};

app.post("/api/simulate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await runSimulationWorkflow(prompt);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});

app.post("/api/teams/message", async (req, res) => {
  try {
    const result = await handleTeamsMessage(req.body);
    if (result.status === "error") {
      res.status(500).json({ error: "Teams simulation failed" });
    } else if (result.status === "ignored") {
      res.status(200).json({ message: "Ignored" });
    } else {
      res.json(result.response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/decisions", (req, res) => {
  const { action, simulationData } = req.body;
  const record: ActionDecisionRecord = {
    decisionId: `dec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    simulationData
  };
  decisionRecordsStore.push(record);
  saveRecords();
  res.json({ success: true, record });
});

app.get("/api/decision-history", (req, res) => {
  res.json(loadDecisionRecords());
});

app.listen(PORT, () => {
  console.log(`FORESIGHT Backend Phase 3A running on http://localhost:${PORT}`);
  console.log(`Runtime Configuration check:`);
  console.log(`> SEARCH_PROVIDER: ${process.env.SEARCH_PROVIDER || 'mock'}`);
  console.log(`> OPERATIONAL_PROVIDER: ${process.env.OPERATIONAL_PROVIDER || 'mock'}`);
});
