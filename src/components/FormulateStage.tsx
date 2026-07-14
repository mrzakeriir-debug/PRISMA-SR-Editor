import React from "react";
import { PICOSCriteria } from "../types";
import { exportHtmlToDoc } from "../utils/docxExport";
import { HelpCircle, Download, FileText, Info, Award } from "lucide-react";

interface FormulateStageProps {
  criteria: PICOSCriteria;
  onChange: (criteria: PICOSCriteria) => void;
}

export default function FormulateStage({ criteria, onChange }: FormulateStageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...criteria,
      [name]: value,
    });
  };

  const loadExample = () => {
    onChange({
      title: "Effectiveness of Human Insulin vs. Analogues in Diabetic Patients aged < 18",
      population: "Toddlers, children, adolescents (<18 years old) diagnosed with Type 1 or Type 2 Diabetes Mellitus",
      intervention: "Human insulin formulations (NPH, Neutral/Regular, or human long-acting insulin)",
      comparator: "Insulin analogues (e.g., rapid-acting Lispro/Aspart or long-acting Glargine/Detemir)",
      outcomes: "Primary: Glycated hemoglobin (HbA1c) level change. Secondary: Nocturnal or day hypoglycemia rates, adverse clinical events, and Patient/Parent Quality of Life (QoL) metrics.",
      studyDesigns: "Individual-level Randomized Controlled Trials (RCTs), cluster-RCTs, or quasi-RCT study designs",
      languageRestrictions: "English only (due to restricted translation sifting resources)",
      publicationStatus: "Peer-reviewed published clinical trials in scientific journals (grey literature abstracts searched as supplementary)"
    });
  };

  const handleDownload = () => {
    const htmlContent = `
      <h1>Step 1: Systematic Review Protocol & PICOS Formulation</h1>
      <p>This protocol specifies the pre-defined eligibility guidelines and conceptual boundaries of the systematic review in accordance with the Cochrane Handbook for Systematic Reviews of Interventions and PRISMA reporting standards.</p>
      
      <h2>1. Systematic Review Title</h2>
      <p><b>Title:</b> ${criteria.title || "Untitled Systematic Review"}</p>

      <h2>2. Eligible Study Population (P)</h2>
      <p><b>Description:</b> ${criteria.population || "Not defined yet."}</p>

      <h2>3. Active Intervention Investigated (I)</h2>
      <p><b>Description:</b> ${criteria.intervention || "Not defined yet."}</p>

      <h2>4. Comparative Control / Comparator (C)</h2>
      <p><b>Description:</b> ${criteria.comparator || "Not defined yet."}</p>

      <h2>5. Clinical & Behavioral Outcomes Measure (O)</h2>
      <p><b>Description:</b> ${criteria.outcomes || "Not defined yet."}</p>

      <h2>6. Eligible Study Designs (S)</h2>
      <p><b>Description:</b> ${criteria.studyDesigns || "Not defined yet."}</p>

      <h2>7. Language Restrictions</h2>
      <p><b>Description:</b> ${criteria.languageRestrictions || "None specified."}</p>

      <h2>8. Publication Type & Status Threshold</h2>
      <p><b>Description:</b> ${criteria.publicationStatus || "All publications."}</p>

      <h2>STARLITE Searches Compliance Information</h2>
      <table>
        <tr>
          <th>STARLITE Element</th>
          <th>Protocol Compliance Status</th>
        </tr>
        <tr>
          <td><b>S</b>ampling strategy</td>
          <td>Comprehensive, searching standard electronic indices</td>
        </tr>
        <tr>
          <td><b>T</b>ype of studies</td>
          <td>Specifically restricted to: ${criteria.studyDesigns || "Not defined"}</td>
        </tr>
        <tr>
          <td><b>A</b>pproaches</td>
          <td>Database searching, references scanning, the grey literature lookup</td>
        </tr>
        <tr>
          <td><b>R</b>ange of years</td>
          <td>Fully recorded during sifting</td>
        </tr>
        <tr>
          <td><b>L</b>imits</td>
          <td>Language: ${criteria.languageRestrictions || "None"}. Status: ${criteria.publicationStatus || "None"}</td>
        </tr>
        <tr>
          <td><b>I</b>nclusions & Exclusions</td>
          <td>Determined by explicit PICO variables matching</td>
        </tr>
        <tr>
          <td><b>T</b>erms used</td>
          <td>Full combination of MeSH terms and boolean synonyms</td>
        </tr>
        <tr>
          <td><b>E</b>lectronic sources</td>
          <td>Medline (PubMed), Embase, Cochrane CENTRAL, PsycINFO</td>
        </tr>
      </table>
    `;
    exportHtmlToDoc(htmlContent, "Step1_PICOS_Formulation");
  };

  return (
    <div className="space-y-6" id="formulate-step-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Stage 1: Define PICOS Inclusion & Exclusion Criteria
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Formulate your research question following PRISMA reporting guidance and Cochrane guidelines.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadExample}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
          >
            Load Pediatric Diabetes Example
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download Word Step
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Systematic Review Title / Primary Research Question
              </label>
              <input
                type="text"
                name="title"
                value={criteria.title}
                onChange={handleChange}
                placeholder="e.g. Effectiveness of Human Insulin vs. Analogues in Diabetic Patients aged < 18..."
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Population criteria (P)
                </label>
                <textarea
                  name="population"
                  value={criteria.population}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe patient age, clinical disease status, co-morbidities..."
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervention criteria (I)
                </label>
                <textarea
                  name="intervention"
                  value={criteria.intervention}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Dosage schedules, administration route, setting, technical delivery..."
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comparator criteria (C)
                </label>
                <textarea
                  name="comparator"
                  value={criteria.comparator}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Standard treatment, alternative class of drugs, inactive placebo..."
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome measures (O)
                </label>
                <textarea
                  name="outcomes"
                  value={criteria.outcomes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Primary and secondary outcomes, adverse events, quality of life..."
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Designs allowed (S)
              </label>
              <input
                type="text"
                name="studyDesigns"
                value={criteria.studyDesigns}
                onChange={handleChange}
                placeholder="e.g. Randomized Controlled Trials (RCTs); prospective cohort studies..."
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Restrictions
                </label>
                <input
                  type="text"
                  name="languageRestrictions"
                  value={criteria.languageRestrictions}
                  onChange={handleChange}
                  placeholder="e.g., English only vs. any language (Cochrane preference)"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Status criteria
                </label>
                <input
                  type="text"
                  name="publicationStatus"
                  value={criteria.publicationStatus}
                  onChange={handleChange}
                  placeholder="e.g., Peer-reviewed published, preprints, conference abstracts..."
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Guidelines Sider */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              PRISMA & Cochrane Standards
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed space-y-2">
              Before launching a literature index search, the Cochrane Handbook and 
              <strong> PRISMA 2020 Guidelines</strong> instruct that eligibility conditions 
              must be declared <em>a priori</em> in a review protocol to eliminate sifting biases.
            </p>
            <div className="mt-3 p-3 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100">
              <span className="font-semibold block mb-1">Reference Citation:</span>
              "Describe all information sources (e.g., databases with dates of coverage, 
              contact with study authors) in the search and date last searched." <br />
              <em className="block mt-1 font-medium text-gray-600">— PRISMA 2020 (BMJ 2021;372:n71)</em>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-2">
              <Award className="h-4 w-4 text-emerald-600" />
              STARLITE Sifting Checklist
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Maintain full compliance with Booth's STARLITE framework for reporting database sifting:
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
              <li><strong>Sampling strategy:</strong> Selective vs Purposive</li>
              <li><strong>Type of studies:</strong> Narrow designs (RCTs etc)</li>
              <li><strong>Approaches:</strong> Reference indexing, lists</li>
              <li><strong>Limits:</strong> Language, time span limits</li>
              <li><strong>Terms used:</strong> Controlled vocabulary mapping</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
