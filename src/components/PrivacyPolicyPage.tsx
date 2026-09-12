import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Server, RefreshCw, Mail, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn text-slate-300">
      
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Effective Date: September 12, 2026 &bull; Compliant with GDPR, CCPA & Global Privacy Standards
            </p>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
        <h2 className="text-base font-bold text-indigo-200">Our Privacy Commitment</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          SDETube (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is dedicated to safeguarding the privacy and code telemetry of software engineers using our educational preparation platform. We never sell, rent, or monetize your personal information or code submissions to advertising brokers.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3>1. Categories of Data We Collect</h3>
          </div>
          <p>We collect only the minimum necessary information required to provide educational tools:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong className="text-slate-200">Account Credentials:</strong> Email address, hashed password, or public WebAuthn biometric passkey public keys (private keys never leave your device).</li>
            <li><strong className="text-slate-200">Code Telemetry & Submissions:</strong> Code snippets submitted to our Monaco IDE or WebAssembly SQL arena, test case execution outcomes, and compilation diagnostic reports.</li>
            <li><strong className="text-slate-200">Linked Developer Profiles:</strong> Public usernames for LeetCode, GeeksforGeeks, and GitHub which you explicitly link to synchronize your daily POTD streak.</li>
            <li><strong className="text-slate-200">Local Browser State:</strong> Problem solve status and user theme preferences stored locally in your browser&apos;s <code className="text-indigo-300 font-mono">localStorage</code>.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Lock className="w-4 h-4 text-purple-400" />
            <h3>2. Legal Basis for Data Processing (GDPR Article 6)</h3>
          </div>
          <p>We process your data strictly under the following lawful bases:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong className="text-slate-200">Performance of Contract:</strong> Delivering coding sandboxes, compiling source code, and tracking curriculum progress.</li>
            <li><strong className="text-slate-200">Legitimate Interests:</strong> Preventing denial-of-service attacks, securing our sandbox execution runtimes, and preventing unauthorized scraping.</li>
            <li><strong className="text-slate-200">User Consent:</strong> For voluntary telemetry analytics and cookie preferences, which you may revoke at any time.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3>3. Third-Party Sub-Processors & Infrastructure</h3>
          </div>
          <p>To deliver high-availability distributed services, we partner with industry-leading infrastructure providers under strict Data Processing Agreements (DPAs):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 text-xs">Cloudflare Pages & Workers</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Global edge hosting, DDoS protection, and SSL encryption.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 text-xs">Supabase (PostgreSQL)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Encrypted authentication and user session storage.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 text-xs">Mistral AI</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Contextual coding diagnostic questions and SDE simulations.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 text-xs">Judge0 Execution Sandbox</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Isolated containerized code execution for C++, Java, and Python.</p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3>4. Your Rights Under GDPR & CCPA</h3>
          </div>
          <p>Regardless of your geographic location, you retain full ownership of your data:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong className="text-slate-200">Right of Access:</strong> Request a full export of your profile information and code submissions.</li>
            <li><strong className="text-slate-200">Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request complete deletion of your account and associated database records.</li>
            <li><strong className="text-slate-200">Right to Rectification:</strong> Update or correct your email and linked developer handles directly in the profile settings.</li>
            <li><strong className="text-slate-200">Do Not Sell My Personal Information:</strong> We do not sell personal data under the California Consumer Privacy Act (CCPA).</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Mail className="w-4 h-4 text-pink-400" />
            <h3>5. Contact the Data Protection Officer</h3>
          </div>
          <p>
            For privacy inquiries, data deletion requests, or GDPR rights fulfillment, contact our Data Protection Officer at{' '}
            <a href="mailto:support@sdetube.pages.dev" className="text-indigo-400 hover:underline font-bold">
              support@sdetube.pages.dev
            </a>
            . All requests are responded to within 30 days.
          </p>
        </div>

      </div>
    </div>
  );
};
