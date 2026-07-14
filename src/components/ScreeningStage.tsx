import React, { useState } from "react";
import { PICOSCriteria, Paper } from "../types";
import { samplePapers } from "../initialData";
import { exportHtmlToDoc } from "../utils/docxExport";
import { CheckCircle2, XCircle, HelpCircle, Loader2, Sparkles, Plus, AlertCircle, Trash2, Download, Search, Filter, RotateCcw, Eraser } from "lucide-react";

interface ScreeningStageProps {
  picos: PICOSCriteria;
  papers: Paper[];
  onPapersChange: (papers: Paper[]) => void;
}

export default function ScreeningStage({ picos, papers, onPapersChange }: ScreeningStageProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newAuthors, setNewAuthors] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newJournal, setNewJournal] = useState("");
  const [newAbstract, setNewAbstract] = useState("");
  const [newCitation, setNewCitation] = useState("");

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "unscreened" | "eligible" | "excluded" | "needs_full_text">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleClearPool = () => {
    if (window.confirm("Are you sure you want to clear your entire screening pool? (This will also clear the default sample papers so you can focus only on your newly added papers).")) {
      onPapersChange([]);
    }
  };

  const handleResetToSamples = () => {
    onPapersChange(samplePapers);
  };

  const filteredPapers = papers.filter((p) => {
    // 1. Filter by Status
    if (filter !== "all" && p.screeningStatus !== filter) {
      return false;
    }
    // 2. Filter by search text
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.citation.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Manual status trigger
  const setStatus = (id: string, status: Paper["screeningStatus"]) => {
    const updated = papers.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          screeningStatus: status,
          screeningReason: p.screeningReason || "Manually screened by human sifter.",
        };
      }
      return p;
    });
    onPapersChange(updated);
  };

  const deletePaper = (id: string) => {
    onPapersChange(papers.filter((p) => p.id !== id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAbstract) return;

    const citationText = newCitation || `${(newAuthors.split(",")[0] || "Unknown").trim()} ${newYear || new Date().getFullYear()}`;

    const newPaper: Paper = {
      id: `paper-${Date.now()}`,
      citation: citationText,
      title: newTitle,
      authors: newAuthors || "Unspecified Authors",
      year: newYear || "Unknown Year",
      journal: newJournal || "Unspecified Journal",
      abstract: newAbstract,
      screeningStatus: "unscreened",
      screeningReason: "",
    };

    onPapersChange([...papers, newPaper]);

    // reset fields
    setNewTitle("");
    setNewAuthors("");
    setNewYear("");
    setNewJournal("");
    setNewAbstract("");
    setNewCitation("");
  };

  const runAIScreen = async (id: string) => {
    const paper = papers.find((p) => p.id === id);
    if (!paper) return;

    setLoadingId(id);
    setApiError(null);

    try {
      const response = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: picos.title,
          population: picos.population,
          intervention: picos.intervention,
          comparator: picos.comparator,
          outcomes: picos.outcomes,
          studyDesigns: picos.studyDesigns,
          paper,
        }),
      });

      if (!response.ok) throw new Error("Server of screening returned an error.");

      const result = await response.json();
      const updated = papers.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            screeningStatus: result.screeningStatus,
            screeningReason: result.screeningReason,
          };
        }
        return p;
      });
      onPapersChange(updated);
    } catch (err: any) {
      setApiError(err.message || "Failed to contact proxy screening endpoint.");
    } finally {
      setLoadingId(null);
    }
  };

  const runAllScreening = async () => {
    const unscreened = papers.filter((p) => p.screeningStatus === "unscreened");
    if (unscreened.length === 0) return;

    setBulkLoading(true);
    setApiError(null);

    // Track state modifications dynamically in a secure local array variable to prevent stale closure bugs
    let currentPapersDraft = [...papers];

    for (const paper of unscreened) {
      setLoadingId(paper.id);
      try {
        const response = await fetch("/api/screen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: picos.title,
            population: picos.population,
            intervention: picos.intervention,
            comparator: picos.comparator,
            outcomes: picos.outcomes,
            studyDesigns: picos.studyDesigns,
            paper,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Update the localized study record list
          currentPapersDraft = currentPapersDraft.map((p) => {
            if (p.id === paper.id) {
              return {
                ...p,
                screeningStatus: result.screeningStatus,
                screeningReason: result.screeningReason,
              };
            }
            return p;
          });
          onPapersChange(currentPapersDraft);
        }
      } catch (err) {
        console.error("Bulk screening error for", paper.id, err);
      }
    }
    setLoadingId(null);
    setBulkLoading(false);
  };

  const handleDownload = () => {
    let papersRows = "";
    papers.forEach((p, idx) => {
      let statusBadge = "";
      if (p.screeningStatus === "eligible") statusBadge = '<span class="badge-eligible">ELIGIBLE</span>';
      else if (p.screeningStatus === "excluded") statusBadge = '<span class="badge-excluded">EXCLUDED</span>';
      else if (p.screeningStatus === "needs_full_text") statusBadge = '<span class="badge-unclear">NEEDS FULL TEXT</span>';
      else statusBadge = "<b>UNSCREENED</b>";

      papersRows += `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${p.citation}</b><br>${p.authors}<br><i>${p.journal} (${p.year})</i></td>
          <td><b>${p.title}</b><br><br>${p.abstract}</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td>${p.screeningReason || "No screening justification provided."}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <h1>Step 2: PRISMA Sifting & Automated Document Screening Report</h1>
      <p>This document presents sifting outputs and screening explanations for all retrieved clinical literature, comparing study characteristics directly to target PICOS criteria under the PRISMA 2020 Reporting guidelines.</p>
      
      <h2>Evaluation Matrix</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 25%">Citation / Source</th>
            <th style="width: 35%">Article Info & Abstract</th>
            <th style="width: 15%; text-align: center;">Decision</th>
            <th style="width: 20%">Justification Reason</th>
          </tr>
        </thead>
        <tbody>
          ${papersRows || '<tr><td colspan="5">No studies added to the screening matrix yet.</td></tr>'}
        </tbody>
      </table>
    `;
    exportHtmlToDoc(htmlContent, "Step2_Inclusion_Screening_Report");
  };

  return (
    <div className="space-y-6" id="screening-stage-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w- w-5 text-purple-600" />
            Stage 2: Title and Abstract Screening
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Analyze literature titles and abstracts against PICO rules. Screen manually or using automated AI assistance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runAllScreening}
            disabled={bulkLoading || papers.filter((p) => p.screeningStatus === "unscreened").length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {bulkLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Run All Unscreened
          </button>
          <button
            onClick={handleDownload}
            disabled={papers.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download Word Step
          </button>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>Error: {apiError}. Check API constraints or proceed with manual overrides.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Paper Entry Form */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Add Citation to Matrix
            </h3>
            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Citation ID</label>
                <input
                  type="text"
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  placeholder="e.g. Uman 2011"
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Authors</label>
                  <input
                    type="text"
                    value={newAuthors}
                    onChange={(e) => setNewAuthors(e.target.value)}
                    placeholder="e.g. Uman L, et al."
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="e.g. 2011"
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Journal Source</label>
                <input
                  type="text"
                  value={newJournal}
                  onChange={(e) => setNewJournal(e.target.value)}
                  placeholder="e.g. J Can Acad Child Adolesc Psychiatry"
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Paper Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="The main title of the paper..."
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Abstract Text</label>
                <textarea
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  rows={4}
                  placeholder="Paste abstract or summary here..."
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Add Paper
              </button>
            </form>
          </div>
        </div>

        {/* Papers Sifting List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search, Filter & Bulk Control Tool Bar */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter screening list by title, citation, abstract..."
                  className="pl-9 w-full text-xs border border-gray-300 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              {papers.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearPool}
                  className="px-3 py-2 text-xs font-semibold text-red-650 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                  title="Remove all papers to start a custom screening run"
                >
                  <Eraser className="h-3.5 w-3.5 text-red-650" />
                  Clear All ({papers.length})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetToSamples}
                  className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-gray-600" />
                  Reset to Samples
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100 pt-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase self-center mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Status:
              </span>
              {[
                { value: "all", label: `All (${papers.length})` },
                { value: "unscreened", label: `Unscreened (${papers.filter(p => p.screeningStatus === "unscreened").length})` },
                { value: "eligible", label: `Eligible (${papers.filter(p => p.screeningStatus === "eligible").length})` },
                { value: "excluded", label: `Excluded (${papers.filter(p => p.screeningStatus === "excluded").length})` },
                { value: "needs_full_text", label: `Needs Full Text (${papers.filter(p => p.screeningStatus === "needs_full_text").length})` },
              ].map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setFilter(btn.value as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                    filter === btn.value
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Matching Matrix Studies ({filteredPapers.length} shown)</span>
              <span>Sifting Status</span>
            </div>

            {papers.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No research records added yet. Add custom papers, execute an AI Search under the previous tab, or restore the sample list.
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No papers found matching the current search query or filter status. Try clearing your query or switching tabs.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPapers.map((p) => (
                  <div key={p.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase font-mono">
                            {p.citation}
                          </span>
                          {p.id.startsWith("insulin-study-") ? (
                            <span className="inline-block text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              Initial Applet Sample
                            </span>
                          ) : (
                            <span className="inline-block text-[9px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                              Retrieved via AI Search / Custom
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{p.title}</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {p.authors} &bull; <i>{p.journal} ({p.year})</i>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {p.screeningStatus === "eligible" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Eligible
                          </span>
                        )}
                        {p.screeningStatus === "excluded" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-red-700 bg-red-50 px-2 py-0.5 border border-red-200 rounded-full">
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                            Excluded
                          </span>
                        )}
                        {p.screeningStatus === "needs_full_text" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-full">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                            Unclear / Sift
                          </span>
                        )}
                        {p.screeningStatus === "unscreened" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-gray-500 bg-gray-50 px-2 py-0.5 border border-gray-200 rounded-full">
                            Unscreened
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded border border-gray-150 text-xs text-gray-600 line-clamp-3">
                      <strong>Abstract:</strong> {p.abstract}
                    </div>

                    {p.screeningReason && (
                      <div className="p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-blue-900">
                        <strong>Decision Reason:</strong> {p.screeningReason}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setStatus(p.id, "eligible")}
                          className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                            p.screeningStatus === "eligible"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Mark Eligible
                        </button>
                        <button
                          onClick={() => setStatus(p.id, "excluded")}
                          className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                            p.screeningStatus === "excluded"
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Exclude
                        </button>
                        <button
                          onClick={() => setStatus(p.id, "needs_full_text")}
                          className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                            p.screeningStatus === "needs_full_text"
                              ? "bg-amber-600 text-white border-amber-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Sift Full-Text
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => runAIScreen(p.id)}
                          disabled={loadingId === p.id}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {loadingId === p.id ? (
                            <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                          ) : (
                            <Sparkles className="h-3 w-3 text-purple-600" />
                          )}
                          AI Screen
                        </button>
                        <button
                          onClick={() => deletePaper(p.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 transition-colors"
                          title="Delete Citation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
