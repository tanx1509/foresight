"use client";

import React from "react";
import { CheckCircle, AlertTriangle, ShieldAlert, FileText, Database, GitMerge, Activity, Server, ArrowRight } from "lucide-react";
import { FailureSimulation } from "@foresight/shared";

interface Props {
  simulation: FailureSimulation;
  onDecision: (action: "Proceed" | "Delay" | "Request Review") => void;
}

export default function SimulationDashboard({ simulation, onDecision }: Props) {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg teams-shadow border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-teams-bg border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teams-critical" />
            FORESIGHT Failure Simulation
          </h2>
          <p className="text-sm text-gray-500 mt-1">Context: {simulation.context.decisionType}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
            {simulation.scenarios.length} Critical Risks Found
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Scenarios */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Predicted Failure Scenarios
          </h3>
          <div className="grid gap-4">
            {simulation.scenarios.map((scenario) => (
              <div key={scenario.id} className="border border-gray-200 rounded-lg p-5 hover:border-teams-brand transition-colors bg-white teams-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900 text-lg">{scenario.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    scenario.severity === "Critical" ? "bg-red-100 text-red-700" :
                    scenario.severity === "High" ? "bg-orange-100 text-orange-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {scenario.severity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 font-medium">Impact: {scenario.impact}</p>
                
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Predicted Causal Chain</h5>
                  <ul className="space-y-2">
                    {scenario.causalChain.map((chain, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <ArrowRight className="w-4 h-4 text-teams-brand shrink-0 mt-0.5" />
                        <span>{chain}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50/50 rounded-md p-4">
                  <h5 className="text-xs font-semibold text-teams-brand uppercase tracking-wider mb-2">Mitigation Recommendations</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {scenario.mitigationRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Supporting Evidence */}
        <div className="grid grid-cols-2 gap-6">
          <section>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              Retrieved Organizational Memory
            </h3>
            <div className="space-y-3">
              {simulation.retrievedDocuments.map(doc => (
                <div key={doc.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-gray-900">{doc.title}</span>
                    <span className="text-xs text-gray-500">{doc.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{doc.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              Live Operational Constraints
            </h3>
            <div className="space-y-3">
              {simulation.constraints.map((constraint, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    constraint.severity === "High" ? "bg-red-500" : "bg-yellow-500"
                  }`} />
                  <p className="text-sm text-gray-700">{constraint.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

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
