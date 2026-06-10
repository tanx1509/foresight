"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, ShieldAlert, Users, Network, Activity, ChevronRight, FileText, CheckSquare, PlayCircle, Loader2, ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function ExecutionPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecord = () => {
    const API_URL = getApiUrl();
    fetch(`${API_URL}/api/decision-history`)
      .then(r => r.json())
      .then(data => {
        const found = data.find((d: any) => d.decisionId === params.id);
        if (found) {
          setRecord(found);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecord();
  }, [params.id]);

  const updateState = async (newState: string, outcomePayload?: any) => {
    try {
      const API_URL = getApiUrl();
      await fetch(`${API_URL}/api/decisions/${params.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newState, outcome: outcomePayload })
      });
      fetchRecord();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-fluent-bg flex items-center justify-center text-fluent-text"><Loader2 className="w-6 h-6 animate-spin text-fluent-brand" /></div>;
  }

  if (!record) {
    return <div className="min-h-screen bg-fluent-bg flex items-center justify-center text-fluent-text">Plan not found for ID: {params.id}</div>;
  }

  const sim = record.simulationData;
  const investigationId = sim.context.decisionType.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) + 1000;

  const isHighRisk = sim.context.confidence !== 'High' || sim.scenarios.some((s:any) => s.severity === 'Critical');

  const ownerName = typeof record.simulationData.context.owner === 'object' ? record.simulationData.context.owner.name : record.simulationData.context.owner;

  return (
    <div className="flex flex-col h-full bg-fluent-bg overflow-y-auto">
      {/* Header */}
      <header className="bg-fluent-surface border-b border-fluent-border sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="w-8 h-8 flex items-center justify-center hover:bg-fluent-surface-hover rounded-sm text-fluent-text transition-all duration-200 cursor-pointer hover:shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[20px] font-semibold text-fluent-text">Execution Plan: {record.simulationData.context.decisionType}</h1>
            </div>
            <p className="text-[13px] text-fluent-text-muted">ID: {record.decisionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-fluent-text-muted uppercase tracking-wider mb-0.5">Project Owner</p>
            <p className="text-[13px] font-medium text-fluent-text">{ownerName}</p>
          </div>          <div className="w-6 h-6 bg-fluent-brand text-white rounded-[4px] flex items-center justify-center font-bold text-[11px]">
            F
          </div>
          <div className="flex items-center gap-1.5 text-[13px]">
            <button onClick={() => router.push('/')} className="font-semibold text-fluent-text hover:text-fluent-brand transition-colors">Engineering Operations</button>
            <ChevronRight className="w-3.5 h-3.5 text-fluent-text-muted" />
            <span className="font-semibold text-fluent-text">Decision Investigation #{investigationId}</span>
            <ChevronRight className="w-3.5 h-3.5 text-fluent-text-muted" />
            <span className="text-fluent-text-muted">Execution Plan</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto w-full p-6 space-y-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Section A & B: Summary and Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="col-span-2 bg-fluent-surface border border-fluent-border rounded-sm shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="w-6 h-6 text-fluent-brand" />
              <div>
                <h2 className="text-[22px] font-semibold text-fluent-text">Execution Plan: {sim.context.decisionType}</h2>
                <p className="text-[13px] text-fluent-text-muted">Investigation #{investigationId} • Generated {new Date(record.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-[13px]">
              <div>
                <span className="block text-fluent-text-muted mb-1 uppercase text-[11px] font-semibold tracking-wider">Owner</span>
                <span className="font-medium text-fluent-text flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#E1DFDD] flex items-center justify-center text-[10px] text-[#323130] font-bold">{ownerName.charAt(0)}</div> {ownerName}</span>
              </div>
              <div>
                <span className="block text-fluent-text-muted mb-1 uppercase text-[11px] font-semibold tracking-wider">Status</span>
                {record.status === "Approved" ? (
                  <span className="inline-block px-2 py-0.5 bg-fluent-success-bg text-fluent-success text-[12px] font-semibold rounded-sm border border-fluent-success/20">Approved for Execution</span>
                ) : record.status === "Under Review" ? (
                  <span className="inline-block px-2 py-0.5 bg-fluent-warning-bg text-fluent-warning text-[12px] font-semibold rounded-sm border border-fluent-warning/20">Under Review</span>
                ) : (
                  <span className="inline-block px-2 py-0.5 bg-fluent-border-subtle text-fluent-text text-[12px] font-semibold rounded-sm border border-fluent-border">{record.status}</span>
                )}
              </div>
              <div>
                <span className="block text-fluent-text-muted mb-1 uppercase text-[11px] font-semibold tracking-wider">Confidence Score</span>
                <span className={`font-bold ${sim.context.confidence === 'High' ? 'text-fluent-success' : 'text-fluent-warning'}`}>{sim.context.confidence} (72%)</span>
              </div>
            </div>
          </section>

          <section className={`col-span-1 border rounded-sm shadow-sm p-6 flex flex-col justify-center ${isHighRisk ? 'bg-fluent-warning-bg border-fluent-warning/30' : 'bg-fluent-success-bg border-fluent-success/30'}`}>
            <span className={`block mb-2 uppercase text-[11px] font-bold tracking-wider ${isHighRisk ? 'text-fluent-warning' : 'text-fluent-success'}`}>Recommended Path</span>
            <h3 className={`text-[18px] font-semibold leading-snug mb-3 ${isHighRisk ? 'text-[#733B00]' : 'text-[#0F5430]'}`}>
              {isHighRisk ? "Proceed With Controlled Pilot Rollout" : "Proceed With Standard Execution"}
            </h3>
            <p className={`text-[13px] font-medium ${isHighRisk ? 'text-[#9C5700]' : 'text-[#107C41]'}`}>
              {isHighRisk ? "High operational risk detected. Requires phased deployment and active monitoring." : "Confidence is high. Standard deployment procedures apply."}
            </p>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Timeline & Workstreams */}
          <div className="col-span-2 space-y-6">
            
            {/* Section C: Execution Timeline */}
            <section className="bg-fluent-surface border border-fluent-border rounded-sm shadow-sm">
              <div className="bg-fluent-bg border-b border-fluent-border px-4 py-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-fluent-text-muted" />
                <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Execution Timeline</h3>
              </div>
              <div className="p-6">
                <div className="relative border-l-2 border-fluent-border-subtle ml-3 space-y-8">
                  {record.timeline ? record.timeline.map((phaseData: any, idx: number) => {
                    // Logic to determine dot color
                    let dotColor = "bg-fluent-border";
                    let isCurrent = false;
                    let isBlocked = false;

                    // Simple mock mapping to statuses for demo purposes
                    if (idx === 0) {
                      dotColor = ["Execution Started", "Blocked", "Escalated", "Resolved", "Completed"].includes(record.status) ? "bg-fluent-success" : "bg-fluent-brand";
                    } else if (idx === 1) {
                      if (["Blocked", "Escalated"].includes(record.status)) { dotColor = "bg-fluent-critical"; isBlocked = true; }
                      else if (["Resolved", "Completed"].includes(record.status)) dotColor = "bg-fluent-success";
                      else if (record.status === "Execution Started") { dotColor = "bg-fluent-brand animate-pulse"; isCurrent = true; }
                    } else if (idx === 2) {
                      if (record.status === "Completed") dotColor = "bg-fluent-success";
                      else if (record.status === "Resolved") { dotColor = "bg-fluent-brand animate-pulse"; isCurrent = true; }
                    } else if (idx === 3) {
                      if (record.status === "Completed") dotColor = "bg-fluent-success";
                    }

                    return (
                      <div key={idx} className="relative pl-6">
                        <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-fluent-surface ${dotColor}`}></div>
                        <h4 className="text-[14px] font-semibold text-fluent-text flex items-center gap-2">
                          {phaseData.phase}: {phaseData.title}
                          {isBlocked && <span className="text-[10px] bg-fluent-critical-bg text-fluent-critical px-1.5 py-0.5 rounded-sm">BLOCKED</span>}
                        </h4>
                        <p className="text-[13px] text-fluent-text-muted mt-1">
                          {isBlocked ? "Halted: Blockage detected." : phaseData.description}
                        </p>
                      </div>
                    );
                  }) : (
                    <div className="text-[13px] text-fluent-text-muted">No timeline generated.</div>
                  )}
                </div>
              </div>
            </section>

            {/* Section D: Generated Workstreams */}
            <section className="bg-fluent-surface border border-fluent-border rounded-sm shadow-sm">
              <div className="bg-fluent-bg border-b border-fluent-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-fluent-text-muted" />
                  <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Generated Workstreams</h3>
                </div>
                <span className="text-[11px] font-semibold text-fluent-brand bg-fluent-brand-subtle px-2 py-0.5 rounded-sm">Synced to ADO</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="border border-fluent-border-subtle rounded-sm p-3 bg-fluent-bg">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[13px] font-semibold text-fluent-text">Platform Engineering</h4>
                    <span className="text-[12px] text-fluent-text-muted">{sim.scenarios.length} Tasks</span>
                  </div>
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-[#0078D4]">
                    {sim.scenarios.map((s:any, i:number) => (
                      <div key={i} className="text-[12px] text-fluent-text flex items-center justify-between">
                        <span>{s.title}</span>
                        <span className="text-[#0078D4] font-mono text-[10px]">#8{4+i}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-fluent-border-subtle rounded-sm p-3 bg-fluent-bg flex justify-between items-center opacity-70">
                  <h4 className="text-[13px] font-semibold text-fluent-text">Security Team</h4>
                  <span className="text-[12px] text-fluent-text-muted">2 Tasks</span>
                </div>
                <div className="border border-fluent-border-subtle rounded-sm p-3 bg-fluent-bg flex justify-between items-center opacity-70">
                  <h4 className="text-[13px] font-semibold text-fluent-text">SRE Team</h4>
                  <span className="text-[12px] text-fluent-text-muted">1 Task</span>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Dependencies, Metrics, Approvals */}
          <div className="col-span-1 space-y-6">
            
            {/* Section G: Approval Workflow */}
            <section className="bg-fluent-surface border border-fluent-border rounded-sm shadow-sm">
              <div className="bg-fluent-bg border-b border-fluent-border px-4 py-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-fluent-brand" />
                <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Approval Chain</h3>
              </div>
              <div className="p-4 space-y-4">
                {record.approvalChain ? record.approvalChain.map((approver: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    {approver.status === "Approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-fluent-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-fluent-warning" />
                    )}
                    <div>
                      <p className="text-[13px] font-semibold text-fluent-text">{approver.role}</p>
                      <p className={`text-[11px] ${approver.status === "Approved" ? 'text-fluent-text-muted' : 'text-fluent-warning'}`}>{approver.status}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-[13px] text-fluent-text-muted">No approval chain required.</div>
                )}
                
                {record.status === "Under Review" && record.reviewTicket && (
                  <div className="bg-fluent-bg p-3 border border-fluent-border-subtle rounded-sm mt-4">
                    <p className="text-[11px] font-semibold text-fluent-text-muted uppercase tracking-wider mb-2">Review Ticket {record.reviewTicket.id}</p>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-fluent-text-muted">Assigned:</span>
                        <span className="font-semibold text-fluent-text">{record.reviewTicket.assignedTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fluent-text-muted">Status:</span>
                        <span className="font-semibold text-fluent-warning">Pending</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fluent-text-muted">SLA:</span>
                        <span className="font-semibold text-fluent-text">72 Hours</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section E: Dependencies */}
            <section className="bg-fluent-surface border border-fluent-border rounded-sm shadow-sm">
              <div className="bg-fluent-bg border-b border-fluent-border px-4 py-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-fluent-text-muted" />
                <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Dependencies</h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[13px] border-b border-fluent-border-subtle pb-2">
                  <span className="text-fluent-text font-medium">Sprint Capacity</span>
                  <span className="text-fluent-success font-semibold">Allocated</span>
                </div>
                <div className="flex items-center justify-between text-[13px] border-b border-fluent-border-subtle pb-2">
                  <span className="text-fluent-text font-medium">Vendor Confirmation</span>
                  <span className="text-fluent-success font-semibold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-[13px] pb-1">
                  <span className="text-fluent-text font-medium">Rollback Plan</span>
                  <span className="text-fluent-warning font-semibold">Required</span>
                </div>
              </div>
            </section>

            {/* Section F: Success Metrics */}
            <section className="bg-fluent-surface border border-fluent-border rounded-sm shadow-sm">
              <div className="bg-fluent-bg border-b border-fluent-border px-4 py-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-fluent-text-muted" />
                <h3 className="text-[13px] font-semibold text-fluent-text uppercase tracking-wider">Success Metrics</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-fluent-text">Deployment Success Rate</span>
                    <span className="font-semibold">{record.status === "Completed" ? "99.95% (Achieved)" : "Target: 99.9%"}</span>
                  </div>
                  <div className="w-full bg-fluent-border-subtle h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${record.status === "Completed" ? "bg-fluent-success w-full" : "bg-fluent-brand w-1/4"}`}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-fluent-text">Incident Count</span>
                    <span className="font-semibold">{record.status === "Completed" ? "1 (Under Target)" : "Target: < 2"}</span>
                  </div>
                  <div className="w-full bg-fluent-border-subtle h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full bg-fluent-success ${record.status === "Completed" ? "w-1/4" : "w-0"}`}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Outcome Capture Section */}
            {record.status === "Completed" && record.outcome && (
              <section className="bg-fluent-success-bg border border-fluent-success/30 rounded-sm shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-fluent-success/10 border-b border-fluent-success/20 px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-fluent-success" />
                  <h3 className="text-[13px] font-semibold text-fluent-success uppercase tracking-wider">Decision Outcome</h3>
                </div>
                <div className="p-4 space-y-3 text-[13px]">
                  <div className="flex justify-between border-b border-fluent-success/20 pb-2">
                    <span className="text-fluent-text-muted font-semibold">Result</span>
                    <span className="font-bold text-fluent-success">{record.outcome.result}</span>
                  </div>
                  <div>
                    <span className="block text-fluent-text-muted font-semibold mb-1">Lessons Learned</span>
                    <p className="text-fluent-text italic">"{record.outcome.lessonsLearned}"</p>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-fluent-surface border-t border-fluent-border p-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="flex gap-2 items-center bg-fluent-warning-bg border border-fluent-warning/30 p-2 rounded-sm">
          <span className="text-[12px] font-bold text-fluent-warning uppercase tracking-wider flex items-center mr-2">Demo Controls (State: {record.status || "Approved"}):</span>
          {record.status === "Under Review" && <button onClick={() => updateState("Approved")} className="px-3 py-1.5 bg-fluent-success text-white text-[12px] rounded-sm font-semibold">Approve Plan</button>}
          {(record.status === "Approved" || !record.status) && <button onClick={() => updateState("Execution Started")} className="px-3 py-1.5 bg-fluent-bg border border-fluent-border hover:bg-fluent-surface-hover text-fluent-text text-[12px] rounded-sm font-semibold">Start Execution</button>}
          {record.status === "Execution Started" && <button onClick={() => updateState("Blocked")} className="px-3 py-1.5 bg-fluent-critical-bg border border-fluent-critical/30 text-fluent-critical text-[12px] rounded-sm font-semibold">Simulate Blocker</button>}
          {record.status === "Blocked" && <button onClick={() => updateState("Escalated")} className="px-3 py-1.5 bg-fluent-warning-bg border border-fluent-warning/30 text-fluent-warning text-[12px] rounded-sm font-semibold">Escalate Issue</button>}
          {record.status === "Escalated" && <button onClick={() => updateState("Resolved")} className="px-3 py-1.5 bg-fluent-success-bg border border-fluent-success/30 text-fluent-success text-[12px] rounded-sm font-semibold">Resolve Issue</button>}
          {record.status === "Resolved" && <button onClick={() => updateState("Completed", { result: "Successful", deploymentSuccess: 99.95, incidents: 1, lessonsLearned: "Required additional identity federation training for tier 1 support." })} className="px-3 py-1.5 bg-fluent-success text-white text-[12px] rounded-sm font-semibold">Complete Project</button>}
        </div>

        <button 
          onClick={() => router.push('/portfolio')}
          className="px-6 py-2 bg-fluent-brand hover:bg-fluent-brand-hover hover:brightness-110 text-white font-semibold rounded-sm text-[13px] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          Return to Executive Portfolio
        </button>
      </div>
    </div>
  );
}
