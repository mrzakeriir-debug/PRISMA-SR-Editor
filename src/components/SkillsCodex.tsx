import React, { useState } from "react";
import { BookOpen, Search, HelpCircle, FileText, ShieldAlert, Library, Award, GitBranch, ExternalLink, Sparkles } from "lucide-react";

export default function SkillsCodex() {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "scoping" | "searching" | "screening" | "extraction">("overview");

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden" id="skills-codex-container">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-850 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/35 border border-indigo-400 text-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Integrated Reference Codex
              </span>
              <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono">
                v3.13
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Academic Research Skills Codex</h2>
            <p className="text-sm text-indigo-100/90 max-w-2xl font-medium leading-relaxed">
              High-fidelity guidelines for conducting Cochrane-compliant systematic reviews and PRISMA meta-analyses. 
              Synchronized with the human-in-the-loop skills registry.
            </p>
          </div>
          <a
            href="https://github.com/Imbad0202/academic-research-skills-codex"
            target="_blank"
            referrerPolicy="no-referrer"
            className="shrink-0 bg-white hover:bg-indigo-50 text-indigo-850 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer self-start md:self-auto border border-indigo-200"
          >
            <GitBranch className="h-4 w-4 text-indigo-600" />
            View GitHub Repository
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="flex space-x-2 shrink-0">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === "overview"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <Library className="h-3.5 w-3.5" />
            Suite Overview
          </button>

          <button
            onClick={() => setActiveSubTab("scoping")}
            className={`px-3 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === "scoping"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Protocol & Scoping
          </button>

          <button
            onClick={() => setActiveSubTab("searching")}
            className={`px-3 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === "searching"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Boolean Formulation
          </button>

          <button
            onClick={() => setActiveSubTab("screening")}
            className={`px-3 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === "screening"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Screening Criteria
          </button>

          <button
            onClick={() => setActiveSubTab("extraction")}
            className={`px-3 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === "extraction"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            RoB & Extraction
          </button>
        </div>
      </div>

      {/* Content Stage */}
      <div className="p-6">
        {activeSubTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <BookOpen className="h-4 w-4 shrink-0 text-blue-600" />
                  Human-in-the-Loop Standard
                </div>
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  The Codex mandates that AI features assist the researcher, not replace them. 
                  All sifting status recommendations, extraction outcomes, and bias ratings should be visually guided, annotated, and fully editable by human investigators.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-purple-600" />
                  Pragmatic Bias Prevention
                </div>
                <p className="text-xs text-purple-900 leading-relaxed font-medium">
                  By providing systematic frameworks like Cochrane Risk of Bias (RoB 2.0) and QUADAS-2, the Codex prevents arbitrary grading. Each domain requires a explicit written defense citing study pages or protocols.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                  PRISMA Traceability
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Every paper identified, screened, excluded, or extracted is represented as a state transition in a standardized PRISMA 2020 Flow Diagram, allowing full scientific replication.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
                The Systematic Review Pipeline (Cochrane Protocol)
              </h3>
              <div className="relative border-l-2 border-indigo-100 ml-3.5 pl-6 space-y-5">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</span>
                  <h4 className="text-xs font-bold text-gray-900">PICOS Protocol Formulation</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Define Population, Intervention, Comparator, Outcome, and Study Design (PICOS) boundaries beforehand to prevent post-hoc criteria modifications.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">2</span>
                  <h4 className="text-xs font-bold text-gray-900">Literature Search Query Engineering</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Formulate high-sensitivity search queries, balance parentheses, search Europe PMC / PubMed, and establish simulated database fallbacks.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">3</span>
                  <h4 className="text-xs font-bold text-gray-900">Title & Abstract Screening</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Sift records based on inclusion/exclusion criteria. Track screening status (eligible, excluded) and record precise reasons for exclusions.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">4</span>
                  <h4 className="text-xs font-bold text-gray-900">Data Extraction & Critical Appraisal</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Extract demographics, sample size, and intervention parameters. Grade Risk of Bias using validated domain-based assessment tools.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "scoping" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Step 1: PICOS Criteria Selection Guidelines</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Standardized by the Campbell Collaboration and Cochrane, the PICOS framework translates a general clinical or social science inquiry into an executable research protocol.
            </p>
            <div className="border border-gray-150 rounded-lg overflow-hidden divide-y divide-gray-150 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 p-3 bg-gray-50 font-bold text-gray-700">
                <div className="md:col-span-1">PICO Domain</div>
                <div className="md:col-span-1">Conceptual Focus</div>
                <div className="md:col-span-2">Systematic Review Best Practice</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 p-3 hover:bg-gray-50/50 transition-colors">
                <div className="md:col-span-1 font-bold text-blue-600">Population (P)</div>
                <div className="md:col-span-1 text-gray-900">Clinical cohort / Demographics</div>
                <div className="md:col-span-2 text-gray-505">Define age ranges, clinical diagnostic criteria, comorbidities, and baseline severity explicitly. Do not blend population with settings.</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 p-3 hover:bg-gray-50/50 transition-colors">
                <div className="md:col-span-1 font-bold text-cyan-600">Intervention (I)</div>
                <div className="md:col-span-1 text-gray-900">Active treatment / Policy / Exposure</div>
                <div className="md:col-span-2 text-gray-505">Specify formulation, dose, frequency, administration route, and minimal duration threshold.</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 p-3 hover:bg-gray-50/50 transition-colors">
                <div className="md:col-span-1 font-bold text-purple-600">Comparator (C)</div>
                <div className="md:col-span-1 text-gray-900">Placebo / Standard of Care / Active</div>
                <div className="md:col-span-2 text-gray-505">Crucial for comparative meta-analysis. Document if "usual care" is active or inactive, as variations impact statistical heterogeneity.</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 p-3 hover:bg-gray-50/50 transition-colors">
                <div className="md:col-span-1 font-bold text-indigo-600">Outcomes (O)</div>
                <div className="md:col-span-1 text-gray-900">Primary & Secondary measures</div>
                <div className="md:col-span-2 text-gray-505">Identify objective markers (mortality, lab outcomes) and subjective markers (Quality of Life). Do not exclude papers based on outcomes alone unless pre-specified.</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 p-3 hover:bg-gray-50/50 transition-colors">
                <div className="md:col-span-1 font-bold text-emerald-600">Study Design (S)</div>
                <div className="md:col-span-1 text-gray-900">Eligible trial designs (RCT, cohort)</div>
                <div className="md:col-span-2 text-gray-505">RCTs offer the highest internal validity. However, non-randomized observational studies are frequently included for safety, rare events, or long-term impacts.</div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "searching" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Step 2: Database Sourcing & Query Parsers</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lucene and clinical query engines (like Europe PMC, PubMed, Embase) use strict Boolean parsers. 
              The Codex enforces high-fidelity sanitization checks before dispatching queries to avoid breaking the remote interface.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs space-y-3">
              <div className="text-gray-400">// Balance Parentheses & Quotes to avoid 400 Bad Request errors</div>
              <div>
                <span className="text-pink-400">const</span> openCount = (query.match(<span className="text-yellow-300">/\(/g</span>) || []).length;<br/>
                <span className="text-pink-400">const</span> closeCount = (query.match(<span className="text-yellow-300">/\)/g</span>) || []).length;<br/>
                <span className="text-pink-400">if</span> (openCount !== closeCount) &#123;<br/>
                &nbsp;&nbsp;balanced = balanced.replace(<span className="text-yellow-300">/[\(\)]/g</span>, <span className="text-emerald-300">" "</span>);<br/>
                &#125;
              </div>
              <div className="text-gray-400">// Strip potentially breaking punctuation while keeping Boolean operators</div>
              <div>
                balanced = balanced.replace(<span className="text-yellow-300">/[:;\\\/\[\]\+\-\!\^\*\?\~\&#123;&#125;]/g</span>, <span className="text-emerald-300">" "</span>);
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                Durable Clinical AI Search Fallback
              </p>
              <p className="leading-relaxed">
                If Europe PMC live databases return zero results or return service failures due to complex clinical terms, the Cochrane Search Simulator automatically uses Gemini to generate 12 highly realistic clinical trials that perfectly match the protocol parameters, allowing continuous workflow exploration.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === "screening" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Step 3: PRISMA Screening & Sifting Criteria</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Screening titles and abstracts requires double-blind validation or high-fidelity AI-assisted screening. 
              Every paper marked as "excluded" must be accompanied by an explicit reason derived from the PICOS protocol.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-lg space-y-2">
                <h4 className="font-bold text-emerald-800 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Inclusion Checklist (Standard)
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li>Study design aligns exactly with pre-defined protocol parameters.</li>
                  <li>Involves the correct target demographic/population.</li>
                  <li>Investigates the specified primary intervention directly.</li>
                  <li>Contrasts treatment with the appropriate control/comparator.</li>
                </ul>
              </div>

              <div className="p-4 border border-red-100 bg-red-50/30 rounded-lg space-y-2">
                <h4 className="font-bold text-red-800 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Common Exclusion Reasons
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li><strong>Wrong Population:</strong> Comorbidities/age ranges differ from parameters.</li>
                  <li><strong>Ineligible Study Design:</strong> Narrative reviews, letter abstracts, editorials.</li>
                  <li><strong>Off-Protocol Intervention:</strong> Different dosage, baseline formulation, or route.</li>
                  <li><strong>Insufficient Outcomes:</strong> Does not record key clinical indicators.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "extraction" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Step 4 & 5: Critical Appraisal & Risk of Bias Domains</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Critical appraisal evaluated study validity. Cochrane's RoB 2.0 assesses bias across five domains of clinical trials, while QUADAS-2 is used for diagnostic accuracy studies.
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Cochrane RoB 2.0 Core Domains Assessed
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-[11px]">
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="font-bold block text-gray-800">Domain 1</span>
                  <span className="text-gray-500 block mt-1">Randomization Process Bias</span>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="font-bold block text-gray-800">Domain 2</span>
                  <span className="text-gray-500 block mt-1">Deviations from Interventions</span>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="font-bold block text-gray-800">Domain 3</span>
                  <span className="text-gray-500 block mt-1">Missing Outcome Data Bias</span>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="font-bold block text-gray-800">Domain 4</span>
                  <span className="text-gray-500 block mt-1">Measurement of Outcomes</span>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="font-bold block text-gray-800">Domain 5</span>
                  <span className="text-gray-500 block mt-1">Selection of Reported Results</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
