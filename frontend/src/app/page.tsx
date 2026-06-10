"use client";

import React, { useState, useEffect } from "react";
import { Search, Play, ChevronRight, History, PlugZap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import AgentTimeline from "@/components/AgentTimeline";
import SimulationDashboard from "@/components/SimulationDashboard";
import ForesightLogo from "@/components/ForesightLogo";
import { FailureSimulation } from "@foresight/shared";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

type IntegrationStatus = {
  id: "azure" | "teams" | "copilot" | "sharechat";
  name: string;
  configured: boolean;
  status: "ready" | "missing_config" | "error";
  description: string;
  requiredEnv: string[];
  setupUrl: string;
  details?: string;
};

export default function Home() {
  const [simulationState, setSimulationState] = useState<"idle" | "running" | "completed">("idle");
  const [simulationData, setSimulationData] = useState<FailureSimulation | null>(null);
  const [prompt, setPrompt] = useState("");
  const [recentSims, setRecentSims] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [integrationMessage, setIntegrationMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    const API_URL = getApiUrl();
    fetch(`${API_URL}/api/decision-history`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setRecentSims(d.slice(0, 4));
        }
      })
      .catch(err => console.error(err));

    fetch(`${API_URL}/api/integrations`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.integrations)) setIntegrations(d.integrations);
      })
      .catch(err => console.error(err));
  }, []);

  const testIntegration = async (id: IntegrationStatus["id"]) => {
    const API_URL = getApiUrl();
    setTestingIntegration(id);
    setIntegrationMessage((prev) => ({ ...prev, [id]: "" }));

    try {
      const res = await fetch(`${API_URL}/api/integrations/${id}/test`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      setIntegrationMessage((prev) => ({ ...prev, [id]: data.details || "Test completed." }));
    } catch (err: any) {
      setIntegrationMessage((prev) => ({ ...prev, [id]: err.message || "Test failed." }));
    } finally {
      setTestingIntegration(null);
    }
  };

  const startSimulation = async () => {
    if (!prompt.trim()) return;
    setSimulationState("running");
    
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/api/simulate`, {
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

  const router = useRouter();

  const handleDecision = async (action: string) => {
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/api/decisions`, {
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
                        "The engineering organization is considering rewriting a React-based customer platform into Vue.js over the next 12 months. The platform supports more than 1 million monthly active users and includes over 400 reusable components. Analyze technical debt reduction benefits against migration risks and historical engineering failures.",
                        "Our sales organization currently uses HubSpot across 450 account executives. Leadership is proposing a migration to Salesforce within the next two quarters to improve enterprise reporting and forecasting accuracy. The migration would require transferring custom workflows, attribution models, and revenue dashboards. Historical migration incidents and operational risks should be analyzed before approval.",
                        "The company is considering replacing Okta with Microsoft Entra ID during Q3. Approximately 8,000 employees rely on the identity platform for daily authentication. Previous security incidents, integration dependencies, compliance requirements, and rollout risks should be evaluated before proceeding.",
                        "The payments team plans to migrate all customer transactions from Stripe Gateway A to Gateway B next week. The migration includes tokenized payment data, recurring billing subscriptions, and webhook integrations. Analyze historical failures, operational constraints, and potential business risks before approval."
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
                      type="submit"
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
            <div className="mt-8 space-y-4">
              <div className="bg-fluent-surface border border-fluent-border rounded-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PlugZap className="w-4 h-4 text-fluent-text-muted" />
                    <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Integrations</h3>
                  </div>
                  <a href="/integrations" className="text-[12px] text-fluent-brand hover:underline">Guide</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integrations.length === 0 ? (
                    <div className="border border-dashed border-fluent-border p-3 text-[13px] text-fluent-text-muted">
                      Loading integration status...
                    </div>
                  ) : integrations.map((integration) => (
                    <div key={integration.id} className="border border-fluent-border-subtle rounded-sm bg-fluent-bg p-3 min-h-[132px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              {integration.configured ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-fluent-success" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-fluent-warning" />
                              )}
                              <span className="text-[13px] font-semibold text-fluent-text">{integration.name}</span>
                            </div>
                            <p className="text-[11px] text-fluent-text-muted mt-1 leading-4">{integration.description}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm shrink-0 ${
                            integration.configured ? "bg-fluent-success-bg text-fluent-success" : "bg-fluent-warning-bg text-fluent-warning"
                          }`}>
                            {integration.configured ? "Ready" : "Env needed"}
                          </span>
                        </div>
                        <p className="text-[10px] text-fluent-text-muted mt-2 break-words">
                          {integration.requiredEnv.join(", ")}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <a
                          href={integration.setupUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-fluent-brand hover:underline"
                        >
                          Open setup
                        </a>
                        <button
                          onClick={() => testIntegration(integration.id)}
                          disabled={!integration.configured || testingIntegration === integration.id}
                          className="h-7 px-2 border border-fluent-border bg-fluent-surface hover:bg-fluent-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-semibold rounded-sm flex items-center gap-1"
                        >
                          {testingIntegration === integration.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlugZap className="w-3 h-3" />}
                          Test
                        </button>
                      </div>
                      {integrationMessage[integration.id] && (
                        <p className="text-[11px] text-fluent-text-muted mt-2">{integrationMessage[integration.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
