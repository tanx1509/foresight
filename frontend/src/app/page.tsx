"use client";

import React, { useState } from "react";
import { MessageSquare, Users, Settings, Bell, Search, Menu, Send, Cpu, ChevronRight } from "lucide-react";
import AgentTimeline from "@/components/AgentTimeline";
import SimulationDashboard from "@/components/SimulationDashboard";
import { FailureSimulation } from "@foresight/shared";

export default function Home() {
  const [simulationState, setSimulationState] = useState<"idle" | "running" | "completed">("idle");
  const [simulationData, setSimulationData] = useState<FailureSimulation | null>(null);
  
  // Interactive Prompt Selection
  const [prompt, setPrompt] = useState("Should we launch the July 15 SSO migration?");

  const startSimulation = async () => {
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

  const handleDecision = async (action: string) => {
    try {
      await fetch("http://localhost:3001/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, simulationData })
      });
      alert(`Decision recorded: ${action}`);
      setSimulationState("idle");
      setSimulationData(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 text-gray-900 font-sans">
      
      {/* Sidebar Navigation */}
      <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 space-y-6">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-lg mb-4">
          F
        </div>
        <button className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-200 transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        <button className="p-2 text-blue-600 rounded-md bg-gray-200 transition-colors border-l-2 border-blue-600">
          <MessageSquare className="w-6 h-6" />
        </button>
        <button className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-200 transition-colors">
          <Users className="w-6 h-6" />
        </button>
        <div className="flex-1" />
        <button className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-200 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-gray-500" />
            <h1 className="font-semibold text-lg ml-2">Engineering Leadership</h1>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 font-medium">Strategic Decisions</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            You
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden relative">
          
          <div className={`flex flex-col transition-all duration-500 ease-in-out ${simulationState === "idle" ? "w-full max-w-4xl mx-auto" : "w-1/3 border-r border-gray-200 bg-white"}`}>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center text-xs text-gray-400 my-4 font-semibold uppercase tracking-wider">Today</div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">SC</div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-gray-900">Sarah Chen</span>
                    <span className="text-xs text-gray-500">10:42 AM</span>
                  </div>
                  <p className="text-gray-800 mt-1 bg-gray-100 p-3 rounded-lg rounded-tl-none inline-block shadow-sm">
                    Team, we need to run a FORESIGHT analysis on our upcoming initiative before we finalize the rollout.
                  </p>
                </div>
              </div>

              {simulationState === "idle" && (
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center justify-center">
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl w-full max-w-lg shadow-sm">
                    <Cpu className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 text-lg text-center">Dynamic FORESIGHT AI</h3>
                    <p className="text-sm text-gray-600 mt-2 mb-5 text-center">
                      Select a prompt below to see the Phase 1 dynamic retrieval and generation in action.
                    </p>
                    
                    <div className="space-y-2 mb-5">
                      {[
                        "Should we launch the July 15 SSO migration?",
                        "Should we migrate our CRM to Salesforce?",
                        "Can we deploy the new payment gateway next week?"
                      ].map(p => (
                        <button 
                          key={p}
                          onClick={() => setPrompt(p)}
                          className={`w-full text-left px-4 py-2 text-sm rounded-md border transition-all ${prompt === p ? 'border-blue-600 bg-white font-medium text-blue-600' : 'border-transparent hover:bg-gray-100 text-gray-600'}`}
                        >
                          "{p}"
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded border border-gray-200">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input 
                        className="w-full text-sm outline-none bg-transparent" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>

                    <button 
                      onClick={startSimulation}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm flex justify-center items-center gap-2 transition-colors"
                    >
                      <Cpu className="w-4 h-4" />
                      Run Analysis on Prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {simulationState !== "idle" && (
            <div className="flex-1 bg-gray-50 p-6 overflow-hidden relative flex flex-col animate-in slide-in-from-right-8 duration-500">
              {simulationState === "running" && (
                <div className="flex-1 flex items-center justify-center">
                  <AgentTimeline onComplete={handleTimelineComplete} />
                </div>
              )}
              {simulationState === "completed" && simulationData && (
                <div className="flex-1 h-full overflow-hidden">
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
    </div>
  );
}
