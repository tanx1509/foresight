"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, PlayCircle, TerminalSquare, Activity } from "lucide-react";

interface Props {
  onComplete: () => void;
  prompt: string;
}

export default function AgentTimeline({ onComplete, prompt }: Props) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [startTime] = useState<Date>(new Date());
  const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);

  const agents = [
    { name: "Signal", message: "Decision Context Extracted" },
    { name: "Historian", message: "Retrieved 5 relevant documents" },
    { name: "Auditor", message: "Constraints evaluated" },
    { name: "Challenger", message: "Assumptions generated" },
    { name: "Synthesizer", message: "Scenarios synthesized" },
  ];

  const logMessages = [
    "Initializing Decision Pipeline...",
    "Validating authentication & organizational context...",
    "Decision category identified.",
    `Parsing parameters: "${prompt.substring(0, 30)}..."`,
    "Corpus Match Found: 5 historical precedents located.",
    "TF-IDF vector space alignment completed.",
    "Cross-referencing active DevOps state...",
    "Sprint Capacity Retrieved from Platform Team.",
    "Constraint Validation Completed.",
    "Historical Investigation Located & Parsed.",
    "Evaluating domain-specific risk matrices...",
    "Causal chains validated against telemetry.",
    "Work Items Generated in memory.",
    "Approval Chain Built based on severity.",
    "Execution complete."
  ];

  useEffect(() => {
    let step = 0;
    let logIndex = 0;
    
    // Log streaming
    const logInterval = setInterval(() => {
      if (logIndex < logMessages.length) {
        setLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          msg: logMessages[logIndex]
        }]);
        logIndex++;
      }
    }, 200);

    // Agent status
    const agentInterval = setInterval(() => {
      step += 1;
      if (step >= agents.length + 1) {
        clearInterval(agentInterval);
        clearInterval(logInterval);
        setTimeout(() => onComplete(), 500);
      } else {
        setActiveStep(step);
      }
    }, 600);

    return () => {
      clearInterval(agentInterval);
      clearInterval(logInterval);
    };
  }, [prompt]);

  return (
    <div className="w-full h-full bg-fluent-surface text-fluent-text p-6 overflow-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Analysis Session */}
        <div className="col-span-1 border border-fluent-border rounded-sm bg-fluent-surface flex flex-col">
          <div className="bg-fluent-bg border-b border-fluent-border px-4 py-2 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-fluent-brand" />
            <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Analysis Session</h3>
          </div>
          <div className="p-4 space-y-4 text-[13px]">
            <div className="flex justify-between items-center border-b border-fluent-border-subtle pb-2">
              <span className="text-fluent-text-muted">Status</span>
              <span className="font-semibold text-fluent-brand flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-fluent-border-subtle pb-2">
              <span className="text-fluent-text-muted">Started</span>
              <span className="text-fluent-text font-mono">{startTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between items-start pb-2">
              <span className="text-fluent-text-muted shrink-0 mr-4">Prompt</span>
              <span className="text-fluent-text text-right line-clamp-3">{prompt || "Custom Decision Evaluated"}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Agent Activity */}
        <div className="col-span-1 border border-fluent-border rounded-sm bg-fluent-surface flex flex-col">
          <div className="bg-fluent-bg border-b border-fluent-border px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-fluent-text" />
            <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Agent Activity</h3>
          </div>
          <div className="p-4 space-y-3">
            {agents.map((agent, idx) => {
              const isDone = idx < activeStep;
              const isRunning = idx === activeStep;
              const isWaiting = idx > activeStep;

              return (
                <div key={agent.name} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {isDone && <CheckCircle2 className="w-4 h-4 text-fluent-success shrink-0" />}
                    {isRunning && <Loader2 className="w-4 h-4 text-fluent-brand animate-spin shrink-0" />}
                    {isWaiting && <Clock className="w-4 h-4 text-fluent-text-muted shrink-0" />}
                    <span className={`text-[13px] font-semibold ${isDone ? 'text-fluent-text' : isRunning ? 'text-fluent-brand' : 'text-fluent-text-muted'}`}>
                      {agent.name}
                    </span>
                  </div>
                  <div className="pl-6 text-[12px] text-fluent-text-muted">
                    {isDone ? agent.message : isRunning ? "Executing sub-routine..." : "Waiting in queue"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Execution Log */}
        <div className="col-span-1 border border-fluent-border rounded-sm bg-[#1E1E1E] text-[#D4D4D4] flex flex-col font-mono">
          <div className="bg-[#2D2D2D] border-b border-[#3E3E3E] px-4 py-2 flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 text-[#CCCCCC]" />
            <h3 className="text-[13px] font-semibold text-[#CCCCCC] uppercase tracking-wider">Execution Log</h3>
          </div>
          <div className="p-4 space-y-1.5 text-[12px] overflow-y-auto flex-1 h-[300px]">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-[#858585] shrink-0">{log?.time}</span>
                <span className={`${log?.msg?.includes('started') ? 'text-[#4EC9B0]' : log?.msg?.includes('failed') ? 'text-[#F14C4C]' : 'text-[#D4D4D4]'}`}>
                  {log?.msg || "..."}
                </span>
              </div>
            ))}
            <div className="animate-pulse text-[#858585]">_</div>
          </div>
        </div>

      </div>
    </div>
  );
}
