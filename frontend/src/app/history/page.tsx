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
}

export default function HistoryDashboard() {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("All");
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("http://localhost:3001/api/decision-history")
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

  const getConfidenceColor = (conf: string) => {
    if (conf === "High") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (conf === "Medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Decision Intelligence History
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Historical record of AI generated decisions, risks, assumptions, evidence, and operational constraints.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
            <BrainCircuit className="w-4 h-4" />
            FORESIGHT Live Memory
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="font-medium">Total Decisions</h3>
            </div>
            <p className="text-3xl font-bold text-slate-100">{totalDecisions}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="font-medium">Unique Scenarios</h3>
            </div>
            <p className="text-3xl font-bold text-slate-100">{uniqueScenarios}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-medium">Avg Confidence</h3>
            </div>
            <p className={`text-3xl font-bold ${
              avgConfidence === 'High' ? 'text-emerald-400' : 
              avgConfidence === 'Medium' ? 'text-amber-400' : 'text-rose-400'
            }`}>{avgConfidence}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="font-medium">Evidence Sources</h3>
            </div>
            <p className="text-3xl font-bold text-slate-100">{totalEvidence}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search scenarios, evidence, constraints, assumptions..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
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
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-medium text-slate-300">No historical decisions found.</h3>
              <p className="text-slate-500 mt-2">Adjust your filters or run a new simulation to generate records.</p>
            </div>
          ) : (
            filteredRecords.map((record, idx) => {
              const isExpanded = expandedCards.has(idx);
              const confClass = getConfidenceColor(record.confidence);
              
              return (
                <div key={`${record.scenarioId}-${idx}`} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 shadow-xl shadow-black/20">
                  {/* Card Header (Clickable for Expand) */}
                  <div 
                    className="p-6 cursor-pointer flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                    onClick={() => toggleExpand(idx)}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">{new Date(record.timestamp).toLocaleDateString()}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${confClass}`}>
                          {record.confidence} Confidence
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-100">{record.scenarioId}</h2>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {record.generatedBy.length} Agents</span>
                        <span className="flex items-center gap-1"><FileText className="w-4 h-4"/> {record.evidence?.length || 0} Evidence</span>
                        <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {record.constraints?.length || 0} Constraints</span>
                        <span className="flex items-center gap-1"><BrainCircuit className="w-4 h-4"/> {record.assumptions?.length || 0} Assumptions</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-slate-800/50 bg-slate-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        
                        {/* Column 1: Evidence & Agents */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Generated By
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {record.generatedBy.map((agent, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700/50">
                                  {agent}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Evidence
                            </h4>
                            <ul className="space-y-2">
                              {record.evidence.map((ev, i) => (
                                <li key={i} className="text-sm text-slate-300 bg-slate-800/50 px-4 py-2.5 rounded-lg border border-slate-700/50 flex items-start gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Column 2: Constraints & Assumptions */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" /> Operational Constraints
                            </h4>
                            <ul className="space-y-2">
                              {record.constraints.map((c, i) => (
                                <li key={i} className="text-sm text-slate-300 bg-amber-500/5 px-4 py-2.5 rounded-lg border border-amber-500/10 flex items-start gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4 text-cyan-500" /> Challenged Assumptions
                            </h4>
                            <ul className="space-y-2">
                              {record.assumptions.map((a, i) => (
                                <li key={i} className="text-sm text-slate-300 bg-cyan-500/5 px-4 py-2.5 rounded-lg border border-cyan-500/10 flex items-start gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>
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
