import React, { useState } from "react";
import { PICOSCriteria, Paper } from "../types";
import { Search, Loader2, Database, AlertCircle, Plus, Check, ArrowRight } from "lucide-react";

interface SearchStageProps {
  picos: PICOSCriteria;
  papers: Paper[];
  onPapersChange: (papers: Paper[]) => void;
}

export default function SearchStage({ picos, papers, onPapersChange }: SearchStageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [searchMeta, setSearchMeta] = useState<{ queryUsed: string; totalHitCount: number; source: string } | null>(null);
  
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const [databases, setDatabases] = useState({
    pubMed: true,
    scopus: true,
    webOfScience: true,
    clinicalTrials: true,
  });

  const handleToggleDb = (db: keyof typeof databases) => {
    setDatabases((prev) => ({ ...prev, [db]: !prev[db] }));
  };

  const showNotification = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSearchMeta(null);

    try {
      const dbNames = Object.entries(databases)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ picos, databases: dbNames }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform literature search.");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setSearchMeta({
        queryUsed: data.queryUsed || "Unknown",
        totalHitCount: data.totalHitCount || data.results?.length || 0,
        source: data.source || "Europe PMC (Live Database)"
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaper = (paper: Paper, status: Paper["screeningStatus"] = "unscreened") => {
    if (!papers.find((p) => p.id === paper.id)) {
      onPapersChange([...papers, { ...paper, screeningStatus: status }]);
      showNotification(
        status === "eligible" 
          ? `✓ "${paper.citation}" marked as ELIGIBLE and added directly to screening!`
          : `✓ "${paper.citation}" added to screening queue as UNSCREENED.`
      );
    } else {
      showNotification(`"${paper.citation}" is already present in your screening pool.`, "info");
    }
  };

  const handleAddAll = (status: Paper["screeningStatus"] = "unscreened") => {
    const newPapers = searchResults
      .filter((p) => !papers.find((ep) => ep.id === p.id))
      .map(p => ({ ...p, screeningStatus: status }));
    
    if (newPapers.length > 0) {
      onPapersChange([...papers, ...newPapers]);
      showNotification(
        status === "eligible"
          ? `✓ Success: Added ${newPapers.length} new studies directly to screening and marked them as ELIGIBLE!`
          : `✓ Success: Added ${newPapers.length} new studies to the screening list as UNSCREENED!`
      );
    } else {
      showNotification("All these papers are already in your screening pool list.", "info");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-600" />
            Stage 2: Literature Search (Automated AI Assistant)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Deep scan across leading medical databases (leveraging EuropePMC) optimized by AI based on your PICOS protocol.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-gray-100 pb-2">
              <Database className="h-4 w-4 text-gray-600" />
              Target Databases
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={databases.pubMed}
                  onChange={() => handleToggleDb("pubMed")}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                PubMed / MEDLINE / PMC
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={databases.scopus}
                  onChange={() => handleToggleDb("scopus")}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                Scopus
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={databases.webOfScience}
                  onChange={() => handleToggleDb("webOfScience")}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                Web of Science
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={databases.clinicalTrials}
                  onChange={() => handleToggleDb("clinicalTrials")}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                ClinicalTrials.gov
              </label>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || Object.values(databases).every(v => !v)}
              className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-md hover:bg-cyan-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching Deep Repositories..." : "Execute Search"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {notification && (
            <div className={`p-4 border rounded-lg text-sm flex items-center gap-2 shadow-xs transition-all duration-300 ${
              notification.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}>
              <span className="font-bold shrink-0 text-lg">
                {notification.type === "success" ? "✓" : "ℹ"}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {searchMeta && (
            <div className="p-4 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-lg space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-150 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
                  Search Source: <span className="bg-cyan-600 text-white px-2 py-0.5 rounded font-bold ml-1">{searchMeta.source}</span>
                </span>
                {searchMeta.source.includes("Simulation") && (
                  <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                    Database Sandbox Fallback Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm">
                  <strong>AI Query Formulated:</strong> <code className="bg-white px-1.5 py-0.5 rounded ml-1 border border-cyan-100 select-all font-mono text-xs">{searchMeta.queryUsed}</code>
                </p>
                <p className="text-sm mt-1">
                  <strong>Total Results Found:</strong> {searchMeta.totalHitCount.toLocaleString()} papers matching protocol. Showing top {searchResults.length}.
                </p>
              </div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Top Retrieved Literature</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddAll("unscreened")}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-1 shadow-sm transition"
                  >
                    Add All to Screen <ArrowRight className="h-3 w-3"/>
                  </button>
                  <button
                    onClick={() => handleAddAll("eligible")}
                    className="text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1 shadow-sm transition"
                  >
                    Mark All Eligible <Check className="h-3 w-3"/>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scrollbar-thin">
                {searchResults.map((paper) => {
                  const existingPaper = papers.find((p) => p.id === paper.id);
                  const isAdded = !!existingPaper;
                  return (
                    <div key={paper.id} className="p-4 flex gap-4 hover:bg-gray-50/50">
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded font-mono uppercase border border-cyan-100">
                          {paper.citation}
                        </span>
                        {isAdded && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                            ✓ In Screening Pool ({existingPaper?.screeningStatus})
                          </span>
                        )}
                        <h4 className="text-sm font-semibold text-gray-900 leading-snug">{paper.title}</h4>
                        <p className="text-[11px] text-gray-600">{paper.authors} &bull; <i>{paper.journal} ({paper.year})</i></p>
                        <p className="text-[11px] text-gray-500 line-clamp-3 mt-1 leading-relaxed">{paper.abstract}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-stretch justify-start gap-2">
                        {!isAdded && (
                          <>
                            <button
                              onClick={() => handleAddPaper(paper, "unscreened")}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-700 bg-white border border-cyan-300 hover:bg-cyan-50 rounded transition shadow-sm w-full"
                            >
                              <Plus className="h-3 w-3" /> Add to Screen
                            </button>
                            <button
                              onClick={() => handleAddPaper(paper, "eligible")}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded transition shadow-sm w-full"
                            >
                              <Check className="h-3 w-3" /> Mark Eligible
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && searchResults.length === 0 && !error && (
            <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
              <Search className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Search Results Yet</h3>
              <p className="text-xs text-gray-500">Configure your databases and click Search to retrieve literature based on your PICOS protocol.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
