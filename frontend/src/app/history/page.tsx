"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  BrainCircuit,
  Activity,
  Layers,
  Users
} from "lucide-react";

interface DecisionRecord {
  scenarioId: string;
  generatedBy: string[];
  evidence: string[];
  constraints: string[];
  assumptions: string[];
  confidence: string;
  timestamp: string;
  azureWorkItemId?: number;
  azureWorkItemTitle?: string;
  azureWorkItemUrl?: string;
}

export default function HistoryDashboard() {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("All");
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${API_URL}/api/decision-history`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch decision history:", err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (index: number) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setExpandedCards(newSet);
  };

  // KPIs Calculation
  const totalDecisions = records.length;
  const uniqueScenarios = new Set(records.map((r) => r.scenarioId)).size;
  const totalEvidence = records.reduce((acc, r) => acc + (r.evidence?.length || 0), 0);
  const trackedAzureIssues = new Set(records.map((r) => r.azureWorkItemId).filter((id) => id != null)).size;
  
  const avgConfidence = useMemo(() => {
    if (records.length === 0) return "N/A";
    const scores = records.map((r) => {
      if (r.confidence === "High") return 3;
      if (r.confidence === "Medium") return 2;
      return 1;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 2.5) return "High";
    if (avg >= 1.5) return "Medium";
    return "Low";
  }, [records]);

  // Filtering & Searching
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchConf = confidenceFilter === "All" || r.confidence === confidenceFilter;
      const searchLower = searchQuery.toLowerCase();
      
      const matchSearch = 
        searchQuery === "" ||
        r.scenarioId.toLowerCase().includes(searchLower) ||
        r.evidence.some(e => e.toLowerCase().includes(searchLower)) ||
        r.constraints.some(c => c.toLowerCase().includes(searchLower)) ||
        r.assumptions.some(a => a.toLowerCase().includes(searchLower));

      return matchConf && matchSearch;
    });
  }, [records, searchQuery, confidenceFilter]);

  const getConfidenceStyle = (conf: string) => {
    if (conf === "High") return "bg-fluent-success-bg text-fluent-success border-fluent-success/20";
    if (conf === "Medium") return "bg-fluent-warning-bg text-fluent-warning border-fluent-warning/20";
    return "bg-fluent-critical-bg text-fluent-critical border-fluent-critical/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fluent-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fluent-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fluent-bg text-fluent-text p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header - Enterprise Native */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-fluent-border pb-4">
          <div>
            <h1 className="text-[24px] font-semibold text-fluent-text tracking-tight">
              Decision Intelligence
            </h1>
            <p className="text-fluent-text-muted mt-1 text-[13px]">
              Organizational memory of AI-driven risk simulations, assumptions, and DevOps synchronization.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-fluent-surface border border-fluent-border rounded-md text-fluent-brand text-[13px] font-semibold fluent-shadow-flyout">
            <BrainCircuit className="w-4 h-4" />
            FORESIGHT Active
          </div>
        </div>

        {/* KPI Row - Dense Azure Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-fluent-surface border border-fluent-border rounded-sm p-3 flex flex-col justify-between fluent-shadow transition-shadow hover:shadow-elevation-8">
            <div className="flex items-center gap-1.5 text-fluent-text-muted mb-1.5">
              <Activity className="w-3.5 h-3.5 text-fluent-brand" />
              <h3 className="text-[11px] uppercase font-semibold tracking-wider">Total Decisions</h3>
            </div>
            <p className="text-[20px] font-light text-fluent-text">{totalDecisions}</p>
          </div>
          <div className="bg-fluent-surface border border-fluent-border rounded-sm p-3 flex flex-col justify-between fluent-shadow transition-shadow hover:shadow-elevation-8">
            <div className="flex items-center gap-1.5 text-fluent-text-muted mb-1.5">
              <Layers className="w-3.5 h-3.5 text-fluent-brand" />
              <h3 className="text-[11px] uppercase font-semibold tracking-wider">Unique Scenarios</h3>
            </div>
            <p className="text-[20px] font-light text-fluent-text">{uniqueScenarios}</p>
          </div>
          <div className="bg-fluent-surface border border-fluent-border rounded-sm p-3 flex flex-col justify-between fluent-shadow transition-shadow hover:shadow-elevation-8">
            <div className="flex items-center gap-1.5 text-fluent-text-muted mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-fluent-brand" />
              <h3 className="text-[11px] uppercase font-semibold tracking-wider">Avg Confidence</h3>
            </div>
            <p className={`text-[20px] font-light ${
              avgConfidence === 'High' ? 'text-fluent-success' : 
              avgConfidence === 'Medium' ? 'text-fluent-warning' : 'text-fluent-critical'
            }`}>{avgConfidence}</p>
          </div>
          <div className="bg-fluent-surface border border-fluent-border rounded-sm p-3 flex flex-col justify-between fluent-shadow transition-shadow hover:shadow-elevation-8">
            <div className="flex items-center gap-1.5 text-fluent-text-muted mb-1.5">
              <FileText className="w-3.5 h-3.5 text-fluent-brand" />
              <h3 className="text-[11px] uppercase font-semibold tracking-wider">Evidence Sources</h3>
            </div>
            <p className="text-[20px] font-light text-fluent-text">{totalEvidence}</p>
          </div>
          <div className="bg-fluent-surface border border-fluent-border rounded-sm p-3 flex flex-col justify-between fluent-shadow transition-shadow hover:shadow-elevation-8">
            <div className="flex items-center gap-1.5 text-fluent-text-muted mb-1.5">
              <svg className="w-3.5 h-3.5 text-[#0078D4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 14v-4H6v4h4zm6 0v-4h-4v4h4zm-6-6V7H6v4h4zm6 0V7h-4v4h4z" />
              </svg>
              <h3 className="text-[11px] uppercase font-semibold tracking-wider">Azure Syncs</h3>
            </div>
            <p className="text-[20px] font-light text-fluent-text">{trackedAzureIssues}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-fluent-surface p-3 rounded-md border border-fluent-border fluent-shadow">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fluent-text-muted" />
            <input
              type="text"
              placeholder="Search history, scenarios, constraints..."
              className="w-full bg-fluent-bg border border-fluent-border-subtle rounded-md py-1.5 pl-9 pr-3 text-[13px] text-fluent-text focus:outline-none focus:ring-1 focus:ring-fluent-brand transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-fluent-bg border border-fluent-border-subtle rounded-md py-1.5 px-3 text-[13px] text-fluent-text focus:outline-none focus:ring-1 focus:ring-fluent-brand"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
          >
            <option value="All">All Confidences</option>
            <option value="High">High Confidence</option>
            <option value="Medium">Medium Confidence</option>
            <option value="Low">Low Confidence</option>
          </select>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-fluent-surface border border-fluent-border rounded-md p-10 text-center flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 text-fluent-border mb-3" />
              <h3 className="text-[16px] font-semibold text-fluent-text">No records found</h3>
              <p className="text-[13px] text-fluent-text-muted mt-1">Adjust search filters or run a new simulation in Microsoft Teams.</p>
            </div>
          ) : (
            filteredRecords.map((record, idx) => {
              const isExpanded = expandedCards.has(idx);
              const confClass = getConfidenceStyle(record.confidence);
              
              return (
                <div key={`${record.scenarioId}-${idx}`} className="bg-fluent-surface border border-fluent-border rounded-sm overflow-hidden hover:bg-fluent-surface-hover hover:shadow-md cursor-pointer transition-all duration-200 fluent-shadow">
                  {/* Card Header */}
                  <div 
                    className="px-4 py-3 cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                    onClick={() => toggleExpand(idx)}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-fluent-text-muted">{new Date(record.timestamp).toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border ${confClass}`}>
                          {record.confidence} Confidence
                        </span>
                      </div>
                      <h2 className="text-[16px] font-semibold text-fluent-text">{record.scenarioId}</h2>
                      <div className="flex flex-wrap gap-3 text-[12px] text-fluent-text-muted mt-1">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {(record.generatedBy || []).length} Agents</span>
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> {record.evidence?.length || 0} Evidence</span>
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> {record.constraints?.length || 0} Constraints</span>
                        <span className="flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5"/> {record.assumptions?.length || 0} Assumptions</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded hover:bg-fluent-border-subtle transition-colors shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-fluent-text-muted" /> : <ChevronDown className="w-4 h-4 text-fluent-text-muted" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-5 border-t border-fluent-border bg-fluent-bg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Column 1 */}
                        <div className="space-y-5">
                          <div>
                            <h4 className="text-[12px] font-semibold text-fluent-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-fluent-text-muted" /> Agent Trace
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {(record.generatedBy || []).map((agent, i) => (
                                <span key={i} className="px-2 py-0.5 bg-fluent-surface text-fluent-text rounded-sm text-[12px] border border-fluent-border-subtle">
                                  {agent}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[12px] font-semibold text-fluent-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-fluent-text-muted" /> Retrieved Evidence
                            </h4>
                            <ul className="space-y-1.5">
                              {record.evidence.map((ev, i) => (
                                <li key={i} className="text-[13px] text-fluent-text bg-fluent-surface px-3 py-2 rounded-sm border border-fluent-border-subtle flex items-start gap-2">
                                  <span className="text-fluent-brand mt-0.5">•</span>
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-5">
                          <div>
                            <h4 className="text-[12px] font-semibold text-fluent-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-fluent-warning" /> Constraints
                            </h4>
                            <ul className="space-y-1.5">
                              {record.constraints.map((c, i) => (
                                <li key={i} className="text-[13px] text-fluent-text bg-fluent-surface px-3 py-2 rounded-sm border border-fluent-border-subtle flex items-start gap-2">
                                  <span className="text-fluent-warning mt-0.5">•</span>
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-[12px] font-semibold text-fluent-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <BrainCircuit className="w-3.5 h-3.5 text-fluent-brand" /> Assumptions
                            </h4>
                            <ul className="space-y-1.5">
                              {record.assumptions.map((a, i) => (
                                <li key={i} className="text-[13px] text-fluent-text bg-fluent-surface px-3 py-2 rounded-sm border border-fluent-border-subtle flex items-start gap-2">
                                  <span className="text-fluent-brand mt-0.5">•</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>

                      {/* Azure Traceability Section */}
                      {record.azureWorkItemId && (
                        <div className="mt-5 pt-5 border-t border-fluent-border-subtle">
                          <div className="bg-fluent-surface border-t-2 border-t-[#0078D4] border border-fluent-border rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5 text-[#0078D4]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 14v-4H6v4h4zm6 0v-4h-4v4h4zm-6-6V7H6v4h4zm6 0V7h-4v4h4z" />
                              </svg>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[12px] font-semibold text-[#0078D4] uppercase tracking-wider">
                                    Azure DevOps Bug #{record.azureWorkItemId}
                                  </span>
                                </div>
                                <h4 className="text-[14px] font-medium text-fluent-text hover:underline cursor-pointer">
                                  {record.azureWorkItemTitle || record.scenarioId}
                                </h4>
                              </div>
                            </div>
                            <a 
                              href={record.azureWorkItemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-1.5 bg-fluent-surface border border-fluent-border hover:bg-fluent-surface-hover hover:shadow-sm text-fluent-text text-[13px] font-semibold rounded-md transition-all duration-200 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                            >
                              Open Work Item
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
