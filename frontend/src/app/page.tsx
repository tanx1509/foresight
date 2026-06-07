"use client";

import React, { useState, useEffect } from "react";
import { Search, Play, ChevronRight, History, Activity, Database } from "lucide-react";
import AgentTimeline from "@/components/AgentTimeline";
import SimulationDashboard from "@/components/SimulationDashboard";
import ForesightLogo from "@/components/ForesightLogo";
import { FailureSimulation } from "@foresight/shared";

export default function Home() {
  const [simulationState, setSimulationState] = useState<"idle" | "running" | "completed">("idle");
  const [simulationData, setSimulationData] = useState<FailureSimulation | null>(null);
  const [prompt, setPrompt] = useState("");
  const [recentSims, setRecentSims] = useState<any[]>([]);
  const [azureSyncs, setAzureSyncs] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3001/api/decision-history")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setRecentSims(d.slice(0, 4));
          setAzureSyncs(d.filter(r => r.azureWorkItemId).length);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const startSimulation = async () => {
    if (!prompt.trim()) return;
    setSimulationState("running");
    
    try {
      const res = await fetch("http://localhost:3001/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setSimulationData(data);
    } catch (err) {
      console.error("Failed to fetch simulation:", err);
    }
  };

  const handleTimelineComplete = () => {
    if (simulationData) {
      setSimulationState("completed");
    } else {
      setTimeout(() => setSimulationState("completed"), 1000);
    }
  };

  const router = require("next/navigation").useRouter();

  const handleDecision = async (action: string) => {
    try {
      const res = await fetch("http://localhost:3001/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, simulationData })
      });
      const { record } = await res.json();
      
      if (action === "Proceed" || action === "Request Review") {
        router.push(`/plan/${record.decisionId}`);
      } else {
        alert(`Decision recorded: ${action}`);
        setSimulationState("idle");
        setSimulationData(null);
        setPrompt("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-fluent-bg text-fluent-text font-sans">
      
      {/* Top Header */}
      <header className="h-12 bg-fluent-surface border-b border-fluent-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-fluent-brand">
            <ForesightLogo size={20} color="currentColor" />
            <span className="font-semibold tracking-wider text-[14px]">FORESIGHT</span>
          </div>
          <div className="h-4 w-px bg-fluent-border mx-2"></div>
          <div className="flex items-center gap-1.5 text-[13px]">
            <h1 className="font-semibold text-fluent-text">Engineering Operations</h1>
            <ChevronRight className="w-3.5 h-3.5 text-fluent-text-muted" />
            <span className="text-fluent-text-muted">Decision Context</span>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-fluent-brand text-white flex items-center justify-center font-semibold text-[11px]">
          AD
        </div>
      </header>

      <main className="flex-1 p-4 flex gap-4 items-start overflow-hidden">
        
        {/* Dynamic Parameter Panel */}
        <div className={`flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out h-full ${simulationState === "idle" ? "w-full max-w-3xl mx-auto mt-10" : "w-[280px]"}`}>
          
          <div className="bg-fluent-surface border border-fluent-border rounded-sm shadow-sm p-4">
            {simulationState === "idle" && (
              <h2 className="text-[18px] font-semibold text-fluent-text mb-1">Evaluate Decision</h2>
            )}
            {simulationState !== "idle" && (
              <h2 className="font-semibold text-fluent-text mb-3 uppercase tracking-wider text-[11px]">Simulation Parameters</h2>
            )}

            <div className="space-y-4 mt-3">
              <div>
                <label className="block text-[12px] text-fluent-text-muted mb-1.5 font-medium">Custom Decision Prompt</label>
                <div className={`flex items-start gap-2 bg-fluent-bg border border-fluent-border-subtle rounded-sm focus-within:border-fluent-brand focus-within:ring-1 focus-within:ring-fluent-brand ${simulationState === 'idle' ? 'p-3 min-h-[100px]' : 'p-2 min-h-[60px]'}`}>
                  <Search className="w-4 h-4 text-fluent-text-muted shrink-0 mt-0.5" />
                  <textarea 
                    className="w-full text-[13px] outline-none bg-transparent text-fluent-text resize-none" 
                    placeholder="e.g., Should we migrate from Datadog to Grafana next quarter?"
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={simulationState === 'idle' ? 3 : 2}
                  />
                </div>
              </div>

              {simulationState === "idle" && (
                <>
                  <div>
                    <label className="block text-[12px] text-fluent-text-muted mb-1.5 font-medium">Quick Start Examples</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Should we rewrite the frontend in Vue.js?",
                        "Should we migrate our CRM to Salesforce?",
                        "Should we replace Okta this quarter?",
                        "Can we deploy the payment gateway next week?"
                      ].map(p => (
                        <button 
                          key={p}
                          onClick={() => setPrompt(p)}
                          className="text-left px-2.5 py-1 rounded-sm border border-fluent-border hover:bg-fluent-surface-hover hover:shadow-sm text-fluent-text text-[12px] transition-all duration-200 cursor-pointer whitespace-nowrap"
                        >
                          {p.length > 40 ? p.substring(0, 40) + '...' : p}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={startSimulation}
                      disabled={!prompt.trim()}
                      className="w-full bg-fluent-brand hover:bg-fluent-brand-hover hover:brightness-110 disabled:bg-fluent-border disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-sm shadow-sm hover:shadow-md flex justify-center items-center gap-1.5 transition-all duration-200 cursor-pointer text-[13px]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run Custom Analysis
                    </button>
                  </div>
                </>
              )}

              {simulationState !== "idle" && (
                <button 
                  onClick={() => setSimulationState("idle")}
                  className="w-full bg-fluent-surface border border-fluent-border hover:bg-fluent-surface-hover hover:shadow-sm text-fluent-text font-semibold py-1.5 px-3 rounded-sm flex justify-center items-center transition-all duration-200 cursor-pointer text-[12px]"
                >
                  Edit Prompt
                </button>
              )}
            </div>
          </div>

          {/* Operational Context - Only visible when idle */}
          {simulationState === "idle" && (
            <div className="mt-8">
              <div className="bg-fluent-surface border border-fluent-border rounded-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-fluent-text-muted" />
                    <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Recent Decision Investigations</h3>
                  </div>
                  <a href="/history" className="text-[12px] text-fluent-brand hover:underline">View All</a>
                </div>
                <div className="space-y-3">
                  {recentSims.length === 0 ? (
                    <p className="text-[13px] text-fluent-text-muted italic p-4 text-center border border-dashed border-fluent-border">No recent investigations found. Run a prompt above.</p>
                  ) : (
                    recentSims.map((sim, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-fluent-border-subtle rounded-sm bg-fluent-bg hover:border-fluent-border cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-fluent-brand">Investigation #{1042 - i}</span>
                          <span className="text-[12px] text-fluent-text-muted">{sim.scenarioId}</span>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-sm shrink-0 ${
                          sim.confidence === 'High' ? 'bg-fluent-success-bg text-fluent-success' : 
                          sim.confidence === 'Medium' ? 'bg-fluent-warning-bg text-fluent-warning' : 'bg-fluent-critical-bg text-fluent-critical'
                        }`}>
                          {sim.confidence} Conf
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Analysis Panel */}
        {simulationState !== "idle" && (
          <div className="flex-1 h-[calc(100vh-80px)] overflow-hidden bg-fluent-bg rounded-sm shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
            {simulationState === "running" && (
              <div className="w-full h-full flex items-start justify-center bg-fluent-surface border border-fluent-border rounded-sm overflow-auto">
                <AgentTimeline onComplete={handleTimelineComplete} prompt={prompt} />
              </div>
            )}
            {simulationState === "completed" && simulationData && (
              <div className="w-full h-full overflow-hidden">
                <SimulationDashboard 
                  simulation={simulationData} 
                  onDecision={handleDecision}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
