import React, { useRef, useState } from 'react';
import { Download, FileText, CheckCircle2, ShieldAlert, Sparkles, Printer } from 'lucide-react';
import HealthGauge from '../components/HealthGauge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportView({ repoData }) {
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CodeLens-AI-Report-${repoData.name}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar matching Screen 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>CodeLens AI (PDF Preview)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Generated on: 24 Apr 2026</p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Exporting PDF...' : 'Download PDF'}</span>
        </button>
      </div>

      {/* PDF Document Preview Card (White/Light themed printable document matching Panel 7) */}
      <div 
        ref={reportRef} 
        className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl space-y-8 border border-slate-200"
      >
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-lg">
              &lt;/&gt;
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">CodeLens AI Executive Security Report</h2>
              <p className="text-xs text-slate-500 font-medium">Automated Repository Security & Quality Audit</p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 inline-block">
              VERIFIED REPORT
            </span>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Ref: CL-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
        </div>

        {/* Project Summary & Health Score (Grid matching panel 7 screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
          {/* Project Summary */}
          <div className="md:col-span-6 space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Project Summary</h3>
            <div className="space-y-1.5 pt-1 text-slate-700">
              <p><span className="font-semibold text-slate-900">Repository:</span> {repoData.name}</p>
              <p><span className="font-semibold text-slate-900">URL:</span> <a href={repoData.url} className="text-indigo-600 hover:underline">{repoData.url}</a></p>
              <p><span className="font-semibold text-slate-900">Languages:</span> TypeScript, JavaScript, CSS</p>
              <p><span className="font-semibold text-slate-900">Total Files:</span> {repoData.totalFiles}</p>
              <p><span className="font-semibold text-slate-900">Lines of Code:</span> {repoData.linesOfCode}</p>
            </div>
          </div>

          {/* Health Score Gauge */}
          <div className="md:col-span-3 flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-slate-200 py-4 md:py-0">
            <h3 className="font-bold text-slate-900 text-xs uppercase mb-2">Health Score</h3>
            <div className="relative w-24 h-24 rounded-full border-4 border-indigo-600 flex items-center justify-center font-extrabold text-2xl text-indigo-600 bg-white shadow-sm">
              {repoData.healthScore}
              <span className="text-[10px] text-slate-400 font-normal absolute bottom-3">/100</span>
            </div>
          </div>

          {/* Score Breakdown List */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Score Breakdown</h3>
            <div className="space-y-1 text-slate-700 font-medium">
              <div className="flex justify-between"><span>Code Quality:</span> <span className="font-bold text-emerald-600">{repoData.scoreBreakdown.codeQuality}</span></div>
              <div className="flex justify-between"><span>Security:</span> <span className="font-bold text-amber-600">{repoData.scoreBreakdown.security}</span></div>
              <div className="flex justify-between"><span>Performance:</span> <span className="font-bold text-indigo-600">{repoData.scoreBreakdown.performance}</span></div>
              <div className="flex justify-between"><span>Maintainability:</span> <span className="font-bold text-purple-600">{repoData.scoreBreakdown.maintainability}</span></div>
              <div className="flex justify-between"><span>Testing:</span> <span className="font-bold text-blue-600">{repoData.scoreBreakdown.testing}</span></div>
            </div>
          </div>
        </div>

        {/* Top Issues Summary Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Top Issues</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="p-3">Severity</th>
                  <th className="p-3">Issue</th>
                  <th className="p-3">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                <tr>
                  <td className="p-3"><span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">High</span></td>
                  <td className="p-3 font-semibold text-slate-900">Hardcoded API key</td>
                  <td className="p-3 font-mono text-slate-500">/config/database.ts</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">Medium</span></td>
                  <td className="p-3 font-semibold text-slate-900">Inefficient loop</td>
                  <td className="p-3 font-mono text-slate-500">/lib/dataProcessor.js</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">Medium</span></td>
                  <td className="p-3 font-semibold text-slate-900">Missing error handling</td>
                  <td className="p-3 font-mono text-slate-500">/api/users.ts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-indigo-50/60 border border-indigo-100 p-6 rounded-xl space-y-3">
          <h3 className="font-bold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Recommendations</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {repoData.aiRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>CodeLens AI Security Suite v2.4</span>
          <span>Confidential - For Internal Use Only</span>
        </div>
      </div>
    </div>
  );
}
