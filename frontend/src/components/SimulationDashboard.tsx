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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            FORESIGHT Phase 1 Simulation
          </h2>
          <p className="text-sm text-gray-500 mt-1">Context: {simulation.context.decisionType} | Deadline: {simulation.context.deadline}</p>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-2 bg-gray-200/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("scenarios")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "scenarios" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("reasoning")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "reasoning" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="flex items-center gap-1.5"><BrainCircuit className="w-4 h-4"/> Reasoning Trace</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "scenarios" ? (
          <div className="space-y-8">
            {/* Scenarios */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Predicted Failure Scenarios
              </h3>
              <div className="grid gap-4">
                {simulation.scenarios.map((scenario) => {
                  const isExpanded = expandedScenarios[scenario.id];
                  return (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg bg-white shadow-md overflow-hidden transition-all">
                      <div 
                        className="p-5 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
                        onClick={() => toggleScenario(scenario.id)}
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                            {scenario.title}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium mt-1">Impact: {scenario.impact}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          scenario.severity === "Critical" ? "bg-red-100 text-red-700" :
                          scenario.severity === "High" ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {scenario.severity}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                          <div className="bg-gray-50 rounded-md p-4 mb-4">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Causal Chain</h5>
                            <ul className="space-y-2">
                              {scenario.causalChain.map((chain, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                  <span>{chain}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Expandable Evidence Cards */}
                          {scenario.supportingEvidenceIds.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supporting Evidence</h5>
                              <div className="space-y-2">
                                {scenario.supportingEvidenceIds.map(docId => {
                                  const doc = simulation.retrievedDocuments.find(d => d.id === docId);
                                  return doc ? (
                                    <div key={doc.id} className="border border-purple-100 bg-purple-50/30 p-3 rounded-md text-sm">
                                      <div className="font-semibold text-purple-900 mb-1 flex items-center justify-between">
                                        {doc.title}
                                        <span className="text-xs bg-white px-2 py-0.5 rounded-full text-purple-700 border border-purple-200">Relevance: {doc.relevanceScore}</span>
                                      </div>
                                      <p className="text-gray-700 text-xs italic">"{doc.content}"</p>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          <div className="bg-blue-50/50 rounded-md p-4">
                            <h5 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Mitigation Recommendations</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {scenario.mitigationRecommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-gray-700">{rec}</li>
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
                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  Retrieved Organizational Memory (Top 5)
                </h3>
                <div className="space-y-3">
                  {simulation.retrievedDocuments.map(doc => (
                    <div key={doc.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-gray-900 leading-snug">{doc.title}</span>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">TF-IDF: {doc.relevanceScore}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1">
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
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    Live Operational Constraints
                  </h3>
                  <div className="space-y-2">
                    {simulation.constraints.map((constraint, idx) => (
                      <div key={idx} className="p-2.5 border border-gray-200 rounded-md bg-gray-50 flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          constraint.severity === "High" ? "bg-red-500" : "bg-yellow-500"
                        }`} />
                        <p className="text-sm text-gray-700">{constraint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-gray-500" />
                    Detected Hidden Assumptions
                  </h3>
                  <div className="space-y-2">
                    {simulation.assumptions.map((assump, idx) => (
                      <div key={idx} className="p-2.5 border border-orange-100 rounded-md bg-orange-50/50 flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">{assump.assumption}</span>
                        <span className="text-xs text-orange-800 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3"/> {assump.challenge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {Object.entries(simulation.agentTraces).map(([agentName, trace]) => (
              <div key={agentName} className="border border-gray-200 rounded-md p-4 bg-gray-50 font-mono text-sm">
                <h4 className="font-bold text-blue-600 mb-2 border-b border-gray-200 pb-2">{agentName} Execution Trace</h4>
                <ul className="space-y-1 text-gray-700">
                  {trace.map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 select-none">{String(i+1).padStart(2, '0')}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Decision Engine */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">Record this decision in organizational memory:</span>
        <div className="flex gap-3">
          <button 
            onClick={() => onDecision("Delay")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Delay Decision
          </button>
          <button 
            onClick={() => onDecision("Request Review")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Request Review
          </button>
          <button 
            onClick={() => onDecision("Proceed")}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
          >
            Proceed with Risks
          </button>
        </div>
      </div>
    </div>
  );
}
