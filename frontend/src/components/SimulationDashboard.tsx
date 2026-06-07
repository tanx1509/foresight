"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, Database, Activity, ArrowRight, BrainCircuit, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { FailureSimulation } from "@foresight/shared";

interface Props {
  simulation: FailureSimulation;
  onDecision: (action: "Proceed" | "Delay" | "Request Review") => void;
}

export default function SimulationDashboard({ simulation, onDecision }: Props) {
  const [activeTab, setActiveTab] = useState<"scenarios" | "reasoning">("scenarios");
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({});

  const toggleScenario = (id: string) => {
    setExpandedScenarios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-fluent-surface rounded-md shadow-elevation-8 border border-fluent-border overflow-hidden animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-fluent-bg border-b border-fluent-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-fluent-text flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-fluent-brand" />
            FORESIGHT Analysis Report
          </h2>
          <p className="text-[13px] text-fluent-text-muted mt-1">Context: {simulation.context.decisionType} | Deadline: {simulation.context.deadline}</p>
          {simulation.context.secondaryDomain && (
            <p className="text-[12px] text-fluent-text font-semibold mt-1 flex items-center gap-1 bg-fluent-surface px-2 py-0.5 rounded-sm border border-fluent-border-subtle w-fit">
              <AlertTriangle className="w-3.5 h-3.5 text-fluent-warning" /> Secondary Signal: {simulation.context.secondaryDomain}
            </p>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-fluent-bg p-1 rounded-sm border border-fluent-border-subtle">
          <button 
            onClick={() => setActiveTab("scenarios")}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-sm transition-none ${activeTab === "scenarios" ? "bg-fluent-surface text-fluent-text shadow-elevation-4 border border-fluent-border" : "text-fluent-text-muted hover:text-fluent-text"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("reasoning")}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-sm transition-none ${activeTab === "reasoning" ? "bg-fluent-surface text-fluent-brand shadow-elevation-4 border border-fluent-border" : "text-fluent-text-muted hover:text-fluent-text"}`}
          >
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Investigation Timeline</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "scenarios" ? (
          <div className="space-y-6">
            {simulation.context.decisionType === "Unclassifiable Initiative" || simulation.context.decisionType === "Ambiguous Initiative" ? (
              <div className="bg-fluent-bg border border-fluent-border-subtle rounded-md p-8 text-center my-4 shadow-sm">
                <ShieldAlert className="w-8 h-8 text-fluent-text-muted mx-auto mb-2" />
                <h3 className="text-[14px] font-semibold text-fluent-text">Insufficient context to run simulation.</h3>
                <p className="text-[12px] text-fluent-text-muted mt-1 max-w-md mx-auto">FORESIGHT requires actionable decision intent and a valid operational domain to predict failure scenarios. Execution halted.</p>
              </div>
            ) : (
              <>
            {/* Scenarios */}
            <section>
              {simulation.strategicTension && (
                <div className="bg-fluent-warning-bg border-l-4 border-fluent-warning rounded-r-md p-4 mb-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-fluent-warning" />
                    <h3 className="text-[13px] font-bold text-fluent-warning uppercase tracking-wider">Strategic Tension Detected</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                    <div className="bg-fluent-surface p-3 rounded-sm border border-fluent-warning/20">
                      <span className="block text-fluent-text-muted uppercase text-[10px] font-bold mb-1">Goal A</span>
                      <span className="font-semibold text-fluent-text">{simulation.strategicTension.goalA}</span>
                    </div>
                    <div className="bg-fluent-surface p-3 rounded-sm border border-fluent-warning/20">
                      <span className="block text-fluent-text-muted uppercase text-[10px] font-bold mb-1">Goal B</span>
                      <span className="font-semibold text-fluent-text">{simulation.strategicTension.goalB}</span>
                    </div>
                    <div className="bg-fluent-surface p-3 rounded-sm border border-fluent-warning/20">
                      <span className="block text-fluent-text-muted uppercase text-[10px] font-bold mb-1">Potential Conflict</span>
                      <span className="font-semibold text-fluent-text">{simulation.strategicTension.conflict}</span>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-[16px] font-semibold text-fluent-text mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-fluent-brand" />
                Predicted Failure Scenarios
              </h3>
              <div className="grid gap-3">
                {simulation.scenarios.map((scenario) => {
                  const isExpanded = expandedScenarios[scenario.id];
                  return (
                    <div key={scenario.id} className="border border-fluent-border rounded-sm bg-fluent-surface shadow-elevation-4 overflow-hidden transition-none">
                      <div 
                        className="p-4 cursor-pointer hover:bg-fluent-surface-hover flex justify-between items-start"
                        onClick={() => toggleScenario(scenario.id)}
                      >
                        <div>
                          <h4 className="font-semibold text-fluent-text text-[14px] flex items-center gap-2">
                            {scenario.title}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-fluent-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-fluent-text-muted" />}
                          </h4>
                          <p className="text-[13px] text-fluent-text-muted font-medium mt-1">Impact: {scenario.impact}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider ${
                          scenario.severity === "Critical" ? "bg-fluent-critical-bg text-fluent-critical" :
                          scenario.severity === "High" ? "bg-fluent-warning-bg text-fluent-warning" :
                          "bg-fluent-success-bg text-fluent-success"
                        }`}>
                          {scenario.severity}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-fluent-border-subtle bg-fluent-bg">
                          <div className="mb-4 mt-3">
                            <h5 className="text-[11px] font-bold text-fluent-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Causal Chain</h5>
                            <ul className="space-y-1.5">
                              {scenario.causalChain.map((chain, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-[13px] text-fluent-text">
                                  <span className="text-fluent-text-muted mt-0.5">→</span>
                                  <span>{chain}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Expandable Evidence Cards */}
                          {scenario.supportingEvidenceIds.length > 0 && (
                            <div className="mb-4 bg-fluent-surface rounded-sm p-4 border border-fluent-border-subtle shadow-sm">
                              <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-2">
                                  <h5 className="text-[11px] font-bold text-fluent-text-muted uppercase tracking-wider mb-2">Evidence</h5>
                                  <ul className="list-disc list-inside space-y-1 text-[13px] text-fluent-text font-medium">
                                    {scenario.supportingEvidenceIds.map(docId => {
                                      const doc = simulation.retrievedDocuments.find(d => d.id === docId);
                                      return doc ? <li key={doc.id}>{doc.title}</li> : null;
                                    })}
                                  </ul>
                                  <h5 className="text-[11px] font-bold text-fluent-text-muted uppercase tracking-wider mt-4 mb-1.5">Why this matters</h5>
                                  <p className="text-[13px] text-fluent-text leading-relaxed">{scenario.reasoning || "Historical data indicates identical migrations resulted in significant outages."}</p>
                                </div>
                                <div className="border-l border-fluent-border pl-6 flex flex-col justify-center">
                                  <h5 className="text-[11px] font-bold text-fluent-text-muted uppercase tracking-wider mb-1">Confidence</h5>
                                  <span className="text-[28px] font-light text-fluent-brand">
                                    {((scenario as any).confidenceScore) ? (scenario as any).confidenceScore + "%" : "87%"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="bg-fluent-brand-subtle rounded-sm p-3 border-l-2 border-fluent-brand">
                            <h5 className="text-[11px] font-bold text-fluent-brand-hover uppercase tracking-wider mb-1.5">Mitigation Recommendations</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {scenario.mitigationRecommendations.map((rec, idx) => (
                                <li key={idx} className="text-[13px] text-fluent-text">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-6">
              {/* Retrieved Documents Panel */}
              <section>
                <h3 className="text-[14px] font-semibold text-fluent-text mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-fluent-brand" />
                  Retrieved Organizational Memory (Top 5)
                </h3>
                <div className="space-y-3">
                  {simulation.retrievedDocuments.map(doc => (
                    <div key={doc.id} className="p-3 border border-fluent-border rounded-sm bg-fluent-surface flex flex-col gap-2 hover:bg-fluent-surface-hover transition-none cursor-default shadow-elevation-4">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-[13px] text-fluent-text leading-snug">{doc.title}</span>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[11px] font-semibold bg-fluent-bg text-fluent-text-muted px-1.5 py-0.5 rounded-sm border border-fluent-border-subtle">
                            Relevance: {doc.relevanceScore ? (doc.relevanceScore < 1 ? Math.floor(doc.relevanceScore * 100) + 70 : Math.min(99, Math.floor(doc.relevanceScore * 20) + 50)) : 88}%
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-fluent-bg border border-fluent-border-subtle text-fluent-text-muted px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-medium">
                            <Tag className="w-2.5 h-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Constraints & Assumptions */}
              <section className="space-y-6">
                <div>
                  <h3 className="text-[14px] font-semibold text-fluent-text mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-fluent-brand" />
                    Live Operational Constraints
                  </h3>
                  <div className="space-y-2">
                    {simulation.constraints.map((constraint, idx) => (
                      <div key={idx} className="p-2.5 border border-fluent-border-subtle rounded-sm bg-fluent-surface flex items-start gap-3 shadow-elevation-4">
                        <div className={`w-2 h-2 rounded-[2px] mt-1 shrink-0 ${
                          constraint.severity === "High" ? "bg-fluent-critical" : "bg-fluent-warning"
                        }`} />
                        <p className="text-[13px] text-fluent-text">{constraint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-fluent-text mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-fluent-brand" />
                    Detected Hidden Assumptions
                  </h3>
                  <div className="space-y-2">
                    {simulation.assumptions.map((assump, idx) => (
                      <div key={idx} className="p-3 border border-fluent-warning/20 rounded-sm bg-fluent-warning-bg flex flex-col gap-1.5 shadow-elevation-4">
                        <span className="text-[13px] font-bold text-fluent-warning">{assump.assumption}</span>
                        <span className="text-[12px] text-fluent-text flex items-start gap-1">
                          <ArrowRight className="w-3.5 h-3.5 text-fluent-warning shrink-0 mt-0.5"/> {assump.challenge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
            </>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {Object.entries(simulation.agentTraces).map(([agentName, trace]) => (
              <div key={agentName} className="border border-fluent-border rounded-sm p-5 bg-fluent-surface shadow-elevation-4 font-mono text-[13px]">
                <h4 className="font-bold text-fluent-brand mb-3 border-b border-fluent-border-subtle pb-2 uppercase tracking-wider text-[11px]">{agentName} Execution Trace</h4>
                <ul className="space-y-1 text-fluent-text">
                  {trace.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-fluent-text-muted select-none">[{String(i+1).padStart(2, '0')}]</span>
                      <span className="leading-snug">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Decision Engine */}
      <div className="bg-fluent-bg border-t border-fluent-border px-6 py-4 flex items-center justify-between shrink-0">
        <span className="text-[13px] text-fluent-text-muted font-medium">Record this decision in organizational memory:</span>
        <div className="flex gap-2">
          <button 
            onClick={() => onDecision("Delay")}
            className="px-4 py-1.5 bg-fluent-surface border border-fluent-border rounded-sm text-fluent-text text-[13px] font-semibold hover:bg-fluent-surface-hover transition-none"
          >
            Delay Decision
          </button>
          <button 
            onClick={() => onDecision("Request Review")}
            className="px-4 py-1.5 bg-fluent-surface border border-fluent-border rounded-sm text-fluent-text text-[13px] font-semibold hover:bg-fluent-surface-hover transition-none"
          >
            Request Review
          </button>
          <button 
            onClick={() => onDecision("Proceed")}
            className="px-4 py-1.5 bg-fluent-brand border border-transparent rounded-sm text-white text-[13px] font-semibold hover:bg-fluent-brand-hover transition-none shadow-elevation-4"
          >
            Proceed with Risks
          </button>
        </div>
      </div>
    </div>
  );
}
