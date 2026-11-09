import React from 'react';
import { FileCheck, ShieldAlert } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
          <FileCheck className="w-4 h-4 text-slate-600" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: November 2026 • Terms Version 1.1
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-xs">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the QuickUtility platform, you agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, please discontinue using the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Permitted Use</h2>
          <p>
            QuickUtility provides client-side utility tools for personal and commercial file conversions, calculations, image editing, and document preparation. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Attempt to reverse-engineer, exploit, or disrupt the operation of the web service.</li>
            <li>Use the tools to process unlawful, defamatory, or infringing material.</li>
            <li>Deploy automated bots to overwhelm our application endpoints or scripts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Disclaimer of Warranty and Accuracy</h2>
          <p>
            The services and calculation tools are provided on an "as is" and "as available" basis without warranties of any kind. While our conversion engines strive for high fidelity, complex layouts, corrupted inputs, password protections, and non-standard PDF formats may cause varying outcomes. You are responsible for verifying generated output before critical official submissions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, QuickUtility and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the tools or resulting files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Modifications to the Service</h2>
          <p>
            We reserve the right to modify, improve, or discontinue any utility or feature at any time without prior notice.
          </p>
        </section>
      </div>
    </div>
  );
};
