import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Transparent Data Practices</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: November 2026 • Policy Version 1.2
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-xs">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-900">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-950 font-bold text-sm">Key Commitment:</strong>
            QuickUtility processes your uploaded files (PDFs, DOCX files, photos, and resumes) exclusively in your device’s local browser memory. No files are uploaded to our servers or stored on remote databases.
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Do Not Collect</h2>
          <p>
            When you use QuickUtility to convert, compress, resize, or merge documents, the entire computation executes on your client device using WebAssembly, HTML Canvas, and JavaScript file APIs. We do not:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Transmit your uploaded documents or photos over the Internet to our backend.</li>
            <li>Store or archive copies of your files on any cloud storage or database.</li>
            <li>Read, analyze, or mine the contents or text of your documents.</li>
            <li>Require user account registration, email sign-ups, or login credentials.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Optional AI Features</h2>
          <p>
            In the Resume Builder tool, users may optionally trigger AI assistance (e.g., polishing a resume bullet or drafting a cover letter). When activated by the user, only the specific snippet of text in that field is sent securely via HTTPS to our server-side Gemini API proxy to generate suggested wording. The AI API key is maintained securely on the server and is never exposed in browser bundles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Cookies and Local Storage</h2>
          <p>
            QuickUtility does not use invasive tracking cookies. We utilize standard browser <code>localStorage</code> solely to save your resume draft on your own computer so your work is preserved across browser refreshes. You can clear this at any time by clearing your browser cache.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Third-Party Advertising and Analytics</h2>
          <p>
            In the future, the website owner may enable Google AdSense banner placeholders. Third-party advertising networks, including Google, may use cookies to serve ads based on prior visits to this or other websites. Users may opt out of personalized advertising by visiting Google Ad Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Contact and Site Owner Inquiries</h2>
          <p>
            If you have questions regarding this Privacy Policy or your data rights, please contact the site administration team via our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
