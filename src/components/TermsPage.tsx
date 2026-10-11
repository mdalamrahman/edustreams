import React from 'react';
import { FileText, ShieldAlert, Code, CreditCard, Scale, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TermsPageProps {
  onBackToHome?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToHome }) => {
  const navigate = useNavigate();
  const handleBack = onBackToHome || (() => (window.history.length > 1 ? window.history.back() : navigate('/')));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn text-slate-300">
      
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <button
          onClick={handleBack}

          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Terms and Conditions of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Last Updated: September 12, 2026 &bull; SDETube Open Learning Initiative
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <h3>1. Acceptance of Terms</h3>
          </div>
          <p>
            By accessing or using the SDETube platform (&ldquo;Service&rdquo;), located at <code className="text-indigo-300 font-mono">sdetube.pages.dev</code>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our coding sandboxes or curriculum resources.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Code className="w-4 h-4 text-purple-400" />
            <h3>2. Code Sandbox Acceptable Use Policy (AUP)</h3>
          </div>
          <p>
            SDETube provides in-browser WebAssembly runtimes and remote SDETube compiler sandboxes for educational code execution in C++, Java, Python, and SQL. You expressly agree NOT to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
            <li>Execute automated denial-of-service scripts, fork bombs, or infinite memory allocation loops.</li>
            <li>Use the code execution environments for cryptocurrency mining or distributed scraping bots.</li>
            <li>Attempt to break container isolation, probe network interfaces, or access underlying system hosts.</li>
            <li>Submit malicious exploits, trojans, or spyware through submitted solution files.</li>
          </ul>
          <p className="text-rose-400 font-medium pt-1">
            Violations of this policy will result in immediate termination of account access and IP blacklisting.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3>3. Intellectual Property Rights</h3>
          </div>
          <p>
            <strong className="text-slate-100">Your Code Submissions:</strong> You retain full intellectual property rights and ownership over code algorithms and solutions you draft inside the editor.
          </p>
          <p>
            <strong className="text-slate-100">Curricula & Educational Content:</strong> Curated problem sets, LLD visual diagrams, and platform UI assets are protected by copyright and open educational licenses. Video lectures syndicated via channels remain the property of their respective creators and educators.
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3>4. Virtual Credits, Wallet Passes & Billing</h3>
          </div>
          <p>
            SDETube utilizes a pay-as-you-go micro-credit wallet (e.g., &inr;2.00 first-time lecture unlocks with 24-hour pass extensions). Credits purchased are non-transferable and intended solely for platform access. If you experience an accidental charge or technical failure during pass unlocking, contact support within 7 days for wallet credit restoration.
          </p>
        </div>

        {/* Section 5 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3>5. Disclaimer of Warranties & Limitation of Liability</h3>
          </div>
          <p>
            The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. SDETube does not guarantee that code execution runtimes will be 100% error-free or uninterrupted, or that completion of curricula guarantees employment offers at specific corporations.
          </p>
        </div>

        {/* Section 6 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-slate-100 font-bold text-sm sm:text-base">6. Governing Law & Contact</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India. Any questions regarding these terms can be directed to{' '}
            <a href="mailto:support@sdetube.pages.dev" className="text-indigo-400 hover:underline font-bold">
              support@sdetube.pages.dev
            </a>
            .
          </p>
        </div>

      </div>
    </div>
  );
};
