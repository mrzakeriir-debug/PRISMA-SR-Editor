import React, { useState } from "react";
import { Paper, ExtractionData, RiskOfBias, RiskOfBiasItem } from "../types";
import { exportHtmlToDoc } from "../utils/docxExport";
import { FileText, Sparkles, Loader2, Award, Calendar, CheckSquare, Settings2, Download, AlertCircle, RefreshCw } from "lucide-react";

interface ExtractionStageProps {
  papers: Paper[];
  onPapersChange: (papers: Paper[]) => void;
}

export default function ExtractionStage({ papers, onPapersChange }: ExtractionStageProps) {
  const eligiblePapers = papers.filter((p) => p.screeningStatus === "eligible");
  const [selectedId, setSelectedId] = useState<string>(eligiblePapers[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [assessmentTool, setAssessmentTool] = useState<"Cochrane RoB 2.0" | "QUADAS-2">("Cochrane RoB 2.0");

  const selectedPaper = papers.find((p) => p.id === selectedId);

  // If selectedId is empty but eligible papers exist, auto-select first one
  React.useEffect(() => {
    if (!selectedId && eligiblePapers.length > 0) {
      setSelectedId(eligiblePapers[0].id);
    }
  }, [eligiblePapers, selectedId]);

  const updatePaperData = (updatedExt: ExtractionData, updatedQ: RiskOfBias) => {
    const updated = papers.map((p) => {
      if (p.id === selectedId) {
        return {
          ...p,
          extractionData: updatedExt,
          qualityAssessment: updatedQ,
        };
      }
      return p;
    });
    onPapersChange(updated);
  };

  const handleExtractionFieldChange = (field: keyof ExtractionData, value: string) => {
    if (!selectedPaper) return;
    const currentExt: ExtractionData = selectedPaper.extractionData || {
      sampleSize: "",
      ageRange: "",
      demographics: "",
      interventionDetails: "",
      comparatorDetails: "",
      keyOutcomesReported: "",
      conclusions: "",
      citationReference: selectedPaper.citation,
    };

    const updatedExt = { ...currentExt, [field]: value };
    const currentQ: RiskOfBias = selectedPaper.qualityAssessment || {
      toolUsed: assessmentTool,
      items: getDefaultRoBItems(assessmentTool),
      overallComments: "",
    };

    updatePaperData(updatedExt, currentQ);
  };

  const handleRoBFieldChange = (index: number, key: keyof RiskOfBiasItem, value: string) => {
    if (!selectedPaper || !selectedPaper.qualityAssessment) return;
    const currentQ = { ...selectedPaper.qualityAssessment };
    const updatedItems = [...currentQ.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [key]: value,
    } as RiskOfBiasItem;

    currentQ.items = updatedItems;
    updatePaperData(selectedPaper.extractionData!, currentQ);
  };

  const handleOverallRoBChange = (value: string) => {
    if (!selectedPaper || !selectedPaper.qualityAssessment) return;
    const currentQ = { ...selectedPaper.qualityAssessment, overallComments: value };
    updatePaperData(selectedPaper.extractionData!, currentQ);
  };

  const runAIAssistedAppraisal = async () => {
    if (!selectedPaper) return;
    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/extract-bias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper: selectedPaper,
          tool: assessmentTool,
        }),
      });

      if (!response.ok) throw new Error("Server of extraction returned an error.");

      const result = await response.json();
      updatePaperData(result.extraction, result.qualityAssessment);
    } catch (err: any) {
      setApiError(err.message || "Failed to appraise using AI proxy.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedPaper) return;
    const ext = selectedPaper.extractionData;
    const rob = selectedPaper.qualityAssessment;

    let robRows = "";
    rob?.items.forEach((item) => {
      let badgeStyle = "font-weight: bold;";
      if (item.judgment === "Low risk") badgeStyle += "color: #22543d; background-color: #c6f6d5;";
      else if (item.judgment === "High risk") badgeStyle += "color: #742a2a; background-color: #fed7d7;";
      else badgeStyle += "color: #744210; background-color: #feebc8;";

      robRows += `
        <tr>
          <td><b>${item.domain}</b></td>
          <td style="text-align: center;"><span style="${badgeStyle} padding: 2px 6px; border-radius: 4px;">${item.judgment}</span></td>
          <td>${item.supportForJudgment}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <h1>Step 3: Extraction Worksheet & Risk of Bias Appraisal</h1>
      <p><b>Study Paper Evaluated:</b> ${selectedPaper.title} (${selectedPaper.year})</p>
      <p><b>Citation ID:</b> ${selectedPaper.citation}</p>
      
      <h2>1. Extracted Evidence Characteristics Summary</h2>
      <table>
        <tr>
          <th style="width: 30%">Evidence Property</th>
          <th style="width: 70%">Extracted Parameters & Supporting Values</th>
        </tr>
        <tr>
          <td><b>Sample Size Evaluated</b></td>
          <td>${ext?.sampleSize || "Not extracted yet."}</td>
        </tr>
        <tr>
          <td><b>Age Cohort & Range</b></td>
          <td>${ext?.ageRange || "Not extracted yet."}</td>
        </tr>
        <tr>
          <td><b>Population Demographics</b></td>
          <td>${ext?.demographics || "Not extracted yet."}</td>
        </tr>
        <tr>
          <td><b>Intervention Specifics</b></td>
          <td>${ext?.interventionDetails || "Not extracted yet."}</td>
        </tr>
        <tr>
          <td><b>Comparator Specifics</b></td>
          <td>${ext?.comparatorDetails || "Not extracted yet."}</td>
        </tr>
        <tr>
          <td><b>Key Outcomes Reported</b></td>
          <td>${ext?.keyOutcomesReported || "Not extracted yet."}</td>
        </tr>
        <tr>
          <td><b>Primary Clinical Conclusions</b></td>
          <td>${ext?.conclusions || "Not extracted yet."}</td>
        </tr>
      </table>

      <h2>2. Quality Assessment (${rob?.toolUsed || assessmentTool} Metrics)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 35%">Biases / Evaluation Domain</th>
            <th style="width: 15%; text-align: center;">Risk Judgment</th>
            <th style="width: 50%">Cochrane Supporting Quotation Evidence</th>
          </tr>
        </thead>
        <tbody>
          ${robRows || '<tr><td colspan="3">No risk of bias assessment performed yet.</td></tr>'}
        </tbody>
      </table>

      <p><b>Overall Evaluator Comments:</b> ${rob?.overallComments || "None specified."}</p>
    `;
    exportHtmlToDoc(htmlContent, `Step3_Worksheet_${selectedPaper.citation.replace(" ", "_")}`);
  };

  return (
    <div className="space-y-6" id="extraction-stage-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-905 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Stage 3: Data Extraction & Quality Assessment
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Perform comprehensive extraction and Cochrane Handbook / QUADAS-2 Risk of Bias quality assessment.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPaper && (
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Word Step
            </button>
          )}
        </div>
      </div>

      {eligiblePapers.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No Eligible Papers Listed</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You must mark at least one paper as <strong>Eligible</strong> in Stage 2 to edit the extraction worksheet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Study:</span>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="text-xs border border-gray-300 rounded bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {eligiblePapers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.citation} - {p.title.substring(0, 50)}...
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Assessment Tool:</span>
              <div className="inline-flex rounded-md shadow-xs border border-gray-350 overflow-hidden">
                <button
                  onClick={() => setAssessmentTool("Cochrane RoB 2.0")}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    assessmentTool === "Cochrane RoB 2.0" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cochrane RoB 2
                </button>
                <button
                  onClick={() => setAssessmentTool("QUADAS-2")}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    assessmentTool === "QUADAS-2" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  QUADAS-2
                </button>
              </div>
            </div>

            <button
              onClick={runAIAssistedAppraisal}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              )}
              AI Extract & Appraise
            </button>
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>Proxy appraisal failed: {apiError}. Standard parameters loaded.</span>
            </div>
          )}

          {selectedPaper && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Extraction Section */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-gray-90 w-full border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Evidence Extraction Worksheet
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Sample Size (n)
                    </label>
                    <input
                      type="text"
                      value={selectedPaper.extractionData?.sampleSize || ""}
                      onChange={(e) => handleExtractionFieldChange("sampleSize", e.target.value)}
                      placeholder="e.g. n = 120 (60 experimental, 60 control)"
                      className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Participant Age Cohort
                    </label>
                    <input
                      type="text"
                      value={selectedPaper.extractionData?.ageRange || ""}
                      onChange={(e) => handleExtractionFieldChange("ageRange", e.target.value)}
                      placeholder="e.g. Children 4-17 (mean: 11)"
                      className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Population Demographics
                  </label>
                  <input
                    type="text"
                    value={selectedPaper.extractionData?.demographics || ""}
                    onChange={(e) => handleExtractionFieldChange("demographics", e.target.value)}
                    placeholder="e.g. 52% male, 48% female, mean duration of diabetes: 6.2 years"
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Intervention details
                  </label>
                  <textarea
                    value={selectedPaper.extractionData?.interventionDetails || ""}
                    onChange={(e) => handleExtractionFieldChange("interventionDetails", e.target.value)}
                    rows={2}
                    placeholder="Describe compound/dosage/schedule/duration..."
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Comparator / Control details
                  </label>
                  <textarea
                    value={selectedPaper.extractionData?.comparatorDetails || ""}
                    onChange={(e) => handleExtractionFieldChange("comparatorDetails", e.target.value)}
                    rows={2}
                    placeholder="Describe control group parameters (placebo, other insulin)..."
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Outcomes Measured & Findings
                  </label>
                  <textarea
                    value={selectedPaper.extractionData?.keyOutcomesReported || ""}
                    onChange={(e) => handleExtractionFieldChange("keyOutcomesReported", e.target.value)}
                    rows={3}
                    placeholder="Result variables, statistics, HbA1c ratios, p-values..."
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Study Author Conclusions
                  </label>
                  <textarea
                    value={selectedPaper.extractionData?.conclusions || ""}
                    onChange={(e) => handleExtractionFieldChange("conclusions", e.target.value)}
                    rows={2}
                    placeholder="Main clinical bottom lines stated..."
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quality appraisal / Risk of Bias */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-gray-90 w-full border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  Methodological Risk of Bias Assessment
                </h3>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-blue-800 flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Guidelines require citing direct quotes from the text of the study 
                    to justify judgments. Avoid generic scores (e.g. AMSTAR or Jadad numbers) 
                    and explore domain-by-domain issues individually.
                  </span>
                </div>

                {(!selectedPaper.qualityAssessment || selectedPaper.qualityAssessment.toolUsed !== assessmentTool) ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    <button
                      onClick={runAIAssistedAppraisal}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors"
                    >
                      Initialize {assessmentTool} Assessment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPaper.qualityAssessment.items.map((item, idx) => (
                      <div key={idx} className="p-3 rounded border border-gray-150 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold text-gray-700">{item.domain}</label>
                          <select
                            value={item.judgment}
                            onChange={(e) => handleRoBFieldChange(idx, "judgment", e.target.value)}
                            className={`text-xs border font-semibold rounded px-2 py-0.5 focus:outline-none ${
                              item.judgment === "Low risk"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                : item.judgment === "High risk"
                                ? "bg-red-50 border-red-300 text-red-800"
                                : "bg-amber-50 border-amber-300 text-amber-800"
                            }`}
                          >
                            <option value="Low risk">Low risk</option>
                            <option value="High risk">High risk</option>
                            <option value="Unclear risk">Unclear risk</option>
                          </select>
                        </div>
                        <textarea
                          value={item.supportForJudgment}
                          onChange={(e) => handleRoBFieldChange(idx, "supportForJudgment", e.target.value)}
                          rows={2}
                          placeholder="Provide supporting citation or quotation page references..."
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50/50 focus:bg-white focus:outline-none"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Overall Methodological Comments / Quality Review
                      </label>
                      <textarea
                        value={selectedPaper.qualityAssessment.overallComments || ""}
                        onChange={(e) => handleOverallRoBChange(e.target.value)}
                        rows={2}
                        placeholder="Write a concluding summary on study validity..."
                        className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getDefaultRoBItems(tool: "Cochrane RoB 2.0" | "QUADAS-2"): RiskOfBiasItem[] {
  if (tool === "Cochrane RoB 2.0") {
    return [
      {
        domain: "Random sequence generation (Selection bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
      {
        domain: "Allocation concealment (Selection bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
      {
        domain: "Blinding of participants and personnel (Performance bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
      {
        domain: "Incomplete outcome data (Attrition bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
    ];
  } else {
    return [
      {
        domain: "Patient Selection Domain (Risk of Bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
      {
        domain: "Index Test Domain (Risk of Bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
      {
        domain: "Reference Standard Domain (Risk of Bias)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
      {
        domain: "Flow and Timing Domain (Risk of Bias & Applicability)",
        judgment: "Unclear risk",
        supportForJudgment: "",
      },
    ];
  }
}
