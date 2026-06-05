"use client";

import React, { useEffect, useState } from "react";
import { Search, Brain, FileSearch, ShieldAlert, Cpu } from "lucide-react";

interface Props {
  onComplete: () => void;
}

export default function AgentTimeline({ onComplete }: Props) {
  const [activeAgent, setActiveAgent] = useState<number>(0);

  const agents = [
    { name: "SIGNAL", desc: "Extracting decision context and scope...", icon: Brain, color: "text-blue-500" },
    { name: "HISTORIAN", desc: "Retrieving relevant organizational memory...", icon: FileSearch, color: "text-purple-500" },
    { name: "AUDITOR", desc: "Checking live operational constraints...", icon: Search, color: "text-teal-500" },
    { name: "CHALLENGER", desc: "Identifying hidden assumptions...", icon: ShieldAlert, color: "text-orange-500" },
    { name: "SYNTHESIZER", desc: "Generating failure simulation...", icon: Cpu, color: "text-indigo-500" },
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= agents.length) {
        clearInterval(interval);
        setTimeout(() => onComplete(), 500); // slight delay before showing dashboard
      } else {
        setActiveAgent(current);
      }
    }, 2000); // 2 seconds per agent for dramatic effect

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg teams-shadow border border-gray-200 p-8 w-full max-w-2xl mx-auto my-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
        <Cpu className="w-6 h-6 text-teams-brand animate-pulse" />
        FORESIGHT Engine Executing
      </h3>
      
      <div className="space-y-6">
        {agents.map((agent, idx) => {
          const isActive = idx === activeAgent;
          const isDone = idx < activeAgent;
          const Icon = agent.icon;

          return (
            <div key={agent.name} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'opacity-100 scale-105' : isDone ? 'opacity-50' : 'opacity-20'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-50 animate-pulse border border-blue-200' : isDone ? 'bg-gray-100' : 'bg-gray-50'}`}>
                <Icon className={`w-6 h-6 ${isActive || isDone ? agent.color : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg tracking-wide">{agent.name}</h4>
                <p className="text-sm text-gray-500">{isDone ? 'Completed.' : isActive ? agent.desc : 'Waiting...'}</p>
              </div>
              <div>
                {isDone && <span className="text-green-500 text-sm font-medium">✓ Done</span>}
                {isActive && <span className="text-teams-brand text-sm font-medium animate-pulse">Running...</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
