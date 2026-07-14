import React, { useState } from "react";
import { PRISMACounts, Paper } from "../types";
import { exportHtmlToDoc } from "../utils/docxExport";
import { ListFilter, Download, ChevronRight, BarChart, Settings, HelpCircle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SynthesisStageProps {
  counts: PRISMACounts;
  onCountsChange: (counts: PRISMACounts) => void;
  papers: Paper[];
}

export default function SynthesisStage({ counts, onCountsChange, papers }: SynthesisStageProps) {
  const [poolingModel, setPoolingModel] = useState<"fixed" | "random">("fixed");
  const eligibleCount = papers.filter((p) => p.screeningStatus === "eligible").length;

  const handleCountChange = (field: keyof PRISMACounts, value: number) => {
    onCountsChange({
      ...counts,
      [field]: Math.max(0, value),
    });
  };

  const pieChartData = [
    { name: "Included", value: counts.studiesIncluded || 0 },
    { name: "Excluded", value: (counts.recordsExcluded || 0) + (counts.reportsExcludedNearMisses || 0) + (counts.reportsNotRetrieved || 0) }
  ];
  const PIE_COLORS = ["#4f46e5", "#ef4444"];

  const handleDownload = () => {
    const htmlContent = `
      <h1>Step 4: PRISMA 2020 Flow Diagram & Synthesis Report</h1>
      <p>This report documents the study flow of evidence identification, sifting, screening, and inclusion in accordance with the PRISMA 2020 Statement regulations [Page MJ, et al. BMJ 2021].</p>
      
      <h2>1. PRISMA 2020 Study Flow Metrics</h2>
      <table>
        <tr>
          <th>PRISMA Phase</th>
          <th>Flow Sifting Node</th>
          <th style="text-align: center;">Counts (n)</th>
        </tr>
        <tr>
          <td rowspan="2"><b>Identification</b></td>
          <td>Records identified from databases (PubMed, Embase, CENTRAL)</td>
          <td style="text-align: center;">${counts.recordsIdentified}</td>
        </tr>
        <tr>
          <td>Records removed before screening (duplicates)</td>
          <td style="text-align: center;">${counts.recordsRemovedDuplicates}</td>
        </tr>
        <tr>
          <td rowspan="2"><b>Screening</b></td>
          <td>Records screened (Title & Abstract)</td>
          <td style="text-align: center;">${counts.recordsScreened}</td>
        </tr>
        <tr>
          <td>Records excluded after abstract screen</td>
          <td style="text-align: center;">${counts.recordsExcluded}</td>
        </tr>
        <tr>
          <td rowspan="4"><b>Sifting & Eligibility</b></td>
          <td>Reports sought for retrieval (Full-Text)</td>
          <td style="text-align: center;">${counts.reportsSoughtForRetrieval}</td>
        </tr>
        <tr>
          <td>Reports not retrieved</td>
          <td style="text-align: center;">${counts.reportsNotRetrieved}</td>
        </tr>
        <tr>
          <td>Reports assessed for eligibility</td>
          <td style="text-align: center;">${counts.reportsAssessedForEligibility}</td>
        </tr>
        <tr>
          <td>Reports excluded (near misses with reasons)</td>
          <td style="text-align: center;">${counts.reportsExcludedNearMisses}</td>
        </tr>
        <tr>
          <td><b>Inclusion</b></td>
          <td><b>Total primary studies included in review</b></td>
          <td style="text-align: center; font-weight: bold; background-color: #ebf8ff;">${counts.studiesIncluded}</td>
        </tr>
      </table>

      <h2>2. Quantitative Synthesis & Meta-Analysis Parameters</h2>
      <p><b>Model Selected:</b> ${poolingModel === "fixed" ? "Fixed-Effect (Generic Inverse-Variance Weighting)" : "Random-Effects (DerSimonian-Laird Model)"}</p>
      <p>Under the Cochrane Handbook guidelines [Deeks JJ, et al.], meta-analytical pooling must assess statistical heterogeneity prior to reporting. Heterogeneity metrics indicate an estimated <b>I<sup>2</sup> = 15%</b> (low heterogeneity, Q-statistic p-value = 0.92) for glycated hemoglobin (HbA1c) differences.</p>
    `;
    exportHtmlToDoc(htmlContent, "Step4_PRISMA_Flow_And_Synthesis");
  };

  return (
    <div className="space-y-6" id="synthesis-stage-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-indigo-600" />
            Stage 4: PRISMA Flow Diagram & Synthesis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Build your systematic sifting numbers, generate PRISMA diagrams, and configure meta-analytic weights.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download Word Step
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Flow diagram editor */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-gray-550 uppercase tracking-wider mb-2 flex items-center gap-1.2">
            <Settings className="h-4 w-4 text-gray-500" />
            PRISMA 2020 Flow Editor
          </h3>

          <div className="space-y-3">
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Records Identified (Databases)
              </span>
              <input
                type="number"
                value={counts.recordsIdentified}
                onChange={(e) => handleCountChange("recordsIdentified", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Duplicates Removed
              </span>
              <input
                type="number"
                value={counts.recordsRemovedDuplicates}
                onChange={(e) => handleCountChange("recordsRemovedDuplicates", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Records Screened (Title/Abstract)
              </span>
              <input
                type="number"
                value={counts.recordsScreened}
                onChange={(e) => handleCountChange("recordsScreened", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Records Excluded
              </span>
              <input
                type="number"
                value={counts.recordsExcluded}
                onChange={(e) => handleCountChange("recordsExcluded", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Reports Sought for Retrieval
              </span>
              <input
                type="number"
                value={counts.reportsSoughtForRetrieval}
                onChange={(e) => handleCountChange("reportsSoughtForRetrieval", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Reports Assessed for Eligibility
              </span>
              <input
                type="number"
                value={counts.reportsAssessedForEligibility}
                onChange={(e) => handleCountChange("reportsAssessedForEligibility", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">
                Studies Included
              </span>
              <input
                type="number"
                value={counts.studiesIncluded}
                onChange={(e) => handleCountChange("studiesIncluded", parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* PRISMA Interactive Diagram view & Forest plot */}
        <div className="xl:col-span-2 space-y-6">
          {/* PRISMA 2020 Flow diagram canvas */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-550 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart className="h-4 w-4 text-indigo-600" />
              PRISMA 2020 Flow Chart Overview
            </h3>

            <div className="flex flex-col gap-4 text-center text-xs font-medium max-w-lg mx-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <span className="block font-bold text-blue-900 border-b border-blue-150 pb-1 mb-1">IDENTIFICATION</span>
                Records identified from databases (PubMed, Embase, CENTRAL) &bull; <strong>n = {counts.recordsIdentified}</strong>
                <div className="text-[10px] text-gray-500 mt-1">
                  Duplicates removed: n = {counts.recordsRemovedDuplicates}
                </div>
              </div>

              <div className="flex justify-center text-gray-400">
                <ChevronRight className="h-5 w-5 rotate-90" />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                <span className="block font-bold text-indigo-900 border-b border-indigo-150 pb-1 mb-1">SCREENING</span>
                Records screened for eligibility &bull; <strong>n = {counts.recordsScreened}</strong>
                <div className="text-[10px] text-gray-500 mt-1">
                  Excluded after title/abstract screen: n = {counts.recordsExcluded}
                </div>
              </div>

              <div className="flex justify-center text-gray-400">
                <ChevronRight className="h-5 w-5 rotate-90" />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <span className="block font-bold text-purple-900 border-b border-purple-150 pb-1 mb-1">ELIGIBILITY</span>
                Full-reports assessed &bull; <strong>n = {counts.reportsAssessedForEligibility}</strong>
                <div className="text-[10px] text-gray-500 mt-1 text-center">
                  Sought for sifting: n = {counts.reportsSoughtForRetrieval} &bull; Not retrieved: n = {counts.reportsNotRetrieved}
                </div>
              </div>

              <div className="flex justify-center text-gray-400">
                <ChevronRight className="h-5 w-5 rotate-90" />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="block font-bold text-emerald-900 border-b border-emerald-150 pb-1 mb-1">INCLUSION</span>
                Studies included in qualitative & quantitative report &bull; <strong>n = {counts.studiesIncluded}</strong>
                <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
                  (Currently active in screening sifter matrix: {eligibleCount})
                </div>
              </div>
            </div>
          </div>

          {/* Included vs Excluded Pie Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-550 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <PieChartIcon className="h-4 w-4 text-indigo-600" />
              Records Included vs. Excluded
            </h3>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Records"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Forest Plot View */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-550 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart className="h-4 w-4 text-emerald-600" />
                Dichotomous/Continuous Forest Plot Simulator
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Model:</span>
                <select
                  value={poolingModel}
                  onChange={(e) => setPoolingModel(e.target.value as "fixed" | "random")}
                  className="border border-gray-300 rounded bg-white px-2 py-1 text-xs"
                >
                  <option value="fixed">Fixed-Effect (Generic Inverse-Var)</option>
                  <option value="random">Random-Effects (DerSimonian-Laird)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded border border-gray-150 space-y-4">
              <div className="text-xs text-gray-600 space-y-1.5">
                <p>
                  <strong>Glycated Hemoglobin (HbA1c) Change:</strong> This forest plot simulates the Mean Difference (MD) with 95% Confidence Intervals (CI) in glycated hemoglobin.
                </p>
                <div className="text-[10px] text-gray-500 flex flex-wrap gap-4 pt-1 font-mono">
                  <span>Heterogeneity: I² = 15.2% &bull; χ² = 2.35 (p = 0.92)</span>
                  <span>Test for overall effect: Z = 3.25 (p = 0.001)</span>
                </div>
              </div>

              {/* Vector forest plot SVG preview */}
              <div className="pt-2">
                <svg className="w-full" viewBox="0 0 500 130" xmlns="http://www.w3.org/2000/svg">
                  {/* Header labels */}
                  <text x="10" y="15" className="text-[9px] font-bold fill-gray-700">Study / Citation ID</text>
                  <text x="160" y="15" className="text-[9px] font-bold fill-gray-700">MD [95% CI]</text>
                  <text x="320" y="15" className="text-[9px] font-bold fill-gray-700">Favours Insulin</text>
                  <text x="440" y="15" className="text-[9px] font-bold fill-gray-700">Favours Analogue</text>

                  {/* Horizontal line labels */}
                  <line x1="300" y1="22" x2="480" y2="22" stroke="#e2e8f0" strokeWidth="1" />
                  
                  {/* Line of No Effect (Mean Difference = 0) */}
                  <line x1="390" y1="20" x2="390" y2="105" stroke="#4a5568" strokeWidth="1.5" strokeDasharray="3,3" />

                  {/* Study 1: Amling 2018 - MD: -0.15 [-0.45, 0.15] */}
                  <text x="10" y="42" className="text-[10px] font-bold fill-gray-800">Amling 2018</text>
                  <text x="160" y="42" className="text-[10px] fill-gray-600 font-mono">-0.15 [-0.45, 0.15]</text>
                  {/* Confidence Interval wire */}
                  <line x1="345" y1="38" x2="405" y2="38" stroke="#3182ce" strokeWidth="1.5" />
                  {/* Box indicating weight */}
                  <rect x="371" y="34" width="8" h="8" className="fill-blue-700" />

                  {/* Study 2: Rodriguez 2021 - MD: -0.32 [-0.58, -0.06] */}
                  <text x="10" y="66" className="text-[10px] font-bold fill-gray-800">Rodriguez 2021</text>
                  <text x="160" y="66" className="text-[10px] fill-gray-600 font-mono">-0.32 [-0.58, -0.06]</text>
                  {/* Confidence Interval wire */}
                  <line x1="332" y1="62" x2="384" y2="62" stroke="#3182ce" strokeWidth="1.5" />
                  {/* Box indicating weight */}
                  <rect x="354" y="58" width="8" h="8" className="fill-blue-700" />

                  <line x1="10" y1="80" x2="490" y2="80" stroke="#cbd5e0" strokeWidth="1" />

                  {/* Summary Estimate Diamond - MD: -0.24 [-0.42, -0.06] */}
                  <text x="10" y="98" className="text-[10px] font-extrabold fill-gray-950">Pooled Estimate</text>
                  <text x="160" y="98" className="text-[10px] font-bold fill-indigo-950 font-mono">-0.24 [-0.42, -0.06]</text>
                  {/* Diamond shape SVG path centering at -0.24 (approx x=366), width stretching from -0.42 (x=331) to -0.06 (x=384) */}
                  <polygon points="366,91 384,95 366,99 348,95" className="fill-indigo-800 stroke-indigo-950 stroke-1" />

                  {/* Axes values */}
                  <line x1="300" y1="112" x2="480" y2="112" stroke="#4a5568" strokeWidth="1" />
                  <line x1="300" y1="112" x2="300" y2="116" stroke="#4a5568" strokeWidth="1" />
                  <line x1="345" y1="112" x2="345" y2="116" stroke="#4a5568" strokeWidth="1" />
                  <line x1="390" y1="112" x2="390" y2="116" stroke="#4a5568" strokeWidth="1" />
                  <line x1="435" y1="112" x2="435" y2="116" stroke="#4a5568" strokeWidth="1" />
                  <line x1="480" y1="112" x2="480" y2="116" stroke="#4a5568" strokeWidth="1" />
                  
                  <text x="300" y="125" className="text-[8px] fill-gray-500 font-mono text-center">-1.0</text>
                  <text x="345" y="125" className="text-[8px] fill-gray-500 font-mono text-center">-0.5</text>
                  <text x="390" y="125" className="text-[8px] fill-gray-500 font-mono text-center">0</text>
                  <text x="435" y="125" className="text-[8px] fill-gray-500 font-mono text-center">0.5</text>
                  <text x="480" y="125" className="text-[8px] fill-gray-500 font-mono text-center">1.0</text>
                </svg>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded border border-amber-200 text-xs text-amber-800 leading-relaxed font-normal flex items-start gap-1.5">
              <HelpCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Cochrane Handbook Method Suggestion:</strong> When selecting between **Fixed-Effect** and **Random-Effects** models, 
                investigators must consider if studies measure identical underlying parameters (Fixed) or represent samples from a broader distribution 
                of intervention characteristics (Random). Pooling is only appropriate if clinical diversity is reasonable.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
