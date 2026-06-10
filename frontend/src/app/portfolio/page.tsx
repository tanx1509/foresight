"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Activity, ChevronRight, BarChart3, Search, ShieldAlert } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function DecisionInbox() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All Views");

  useEffect(() => {
    const API_URL = getApiUrl();
    fetch(`${API_URL}/api/decision-history`)
      .then(r => r.json())
      .then(data => setDecisions(data))
      .catch(err => console.error(err));
  }, []);

  const pendingReviews = decisions.filter(d => d.status === "Under Review");
  const activeExecutions = decisions.filter(d => ["Approved", "Execution Started", "Blocked", "Escalated"].includes(d.status));
  const completed = decisions.filter(d => d.status === "Completed" || d.status === "Resolved");

  return (
    <div className="flex flex-col min-h-screen bg-fluent-bg text-fluent-text font-sans pb-24">
      {/* Top Header */}
      <header className="h-12 bg-fluent-surface border-b border-fluent-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-fluent-brand text-white rounded-[4px] flex items-center justify-center font-bold text-[11px]">
            F
          </div>
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="font-semibold text-fluent-text">Engineering Operations</span>
            <ChevronRight className="w-3.5 h-3.5 text-fluent-text-muted" />
            <span className="text-fluent-text-muted">Decision Inbox</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="px-4 py-1.5 bg-fluent-brand hover:bg-fluent-brand-hover text-white text-[12px] font-semibold rounded-sm">New Investigation</button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto w-full p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-fluent-text tracking-tight">My Decision Inbox</h1>
          <div className="flex bg-fluent-surface border border-fluent-border rounded-sm overflow-hidden text-[13px] font-semibold">
            <button onClick={() => setActiveTab("All Views")} className={`px-4 py-1.5 cursor-pointer transition-all duration-200 ${activeTab === 'All Views' ? 'bg-[#E1DFDD] text-[#323130]' : 'text-fluent-text hover:bg-fluent-surface-hover'}`}>All Views</button>
            <button onClick={() => setActiveTab("Engineering Director")} className={`px-4 py-1.5 cursor-pointer transition-all duration-200 ${activeTab === 'Engineering Director' ? 'bg-[#E1DFDD] text-[#323130]' : 'text-fluent-text hover:bg-fluent-surface-hover'}`}>Engineering Director</button>
            <button onClick={() => setActiveTab("Executive Portfolio")} className={`px-4 py-1.5 cursor-pointer transition-all duration-200 ${activeTab === 'Executive Portfolio' ? 'bg-[#E1DFDD] text-[#323130]' : 'text-fluent-text hover:bg-fluent-surface-hover'}`}>Executive Portfolio</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Pending Reviews */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-fluent-warning pb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-fluent-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-fluent-warning" />
                Action Required ({pendingReviews.length})
              </h2>
            </div>
            {pendingReviews.map(d => (
              <div key={d.decisionId} onClick={() => router.push(`/plan/${d.decisionId}`)} className="bg-fluent-surface border border-fluent-border-subtle rounded-sm p-4 hover:border-fluent-warning cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-semibold text-fluent-warning bg-fluent-warning-bg px-2 py-0.5 rounded-sm border border-fluent-warning/20">Under Review</span>
                  <span className="text-[11px] text-fluent-text-muted">{new Date(d.timestamp).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-[14px] text-fluent-text mb-1">{d.simulationData.context.decisionType}</h3>
                <p className="text-[12px] text-fluent-text-muted mb-3">Ticket {d.reviewTicket?.id || 'N/A'}</p>
                <div className="flex items-center justify-between text-[11px] font-medium border-t border-fluent-border-subtle pt-2">
                  <span className="text-fluent-text-muted">Confidence: <span className="text-fluent-text">{d.simulationData.context.confidence}</span></span>
                  <span className="text-fluent-brand hover:underline">Review Plan &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Active Executions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-[#0078D4] pb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-fluent-text flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0078D4]" />
                Active Executions ({activeExecutions.length})
              </h2>
            </div>
            {activeExecutions.map(d => (
              <div key={d.decisionId} onClick={() => router.push(`/plan/${d.decisionId}`)} className="bg-fluent-surface border border-fluent-border-subtle rounded-sm p-4 hover:border-[#0078D4] cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm border ${
                    ['Blocked', 'Escalated'].includes(d.status) ? 'bg-fluent-critical-bg text-fluent-critical border-fluent-critical/20' : 'bg-[#E1DFDD] text-[#323130] border-transparent'
                  }`}>{d.status}</span>
                </div>
                <h3 className="font-semibold text-[14px] text-fluent-text mb-1">{d.simulationData.context.decisionType}</h3>
                <p className="text-[12px] text-fluent-text-muted mb-3 line-clamp-2">Owner: {typeof d.simulationData.context.owner === 'object' ? d.simulationData.context.owner.name : d.simulationData.context.owner}</p>
                <div className="w-full bg-fluent-border-subtle h-1 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${['Blocked', 'Escalated'].includes(d.status) ? 'bg-fluent-critical w-1/2' : 'bg-[#0078D4] w-1/4'}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Completed Memory */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-fluent-success pb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-fluent-text flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-fluent-success" />
                Organizational Memory ({completed.length})
              </h2>
            </div>
            {completed.map(d => (
              <div key={d.decisionId} onClick={() => router.push(`/plan/${d.decisionId}`)} className="bg-fluent-surface border border-fluent-border-subtle rounded-sm p-4 hover:border-fluent-success cursor-pointer shadow-sm opacity-80 hover:opacity-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-semibold text-fluent-success bg-fluent-success-bg px-2 py-0.5 rounded-sm border border-fluent-success/20">Completed</span>
                </div>
                <h3 className="font-semibold text-[14px] text-fluent-text mb-1">{d.simulationData.context.decisionType}</h3>
                <p className="text-[11px] text-fluent-text-muted italic bg-fluent-bg p-2 rounded-sm border border-fluent-border-subtle mt-2 line-clamp-2">
                  "{d.outcome?.lessonsLearned || 'Successfully deployed with standard procedures.'}"
                </p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
