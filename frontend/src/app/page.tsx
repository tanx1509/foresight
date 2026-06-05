"use client";

import React, { useState } from "react";
import { MessageSquare, Users, Settings, Bell, Search, Menu, Send, Cpu, ChevronRight } from "lucide-react";
import AgentTimeline from "@/components/AgentTimeline";
import SimulationDashboard from "@/components/SimulationDashboard";
import { FailureSimulation } from "@foresight/shared";

export default function Home() {
  const [simulationState, setSimulationState] = useState<"idle" | "running" | "completed">("idle");
  const [simulationData, setSimulationData] = useState<FailureSimulation | null>(null);

  const startSimulation = async () => {
    setSimulationState("running");
    
    // Fetch from our local backend while the timeline plays
    try {
      const res = await fetch("http://localhost:3001/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Should we launch the July 15 SSO migration?" })
      });
      const data = await res.json();
      setSimulationData(data);
    } catch (err) {
      console.error("Failed to fetch simulation:", err);
      // Fallback or handle error
    }
  };

  const handleTimelineComplete = () => {
    if (simulationData) {
      setSimulationState("completed");
    } else {
      // In case network is slow, wait a bit or show error. For MVP, assume it's fast.
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
    <div className="flex h-screen w-full bg-teams-bg text-teams-text font-sans">
      
      {/* Sidebar Navigation (Teams Style) */}
      <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 space-y-6">
        <div className="w-10 h-10 bg-teams-brand text-white rounded-md flex items-center justify-center font-bold text-lg mb-4">
          F
        </div>
        <button className="p-2 text-gray-500 hover:text-teams-brand rounded-md hover:bg-gray-200 transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        <button className="p-2 text-teams-brand rounded-md bg-gray-200 transition-colors border-l-2 border-teams-brand">
          <MessageSquare className="w-6 h-6" />
        </button>
        <button className="p-2 text-gray-500 hover:text-teams-brand rounded-md hover:bg-gray-200 transition-colors">
          <Users className="w-6 h-6" />
        </button>
        <div className="flex-1" />
        <button className="p-2 text-gray-500 hover:text-teams-brand rounded-md hover:bg-gray-200 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-gray-500" />
            <h1 className="font-semibold text-lg ml-2">Engineering Leadership</h1>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 font-medium">SSO Migration Readiness</span>
          </div>
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-gray-100 border-transparent rounded-md py-1.5 pl-9 pr-4 text-sm focus:bg-white focus:border-teams-brand focus:ring-1 focus:ring-teams-brand transition-all outline-none"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            You
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 flex overflow-hidden relative">
          
          {/* Left Chat Area */}
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
                    Team, we need a final Go/No-Go on the July 15 SSO migration from SAML to OIDC. The Identity team is ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">MW</div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-gray-900">Marcus Webb</span>
                    <span className="text-xs text-gray-500">10:45 AM</span>
                  </div>
                  <p className="text-gray-800 mt-1 bg-gray-100 p-3 rounded-lg rounded-tl-none inline-block shadow-sm">
                    I'm confident. We've tested the core routes and the load balancer config is updated. Let's push it this weekend.
                  </p>
                </div>
              </div>

              {simulationState === "idle" && (
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center justify-center">
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl w-full max-w-lg text-center shadow-sm">
                    <Cpu className="w-10 h-10 text-teams-brand mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 text-lg">FORESIGHT AI Assistant</h3>
                    <p className="text-sm text-gray-600 mt-2 mb-5">
                      Before finalizing this decision, simulate potential failures using organizational memory and live constraints.
                    </p>
                    <button 
                      onClick={startSimulation}
                      className="w-full bg-teams-brand hover:bg-teams-brand-hover text-white font-semibold py-2.5 px-4 rounded-md shadow-sm flex justify-center items-center gap-2 transition-colors"
                    >
                      <Cpu className="w-4 h-4" />
                      Run FORESIGHT Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 flex items-center focus-within:border-teams-brand focus-within:ring-1 focus-within:ring-teams-brand transition-all">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-gray-700"
                />
                <button className="p-1.5 text-gray-400 hover:text-teams-brand transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Simulation Area */}
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
