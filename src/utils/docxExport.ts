/**
 * Helper utility to export rich HTML content into a Microsoft Word compatible document (.doc)
 * HTML is natively parsed and formatted by MS Word, including tables, lists, colors, and headers.
 */
export function exportHtmlToDoc(htmlContent: string, fileName: string) {
  const cssStyles = `
    <style>
      body {
        font-family: "Arial", "Helvetica", sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #333333;
      }
      h1 {
        font-size: 18pt;
        color: #1a365d;
        border-bottom: 2px solid #2b6cb0;
        padding-bottom: 4px;
        margin-top: 24px;
        margin-bottom: 12px;
      }
      h2 {
        font-size: 14pt;
        color: #2c5282;
        margin-top: 18px;
        margin-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 2px;
      }
      h3 {
        font-size: 12pt;
        color: #4a5568;
        margin-top: 12px;
        margin-bottom: 6px;
      }
      p {
        margin: 0 0 10px 0;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 16px;
      }
      th {
        background-color: #ebf8ff;
        color: #2c5282;
        border: 1px solid #cbd5e0;
        padding: 8px;
        font-weight: bold;
        text-align: left;
      }
      td {
        border: 1px solid #e2e8f0;
        padding: 8px;
        vertical-align: top;
      }
      ul, ol {
        margin: 0 0 16px 20px;
        padding: 0;
      }
      li {
        margin-bottom: 4px;
      }
      .badge-eligible {
        background-color: #c6f6d5;
        color: #22543d;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .badge-excluded {
        background-color: #fed7d7;
        color: #742a2a;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .badge-unclear {
        background-color: #feebc8;
        color: #744210;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .reference-item {
        margin-left: 20px;
        text-indent: -20px;
        margin-bottom: 8px;
        font-size: 10pt;
      }
      .footer-note {
        font-size: 9pt;
        color: #718096;
        margin-top: 40px;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
      }
    </style>
  `;

  const fullHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        ${cssStyles}
      </head>
      <body>
        ${htmlContent}
        <div class="footer-note">
          <p>Generated automatically by Systematic Review Editor & PRISMA Assistant on ${new Date().toLocaleDateString()}. Follows PRISMA Reporting Standards.</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + fullHtml], {
    type: "application/msword;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.href = url;
  element.download = fileName.endsWith(".doc") ? fileName : `${fileName}.doc`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}
