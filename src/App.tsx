import React, { useState } from "react";
import { PICOSCriteria, Paper, PRISMACounts } from "./types";
import { initialPICOS, samplePapers, initialPRISMACounts } from "./initialData";
import FormulateStage from "./components/FormulateStage";
import SearchStage from "./components/SearchStage";
import ScreeningStage from "./components/ScreeningStage";
import ExtractionStage from "./components/ExtractionStage";
import SynthesisStage from "./components/SynthesisStage";
import ReportStage from "./components/ReportStage";
import SkillsCodex from "./components/SkillsCodex";
import { HelpCircle, Award, Library, ListFilter, Sparkles, BookOpen, FileSpreadsheet, RefreshCw, Layers, Search, Book } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"formulate" | "search" | "screening" | "extraction" | "synthesis" | "report" | "codex">("formulate");

  // Global Review State
  const [criteria, setCriteria] = useState<PICOSCriteria>(initialPICOS);
  const [papers, setPapers] = useState<Paper[]>(samplePapers);
  const [prismaCounts, setPrismaCounts] = useState<PRISMACounts>(initialPRISMACounts);

  const resetProject = () => {
    setCriteria({
      title: "",
      population: "",
      intervention: "",
      comparator: "",
      outcomes: "",
      studyDesigns: "",
      languageRestrictions: "",
      publicationStatus: ""
    });
    setPapers([]);
    setPrismaCounts({
      recordsIdentified: 0,
      recordsRemovedDuplicates: 0,
      recordsScreened: 0,
      recordsExcluded: 0,
      reportsSoughtForRetrieval: 0,
      reportsNotRetrieved: 0,
      reportsAssessedForEligibility: 0,
      reportsExcludedNearMisses: 0,
      studiesIncluded: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="sr-root-viewport">
      {/* Header bar */}
      <header className="bg-white border-b border-gray-250 shrink-0 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-905 leading-none">PRISMA Systematic Review Editor</h1>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-1 block">
                Cochrane Standardized Workflow & Assisting Reporter
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetProject}
              className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Review
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Cochrane Compliant v2.4
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigator bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[53px] z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto scrollbar-none" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("formulate")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "formulate"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              1. PICOS Protocol
            </button>

            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "search"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Search className="h-4 w-4 shrink-0" />
              2. AI Search
            </button>

            <button
              onClick={() => setActiveTab("screening")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "screening"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              3. screening
            </button>

            <button
              onClick={() => setActiveTab("extraction")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "extraction"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Award className="h-4 w-4 shrink-0" />
              4. Data Extraction & RoB
            </button>

            <button
              onClick={() => setActiveTab("synthesis")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "synthesis"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ListFilter className="h-4 w-4 shrink-0" />
              5. PRISMA & Synthesis
            </button>

            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "report"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Library className="h-4 w-4 shrink-0" />
              6. Final Report & Cited refs
            </button>

            <button
              onClick={() => setActiveTab("codex")}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === "codex"
                  ? "bg-indigo-700 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Book className="h-4 w-4 shrink-0 text-indigo-500" />
              Academic Skills Codex
            </button>
          </nav>
        </div>
      </div>

      {/* Main Workspace Stage */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === "formulate" && (
          <FormulateStage criteria={criteria} onChange={setCriteria} />
        )}
        {activeTab === "search" && (
          <SearchStage picos={criteria} papers={papers} onPapersChange={setPapers} />
        )}
        {activeTab === "screening" && (
          <ScreeningStage picos={criteria} papers={papers} onPapersChange={setPapers} />
        )}
        {activeTab === "extraction" && (
          <ExtractionStage papers={papers} onPapersChange={setPapers} />
        )}
        {activeTab === "synthesis" && (
          <SynthesisStage counts={prismaCounts} papers={papers} onCountsChange={setPrismaCounts} />
        )}
        {activeTab === "report" && (
          <ReportStage picos={criteria} papers={papers} counts={prismaCounts} />
        )}
        {activeTab === "codex" && (
          <SkillsCodex />
        )}
      </main>

      {/* Core Footer */}
      <footer className="bg-white border-t border-gray-250 py-4 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">
            Systematic Review Editor & PRISMA Reporter Applet &bull; Built in alignment with the Cochrane Handbook & PRISMA 2020 Statement
          </p>
          <p className="text-[10px] text-gray-400">
            For professional usage, always double-check sifting outputs manually. All citations conform to AMSTAR criteria and Booth's STARLITE framework.
          </p>
        </div>
      </footer>
    </div>
  );
}
