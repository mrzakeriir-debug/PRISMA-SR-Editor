import React from "react";
import { PICOSCriteria, Paper, PRISMACounts } from "../types";
import { exportHtmlToDoc } from "../utils/docxExport";
import { sampleReferences } from "../initialData";
import { FileText, Download, Award, ShieldAlert, Library, BookOpen } from "lucide-react";

interface ReportStageProps {
  picos: PICOSCriteria;
  papers: Paper[];
  counts: PRISMACounts;
}

export default function ReportStage({ picos, papers, counts }: ReportStageProps) {
  const eligiblePapers = papers.filter((p) => p.screeningStatus === "eligible");

  const buildUnifiedHtml = () => {
    // Stage 1: Protocol Section
    let stage1Html = `
      <h1>Stage 1: Protocol Formulation & PICOS Standards</h1>
      <p>This protocol specifies the pre-defined eligibility guidelines and cohort boundaries formulated for the systematic review or health technology assessment, addressing selection bias prior to sifting.</p>
      <table>
        <tr>
          <th style="width: 30%">PICOS Criterion</th>
          <th style="width: 70%">Pre-Specified Eligibility Guidelines</th>
        </tr>
        <tr><td><b>Review Study Title</b></td><td>${picos.title || "Untitled Systematic Review"}</td></tr>
        <tr><td><b>Patient Population (P)</b></td><td>${picos.population || "Any population"}</td></tr>
        <tr><td><b>Intervention (I)</b></td><td>${picos.intervention || "Any intervention"}</td></tr>
        <tr><td><b>Comparator / Control (C)</b></td><td>${picos.comparator || "Any comparative control or placebo"}</td></tr>
        <tr><td><b>Key Outcome Measures (O)</b></td><td>${picos.outcomes || "Any relevant outcomes"}</td></tr>
        <tr><td><b>Study Designs Allowed (S)</b></td><td>${picos.studyDesigns || "All designs"}</td></tr>
        <tr><td><b>Language Restrictions</b></td><td>${picos.languageRestrictions || "None specified"}</td></tr>
        <tr><td><b>Publication Threshold</b></td><td>${picos.publicationStatus || "All publications"}</td></tr>
      </table>
    `;

    // Stage 2: Screening Section
    let screeningRows = "";
    papers.forEach((p, idx) => {
      let badge = "";
      if (p.screeningStatus === "eligible") badge = '<span class="badge-eligible">ELIGIBLE</span>';
      else if (p.screeningStatus === "excluded") badge = '<span class="badge-excluded">EXCLUDED</span>';
      else if (p.screeningStatus === "needs_full_text") badge = '<span class="badge-unclear font-serif text-[10px]">NEEDS SIFTING</span>';
      else badge = "<b>UNSCREENED</b>";

      screeningRows += `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${p.citation}</b><br><i>${p.journal} (${p.year})</i></td>
          <td><b>${p.title}</b><br><br>${p.abstract}</td>
          <td style="text-align: center;">${badge}</td>
          <td>${p.screeningReason || "No appraisal justification loaded."}</td>
        </tr>
      `;
    });

    let stage2Html = `
      <h1>Stage 2: PRISMA Sifting & Article Screening Matrix</h1>
      <p>The following sifting log records the screening decision and methodological justification for each citation retrieved from biological databases, conforming to PRISMA reporting protocols.</p>
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
          ${screeningRows || '<tr><td colspan="5">No studies added to the screening matrix yet.</td></tr>'}
        </tbody>
      </table>
    `;

    // Stage 3: Data Extraction Details
    let extractionHtml = "";
    eligiblePapers.forEach((p) => {
      const ext = p.extractionData;
      extractionHtml += `
        <h3 style="margin-top: 14px; color: #2c5252;">Worksheet: ${p.citation} - ${p.title}</h3>
        <table>
          <tr><th style="width: 30%">Property</th><th style="width: 70%">Extracted Parameters</th></tr>
          <tr><td><b>Sample Size (n)</b></td><td>${ext?.sampleSize || "Not extracted"}</td></tr>
          <tr><td><b>Age Class</b></td><td>${ext?.ageRange || "Not extracted"}</td></tr>
          <tr><td><b>Demographics</b></td><td>${ext?.demographics || "Not extracted"}</td></tr>
          <tr><td><b>Intervention details</b></td><td>${ext?.interventionDetails || "Not extracted"}</td></tr>
          <tr><td><b>Comparator details</b></td><td>${ext?.comparatorDetails || "Not extracted"}</td></tr>
          <tr><td><b>Outcome metrics</b></td><td>${ext?.keyOutcomesReported || "Not extracted"}</td></tr>
          <tr><td><b>Author Conclusions</b></td><td>${ext?.conclusions || "Not extracted"}</td></tr>
        </table>
      `;
    });

    let stage3Html = `
      <h1>Stage 3: Evidence Extraction Worksheet</h1>
      <p>Data extraction for all studies qualifying as <b>Eligible</b> after full title and abstract sifting. Focuses on participant metrics, diagnostic levels, and clinical findings.</p>
      ${extractionHtml || "<p><i>No studies are currently marked as Eligible. Sift papers and mark them Eligible in Stage 2 to populate extraction cards.</i></p>"}
    `;

    // Stage 4: Risk of Bias
    let robHtml = "";
    eligiblePapers.forEach((p) => {
      const rob = p.qualityAssessment;
      if (!rob) return;
      let robItemsRows = "";
      rob.items.forEach((item) => {
        let badgeStyle = "font-weight: bold;";
        if (item.judgment === "Low risk") badgeStyle += "color: #22543d; background-color: #c6f6d5;";
        else if (item.judgment === "High risk") badgeStyle += "color: #742a2a; background-color: #fed7d7;";
        else badgeStyle += "color: #744210; background-color: #feebc8;";

        robItemsRows += `
          <tr>
            <td><b>${item.domain}</b></td>
            <td style="text-align: center;"><span style="${badgeStyle} padding: 2px 6px; border-radius: 4px;">${item.judgment}</span></td>
            <td>${item.supportForJudgment}</td>
          </tr>
        `;
      });

      robHtml += `
        <h3 style="margin-top: 14px; color: #2c5252;">Quality Assessment: ${p.citation} (${rob.toolUsed})</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 35%">Biases / Evaluation Domain</th>
              <th style="width: 15%; text-align: center;">Risk Judgment</th>
              <th style="width: 50%">Cochrane Supporting Quotation Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${robItemsRows}
          </tbody>
        </table>
        <p><b>Overall Comments:</b> ${rob.overallComments || "None"}</p>
      `;
    });

    let stage4Html = `
      <h1>Stage 4: Cochrane Methodological Risk of Bias Assessment</h1>
      <p>Critical appraising of study validity. Individual domains represent potential risks of selective reporting, allocation subversion, sifting, or performance imbalances with supporting quote citations.</p>
      ${robHtml || "<p><i>No appraised Risk of Bias worksheets found. Please run appraisal in Stage 3.</i></p>"}
    `;

    // Stage 5: PRISMA Sifting flow
    let stage5Html = `
      <h1>Stage 5: PRISMA 2020 Study Flow Statistics</h1>
      <p>The structured PRISMA 2020 sifting counts detail duplicates removal, sifting pools, retrieved reports, and final studies contributing to primary qualitative synthesis:</p>
      <table>
        <tr>
          <th>PRISMA Flow Phase</th>
          <th>Sifting Category Node</th>
          <th style="text-align: center;">Counts (n)</th>
        </tr>
        <tr><td>Identification</td><td>Records identified from databases (PubMed, databases, registers)</td><td style="text-align: center;">${counts.recordsIdentified}</td></tr>
        <tr><td>Identification</td><td>Duplicates removed prior to screening</td><td style="text-align: center;">${counts.recordsRemovedDuplicates}</td></tr>
        <tr><td>Screening</td><td>Records screened (Title/abstract)</td><td style="text-align: center;">${counts.recordsScreened}</td></tr>
        <tr><td>Screening</td><td>Records excluded after abstract sifting</td><td style="text-align: center;">${counts.recordsExcluded}</td></tr>
        <tr><td>Sifting & Eligibility</td><td>Reports sought for retrieval (Full-Text)</td><td style="text-align: center;">${counts.reportsSoughtForRetrieval}</td></tr>
        <tr><td>Sifting & Eligibility</td><td>Reports not retrieved</td><td style="text-align: center;">${counts.reportsNotRetrieved}</td></tr>
        <tr><td>Sifting & Eligibility</td><td>Reports assessed for eligibility</td><td style="text-align: center;">${counts.reportsAssessedForEligibility}</td></tr>
        <tr><td>Sifting & Eligibility</td><td>Reports excluded (near misses)</td><td style="text-align: center;">${counts.reportsExcludedNearMisses}</td></tr>
        <tr><td><b>Inclusions</b></td><td><b>Total studies included in review</b></td><td style="text-align: center; font-weight: bold; background-color: #ebf8ff;">${counts.studiesIncluded}</td></tr>
      </table>
    `;

    // References section
    let refHtml = `<ol style="margin-left: 20px;">`;
    sampleReferences.forEach((ref) => {
      refHtml += `<li class="reference-item">${ref}</li>`;
    });
    refHtml += `</ol>`;

    let stage6Html = `
      <h1>References / Cited Bibliography Indices</h1>
      <p>The following references form the scientific foundation of the systematic review process, quality tools, and reporting criteria employed throughout this sifting workflow:</p>
      ${refHtml}
    `;

    return stage1Html + stage2Html + stage3Html + stage4Html + stage5Html + stage6Html;
  };

  const handleDownloadUnified = () => {
    exportHtmlToDoc(buildUnifiedHtml(), "Unified_Systematic_Review_PRISMA_Report");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="report-stage-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Library className="h-5 w-5 text-indigo-600" />
            Stage 5: Unified Review Draft & Bibliography
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review your consolidated systematic review report with comprehensive bibliographies. Download all steps in a single file.
          </p>
        </div>
        <button
          onClick={handleDownloadUnified}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-md flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Consolidated Word Doc
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md prose max-w-none max-h-[600px] overflow-y-auto space-y-8 scrollbar-thin">
        {/* Section 1 */}
        <section className="space-y-3">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Stage 1</span>
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-2">
            1. Protocol Formulation & PICOS Standards
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Formulating research goals and inclusion criteria <em>a priori</em> is necessary to minimize sifting biases.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-gray-700 border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-700 border-b">PICOS Criterion</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700 border-b">Target Specs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2 font-bold bg-gray-50/50">Title Idea</td>
                  <td className="px-4 py-2 text-gray-650">{picos.title || "Untitled Review"}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold bg-gray-50/50">Population (P)</td>
                  <td className="px-4 py-2 text-gray-650">{picos.population}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold bg-gray-50/50">Intervention (I)</td>
                  <td className="px-4 py-2 text-gray-650">{picos.intervention}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold bg-gray-50/50">Comparator (C)</td>
                  <td className="px-4 py-2 text-gray-650">{picos.comparator}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold bg-gray-50/50">Outcomes (O)</td>
                  <td className="px-4 py-2 text-gray-650">{picos.outcomes}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold bg-gray-50/50">Study Designs (S)</td>
                  <td className="px-4 py-2 text-gray-650">{picos.studyDesigns}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Stage 2</span>
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-2">
            2. Title & Abstract Screening Matrix
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Conforming to PRISMA reporting, duplicate citations are extracted and compared to PICOS parameters.
          </p>
          <div className="overflow-x-auto text-[11px] text-gray-700 border border-gray-200 rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-center" style={{ width: "5%" }}>#</th>
                  <th className="px-3 py-2 text-left" style={{ width: "20%" }}>Source</th>
                  <th className="px-3 py-2 text-left" style={{ width: "35%" }}>Title / Synopsis</th>
                  <th className="px-3 py-2 text-center" style={{ width: "15%" }}>Decision</th>
                  <th className="px-3 py-2 text-left" style={{ width: "25%" }}>Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {String(papers.length) === "0" ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-400">No screened papers populated.</td>
                  </tr>
                ) : (
                  papers.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-center text-gray-500 font-bold">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <strong className="text-blue-600 font-bold">{p.citation}</strong> <br />
                        <span className="text-[10px] text-gray-400">{p.journal} ({p.year})</span>
                      </td>
                      <td className="px-3 py-2 max-w-sm font-light text-gray-600">
                        <span className="block font-bold text-gray-900 mb-1 leading-snug">{p.title}</span>
                        <span className="line-clamp-2">{p.abstract}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block text-[9px] font-extrabold uppercase rounded px-2 py-0.5 ${
                          p.screeningStatus === "eligible"
                            ? "bg-emerald-50 text-emerald-800 text-[10px]"
                            : p.screeningStatus === "excluded"
                            ? "bg-red-50 text-red-800"
                            : p.screeningStatus === "needs_full_text"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-gray-50 text-gray-500"
                        }`}>
                          {p.screeningStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-[10px]">{p.screeningReason || "Pending screening."}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Stage 3</span>
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-2">
            3. Data Extraction Table
          </h3>
          <p className="text-xs text-gray-650 leading-relaxed font-normal">
            For sifting records validated as <strong>Eligible</strong>, clinical, age, and sample constraints were gathered.
          </p>
          {String(eligiblePapers.length) === "0" ? (
            <p className="text-xs text-gray-400 italic">No eligible studies populated. Sift and validate eligible citations in Stage 2 first.</p>
          ) : (
            eligiblePapers.map((p) => (
              <div key={p.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-blue-900">{p.citation} - {p.title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-gray-500 text-[10px] uppercase">Sample Size</span>
                    <span className="text-gray-900 font-semibold">{p.extractionData?.sampleSize || "Pending extraction."}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-500 text-[10px] uppercase">Age Cohort</span>
                    <span className="text-gray-900 font-semibold">{p.extractionData?.ageRange || "Pending extraction."}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-500 text-[10px] uppercase">Intervention</span>
                    <span className="text-gray-900 font-semibold">{p.extractionData?.interventionDetails || "Pending."}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-500 text-[10px] uppercase">Comparator</span>
                    <span className="text-gray-900 font-semibold">{p.extractionData?.comparatorDetails || "Pending."}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Stage 4</span>
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-2">
            4. Critical Appraising: Risk of Bias Matrices
          </h3>
          <p className="text-xs text-gray-650 leading-relaxed">
            Domain-specific methodological quality assessment matching Cochrane bias guidelines. Cites direct quotations as supports:
          </p>
          {String(eligiblePapers.length) === "0" ? (
            <p className="text-xs text-gray-400 italic">No appraised Risk of Bias cards found.</p>
          ) : (
            eligiblePapers.map((p) => {
              const rob = p.qualityAssessment;
              if (!rob) return null;
              return (
                <div key={p.id} className="space-y-2 border border-gray-200 rounded p-4">
                  <h4 className="text-xs font-bold text-gray-900">{p.citation} Evaluation Matrix ({rob.toolUsed})</h4>
                  <table className="min-w-full text-xs text-gray-700 divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-[10px]">
                      <tr>
                        <th className="px-3 py-1 font-bold text-left">Quality Domain</th>
                        <th className="px-3 py-1 font-bold text-center">Judgment Status</th>
                        <th className="px-3 py-1 font-bold text-left">Internal Text Support Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rob.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-semibold text-gray-800">{item.domain}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                              item.judgment === "Low risk"
                                ? "bg-emerald-50 text-emerald-800"
                                : item.judgment === "High risk"
                                ? "bg-red-50 text-red-800"
                                : "bg-amber-50 text-amber-800"
                            }`}>
                              {item.judgment}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500 font-light italic">
                            {item.supportForJudgment || "No textual reference cited yet."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-600 font-normal">
                    <strong>Summative comments:</strong> {rob.overallComments || "No general comments listed."}
                  </p>
                </div>
              );
            })
          )}
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Stage 5</span>
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-2">
            5. PRISMA 2020 Flow sifting numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <span className="block text-xs font-semibold text-gray-500 uppercase">Records Identified</span>
              <span className="text-lg font-bold text-gray-900">{counts.recordsIdentified}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <span className="block text-xs font-semibold text-gray-500 uppercase">Duplicates Removed</span>
              <span className="text-lg font-bold text-gray-900">{counts.recordsRemovedDuplicates}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <span className="block text-xs font-semibold text-gray-500 uppercase">Full Texts Screened</span>
              <span className="text-lg font-bold text-gray-900">{counts.reportsAssessedForEligibility}</span>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
              <span className="block text-xs font-semibold text-indigo-700 uppercase font-bold text-[10px]">Included Studies</span>
              <span className="text-lg font-extrabold text-indigo-900">{counts.studiesIncluded}</span>
            </div>
          </div>
        </section>

        {/* References Section */}
        <section className="space-y-4" id="report-cited-references">
          <div className="flex items-center gap-1.5 border-b border-gray-150 pb-2">
            <BookOpen className="h-5 w-5 text-indigo-700" />
            <h3 className="text-lg font-bold text-gray-900 m-0">
              Cited References & Systematic Review Guidelines
            </h3>
          </div>
          <p className="text-xs text-gray-600 font-normal">
            The following standard scientific bibliographies are referenced throughout this systematic report:
          </p>
          <div className="divide-y divide-gray-150 bg-gray-50 p-4 rounded-md border border-gray-200">
            {sampleReferences.map((ref, idx) => (
              <div key={idx} className="py-2.5 text-xs text-gray-600 first:pt-0 last:pb-0 leading-relaxed font-light pl-6 relative">
                <span className="absolute left-0 top-2.5 font-bold text-indigo-900 font-mono text-[11px]">{idx + 1}.</span>
                {ref}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
