import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Zap,
  ShieldCheck,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Coins,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  FileCheck,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info
} from 'lucide-react';
import {
  AtsResumeData,
  AtsResumeEducation,
  AtsResumeExperience,
  AtsResumeProject,
  DEFAULT_ATS_RESUME,
  generateAtsResumeWithMistral,
  enhanceBulletWithMistral,
  calculateLiveAtsScore,
  LiveAtsScoreResult,
  ResumeAnalysisResult,
  SAMPLE_JOB_DESCRIPTIONS
} from '../../lib/resumeAnalyzerService';
import {
  canAffordAction,
  deductCredits,
  getUserWallet,
  PRICING_CONFIG
} from '../../lib/billing';

interface AtsResumeCreatorViewProps {
  initialData?: AtsResumeData;
  analysisContext?: ResumeAnalysisResult | null;
}

export const AtsResumeCreatorView: React.FC<AtsResumeCreatorViewProps> = ({
  initialData,
  analysisContext
}) => {
  // 1. Core Resume Data State (defaults to Senior Software Engineer SDE-2)
  const [resumeData, setResumeData] = useState<AtsResumeData>(() => {
    try {
      const saved = localStorage.getItem('edustream_user_ats_resume');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialData || {
      ...DEFAULT_ATS_RESUME,
      targetRole: 'Senior Software Engineer (SDE-2 / Full Stack)'
    };
  });

  // 2. Target Job Description & Alignment States
  const [alignWithJd, setAlignWithJd] = useState<boolean>(true);
  const [customJd, setCustomJd] = useState<string>(() => {
    if (analysisContext?.job_description_preview) return analysisContext.job_description_preview;
    const defaultJd = SAMPLE_JOB_DESCRIPTIONS[0]?.text || '';
    return defaultJd;
  });

  // 3. UI Navigation & Tool States
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education'>('experience');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<'100' | '90' | '80'>('100');
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(() => getUserWallet().balance);

  const previewRef = useRef<HTMLDivElement>(null);

  // Sync wallet balance
  const refreshWallet = () => {
    try {
      const w = getUserWallet();
      setWalletBalance(w.balance);
    } catch {}
  };

  useEffect(() => {
    refreshWallet();
    const handleWalletEvent = () => refreshWallet();
    window.addEventListener('edustream_wallet_updated', handleWalletEvent);
    return () => window.removeEventListener('edustream_wallet_updated', handleWalletEvent);
  }, []);

  // Auto-save to localStorage
  const updateResumeData = (updater: (prev: AtsResumeData) => AtsResumeData) => {
    setResumeData(prev => {
      const updated = updater(prev);
      try {
        localStorage.setItem('edustream_user_ats_resume', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // 4. Real-Time Dynamic ATS Score Calculation (Computed live on every change)
  const liveAts: LiveAtsScoreResult = useMemo(() => {
    return calculateLiveAtsScore(
      resumeData,
      alignWithJd ? customJd : undefined,
      resumeData.targetRole
    );
  }, [resumeData, customJd, alignWithJd]);

  // 5. AI Tailor / Modify Resume with Target Job Description
  const handleAiTailorWithJd = async () => {
    if (alignWithJd && !customJd.trim()) {
      setBillingNotice('Please enter a target Job Description to align and tailor your resume.');
      return;
    }

    const cost = PRICING_CONFIG.AI_RESUME_TAILOR || 1.00;
    if (!canAffordAction(cost)) {
      setBillingNotice(`Insufficient credits. AI resume modification requires ₹${cost.toFixed(2)}. Please top up your wallet.`);
      return;
    }

    setIsGenerating(true);
    setBillingNotice(null);

    try {
      // Deduct usage fee
      deductCredits(
        cost,
        'AI_RESUME_TAILOR',
        `AI Resume Modification tailored to ${resumeData.targetRole}`
      );
      refreshWallet();

      const tailored = await generateAtsResumeWithMistral({
        jobDescription: customJd,
        targetRole: resumeData.targetRole || 'Senior Software Engineer (SDE-2 / Full Stack)',
        baseResumeText: analysisContext?.resume_preview,
        currentProfile: resumeData
      });

      // Preserve existing contact details if present
      const merged: AtsResumeData = {
        ...tailored,
        personalInfo: {
          ...tailored.personalInfo,
          fullName: resumeData.personalInfo?.fullName || tailored.personalInfo.fullName,
          email: resumeData.personalInfo?.email || tailored.personalInfo.email,
          phone: resumeData.personalInfo?.phone || tailored.personalInfo.phone,
          location: resumeData.personalInfo?.location || tailored.personalInfo.location,
          linkedin: resumeData.personalInfo?.linkedin || tailored.personalInfo.linkedin,
          github: resumeData.personalInfo?.github || tailored.personalInfo.github,
          portfolio: resumeData.personalInfo?.portfolio || tailored.personalInfo.portfolio
        },
        targetRole: resumeData.targetRole || tailored.targetRole
      };

      setResumeData(merged);
      try {
        localStorage.setItem('edustream_user_ats_resume', JSON.stringify(merged));
      } catch {}

      setBillingNotice(`✨ Resume successfully tailored with SDETube AI (-₹${cost.toFixed(2)}). You can now edit and customize every section below!`);
      setTimeout(() => setBillingNotice(null), 8000);
    } catch (err: any) {
      console.error('Tailor error:', err);
      setBillingNotice(err?.message || 'Failed to tailor resume with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Enhance single bullet point using Google XYZ Formula
  const handleEnhanceBullet = async (expId: string, bulletIdx: number) => {
    const exp = resumeData.experience.find(e => e.id === expId);
    if (!exp || !exp.bullets[bulletIdx]) return;

    const cost = PRICING_CONFIG.AI_RESUME_BULLET_ENHANCE || 0.20;
    if (!canAffordAction(cost)) {
      setBillingNotice(`Insufficient credits. AI bullet polish requires ₹${cost.toFixed(2)} credits.`);
      return;
    }

    const bulletKey = `${expId}-${bulletIdx}`;
    setEnhancingBulletId(bulletKey);
    setBillingNotice(null);

    try {
      deductCredits(
        cost,
        'AI_RESUME_BULLET_ENHANCE',
        'Google XYZ Resume Bullet Rewrite'
      );
      refreshWallet();

      const enhanced = await enhanceBulletWithMistral(
        exp.bullets[bulletIdx],
        resumeData.targetRole || 'Senior Software Engineer (SDE-2 / Full Stack)'
      );

      updateResumeData(prev => ({
        ...prev,
        experience: prev.experience.map(e => {
          if (e.id !== expId) return e;
          const nextBullets = [...e.bullets];
          nextBullets[bulletIdx] = enhanced;
          return { ...e, bullets: nextBullets };
        })
      }));
    } catch (err) {
      console.error('Bullet polish error:', err);
    } finally {
      setEnhancingBulletId(null);
    }
  };

  // 7. Add New Education Item
  const handleAddEducation = () => {
    const newEdu: AtsResumeEducation = {
      id: `edu-${Date.now()}`,
      degree: 'B.S. in Computer Science & Engineering',
      institution: 'State University / Institute of Technology',
      year: '2018 - 2022',
      location: 'San Jose, CA',
      gpa: '3.8 / 4.0',
      honors: 'Dean\'s Honor List'
    };

    updateResumeData(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }));
    setActiveSection('education');
  };

  // 8. Add New Experience Item
  const handleAddExperience = () => {
    const newExp: AtsResumeExperience = {
      id: `exp-${Date.now()}`,
      title: 'Senior Software Engineer',
      company: 'Enterprise Cloud Technologies',
      location: 'San Francisco, CA / Remote',
      startDate: 'Jan 2023',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected high-throughput microservices using Go and Kafka, handling 50k+ events/sec with sub-30ms p99 latency.',
        'Refactored legacy monolithic services into decoupled containerized services, improving CI/CD deployment frequency by 40%.'
      ]
    };

    updateResumeData(prev => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])]
    }));
    setActiveSection('experience');
  };

  // 9. Add New Project Item
  const handleAddProject = () => {
    const newProj: AtsResumeProject = {
      id: `proj-${Date.now()}`,
      name: 'High-Concurrency Distributed Task Engine',
      technologies: ['TypeScript', 'Go', 'Redis', 'Docker'],
      link: 'github.com/profile/task-engine',
      bullets: [
        'Built real-time distributed scheduler with Redis Pub/Sub handling 10k concurrent task runs with 99.99% uptime.'
      ]
    };

    updateResumeData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }));
    setActiveSection('projects');
  };

  // Print as PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy Plain Text for ATS job portals
  const handleCopyPlainText = () => {
    const p = resumeData.personalInfo;
    let txt = `${p.fullName.toUpperCase()}\n`;
    txt += `${p.location} | ${p.phone} | ${p.email}\n`;
    txt += `${p.linkedin} | ${p.github} | ${p.portfolio}\n\n`;

    txt += `TARGET ROLE: ${resumeData.targetRole}\n\n`;
    txt += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;

    txt += `TECHNICAL SKILLS\n`;
    txt += `- Programming Languages: ${(resumeData.skills?.languages || []).join(', ')}\n`;
    txt += `- Frameworks & Libraries: ${(resumeData.skills?.frameworks || []).join(', ')}\n`;
    txt += `- Cloud & DevOps: ${(resumeData.skills?.cloudDevOps || []).join(', ')}\n`;
    txt += `- Databases & Queues: ${(resumeData.skills?.databases || []).join(', ')}\n`;
    txt += `- Architectures & Methodologies: ${(resumeData.skills?.toolsAndMethods || []).join(', ')}\n\n`;

    txt += `PROFESSIONAL EXPERIENCE\n`;
    (resumeData.experience || []).forEach(exp => {
      txt += `${exp.company} - ${exp.location}\n`;
      txt += `${exp.title} | ${exp.startDate} - ${exp.endDate}\n`;
      (exp.bullets || []).forEach(b => {
        txt += `• ${b}\n`;
      });
      txt += '\n';
    });

    if (resumeData.projects && resumeData.projects.length > 0) {
      txt += `KEY TECHNICAL PROJECTS\n`;
      resumeData.projects.forEach(pr => {
        txt += `${pr.name} (${pr.technologies.join(', ')}) ${pr.link ? `| ${pr.link}` : ''}\n`;
        pr.bullets.forEach(b => { txt += `• ${b}\n`; });
        txt += '\n';
      });
    }

    if (resumeData.education && resumeData.education.length > 0) {
      txt += `EDUCATION\n`;
      resumeData.education.forEach(edu => {
        txt += `${edu.institution} | ${edu.degree} (${edu.year})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}\n`;
      });
    }

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Download Markdown
  const handleDownloadMarkdown = () => {
    handleCopyPlainText();
    const p = resumeData.personalInfo;
    let md = `# ${p.fullName}\n\n`;
    md += `**${resumeData.targetRole}**  \n`;
    md += `${p.location} | [Email](mailto:${p.email}) | ${p.phone} | [LinkedIn](${p.linkedin}) | [GitHub](${p.github})\n\n`;
    md += `## Professional Summary\n${resumeData.summary}\n\n`;
    md += `## Technical Skills\n`;
    md += `- **Languages**: ${(resumeData.skills?.languages || []).join(', ')}\n`;
    md += `- **Frameworks**: ${(resumeData.skills?.frameworks || []).join(', ')}\n`;
    md += `- **Cloud & DevOps**: ${(resumeData.skills?.cloudDevOps || []).join(', ')}\n`;
    md += `- **Databases**: ${(resumeData.skills?.databases || []).join(', ')}\n`;
    md += `- **Tools**: ${(resumeData.skills?.toolsAndMethods || []).join(', ')}\n\n`;
    md += `## Professional Experience\n`;
    (resumeData.experience || []).forEach(exp => {
      md += `### ${exp.title} &mdash; ${exp.company}\n*${exp.location} | ${exp.startDate} - ${exp.endDate}*\n\n`;
      (exp.bullets || []).forEach(b => { md += `- ${b}\n`; });
      md += '\n';
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const el = document.createElement('a');
    el.href = URL.createObjectURL(blob);
    el.download = `${p.fullName.replace(/\s+/g, '_')}_ATS_Resume.md`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  // Preset role helper
  const handleSelectRolePreset = (role: string) => {
    updateResumeData(prev => ({ ...prev, targetRole: role }));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & METRICS BAR (TARGET ROLE + LIVE ATS SCORE + CONTROLS)      */}
      {/* ========================================================================= */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 shadow-2xl space-y-4">
        
        {/* Row 1: Target Role & Live ATS Score Meter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Target Role Editor */}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-[11px] font-mono font-bold text-purple-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>Modifiable Target Role</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Click presets or type custom role below:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={resumeData.targetRole || ''}
                onChange={(e) => updateResumeData(prev => ({ ...prev, targetRole: e.target.value }))}
                placeholder="Target Role (e.g. Senior Software Engineer (SDE-2 / Full Stack))"
                className="w-full max-w-xl px-3.5 py-2 rounded-xl bg-slate-950/90 border border-indigo-500/50 text-sm font-bold text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              />
            </div>

            {/* Quick Role Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Senior Software Engineer (SDE-2 / Full Stack)',
                'SDE-2 Backend Engineer (Distributed Systems / Go)',
                'Senior Frontend Engineer (React / TypeScript)',
                'Full Stack Engineer (Node.js / Cloud / AWS)'
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectRolePreset(role)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    resumeData.targetRole === role
                      ? 'bg-purple-900/80 text-purple-200 border border-purple-600 font-bold'
                      : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Right Metrics: Live Dynamic ATS Score Gauge + Wallet Balance */}
          <div className="flex items-center gap-3 flex-shrink-0 self-start lg:self-center">
            
            {/* Live ATS Score Badge */}
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      liveAts.overallScore >= 85 ? 'text-emerald-400' :
                      liveAts.overallScore >= 70 ? 'text-purple-400' : 'text-amber-400'
                    }
                    strokeDasharray={`${liveAts.overallScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-black text-xs text-slate-100">
                  {liveAts.overallScore}%
                </span>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Live ATS Score
                </div>
                <div className={`text-xs font-bold font-mono ${
                  liveAts.overallScore >= 85 ? 'text-emerald-400' :
                  liveAts.overallScore >= 70 ? 'text-purple-300' : 'text-amber-300'
                }`}>
                  {liveAts.rating}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {liveAts.breakdown.keywordMatch.score}/35 Keywords &bull; {liveAts.breakdown.measurableImpact.score}/25 XYZ
                </div>
              </div>
            </div>

            {/* Wallet Balance Pill */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">Your Credits</div>
                <div className="text-xs font-bold font-mono text-amber-300">
                  ₹{walletBalance.toFixed(2)}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Row 2: Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Single-column FAANG ATS typography &bull; Free instant live preview</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Print PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold font-mono transition-all shadow-md cursor-pointer"
              title="Print clean 1-page/2-page ATS PDF via browser"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print to PDF</span>
            </button>

            {/* Copy Plaintext Button */}
            <button
              onClick={handleCopyPlainText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold font-mono transition-all shadow-md cursor-pointer"
              title="Copy plain text formatted for online job application textareas"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copied ? 'Copied!' : 'Copy Plaintext'}</span>
            </button>

            {/* Download Markdown */}
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-all cursor-pointer"
              title="Export formatted Markdown .md"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export .md</span>
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TARGET JOB DESCRIPTION ALIGNMENT PANEL (CHECKBOX + AI MODIFY BUTTON)   */}
      {/* ========================================================================= */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-slate-900/90 shadow-xl space-y-4">
        
        {/* Toggle Checkbox Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={alignWithJd}
              onChange={(e) => setAlignWithJd(e.target.checked)}
              className="w-5 h-5 rounded-lg border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
            />
            <div>
              <span className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors flex items-center gap-2">
                <span>Target Job Description Alignment</span>
                <span className="px-2 py-0.2 rounded-full bg-purple-950 border border-purple-700/60 text-[10px] font-mono text-purple-300">
                  SDETube AI Engine
                </span>
              </span>
              <p className="text-xs text-slate-400">
                When enabled, SDETube AI modifies your resume against the JD, and calculates your ATS score dynamically with each change.
              </p>
            </div>
          </label>

          {/* Quick preset loader */}
          {alignWithJd && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setCustomJd(SAMPLE_JOB_DESCRIPTIONS[0]?.text || '')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-purple-300 cursor-pointer"
              >
                Load Senior SDE-2 JD
              </button>
            </div>
          )}
        </div>

        {/* Expandable JD Input & AI Tailor Trigger */}
        {alignWithJd && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="relative">
              <textarea
                value={customJd}
                onChange={(e) => setCustomJd(e.target.value)}
                placeholder="Paste the target Job Description here (requirements, responsibilities, tech stack)..."
                className="w-full h-28 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-purple-500"
              />
              <span className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500">
                {customJd.length} chars
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI will rewrite bullets to Google XYZ, align keywords, and show the modified resume for you to edit.</span>
              </div>

              <button
                type="button"
                onClick={handleAiTailorWithJd}
                disabled={isGenerating || !customJd.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>AI Modify & Tailor Resume to JD</span>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-900/80 text-purple-200 text-[10px] font-mono">
                  ₹{PRICING_CONFIG.AI_RESUME_TAILOR?.toFixed(2) || '1.00'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Notice/Alert Banner */}
        {billingNotice && (
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-600/50 text-xs font-mono text-purple-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{billingNotice}</span>
            </div>
            <button onClick={() => setBillingNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. DUAL-PANE WORKSPACE: LEFT EDITOR vs RIGHT REAL PAPER ATS PREVIEW       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ==================== LEFT COLUMN: INTERACTIVE EDITOR ==================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
            {[
              { id: 'personal' as const, label: 'Contact', icon: FileText },
              { id: 'summary' as const, label: 'Summary', icon: Briefcase },
              { id: 'skills' as const, label: 'Skills', icon: Layers },
              { id: 'experience' as const, label: 'Experience', icon: Award, count: (resumeData.experience || []).length },
              { id: 'projects' as const, label: 'Projects', icon: Code2, count: (resumeData.projects || []).length },
              { id: 'education' as const, label: 'Education', icon: GraduationCap, count: (resumeData.education || []).length }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                  {sec.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-purple-800 text-purple-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {sec.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Editor Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-5 max-h-[780px] overflow-y-auto pr-1">
            
            {/* ---------------- 1. PERSONAL INFO ---------------- */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Personal Contact Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.fullName || ''}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">Email Address</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo?.email || ''}
                        onChange={(e) => updateResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.phone || ''}
                        onChange={(e) => updateResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Location (City, State / Remote)</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.location || ''}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">LinkedIn Profile URL</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.linkedin || ''}
                        onChange={(e) => updateResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">GitHub Profile URL</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.github || ''}
                        onChange={(e) => updateResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, github: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 2. PROFESSIONAL SUMMARY ---------------- */}
            {activeSection === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Professional Summary
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {(resumeData.summary || '').length} chars
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Top 3-4 sentences highlighting years of experience, primary technical stack, scale, and high-impact business outcomes.
                </p>

                <textarea
                  value={resumeData.summary || ''}
                  onChange={(e) => updateResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full h-44 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono leading-relaxed resize-none focus:border-purple-500"
                />
              </div>
            )}

            {/* ---------------- 3. CORE TECHNICAL SKILLS ---------------- */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Categorized Technical Skills Matrix
                </h3>

                {[
                  { key: 'languages' as const, label: 'Programming Languages' },
                  { key: 'frameworks' as const, label: 'Frameworks & Libraries' },
                  { key: 'cloudDevOps' as const, label: 'Cloud & DevOps (Infra)' },
                  { key: 'databases' as const, label: 'Databases & Message Queues' },
                  { key: 'toolsAndMethods' as const, label: 'Architectures & Methodologies' }
                ].map(item => (
                  <div key={item.key} className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-400 font-bold">
                      {item.label}
                    </label>
                    <input
                      type="text"
                      value={(resumeData.skills?.[item.key] || []).join(', ')}
                      onChange={(e) => {
                        const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateResumeData(prev => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            [item.key]: vals
                          }
                        }));
                      }}
                      placeholder="Comma-separated items (e.g. TypeScript, React, Go)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ---------------- 4. WORK EXPERIENCE ---------------- */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Professional Experience ({resumeData.experience?.length || 0})
                  </h3>
                  <button
                    onClick={handleAddExperience}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-xs font-mono text-purple-300 font-bold hover:bg-purple-900 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {(resumeData.experience || []).map((exp) => (
                    <div key={exp.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      
                      {/* Company & Role Header */}
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item)
                          }))}
                          placeholder="Company Name"
                          className="font-bold text-xs text-slate-100 bg-transparent border-b border-slate-800 focus:border-purple-500 font-mono flex-1 mr-2"
                        />
                        <button
                          onClick={() => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.filter(item => item.id !== exp.id)
                          }))}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Delete role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, title: e.target.value } : item)
                          }))}
                          placeholder="Job Title"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, location: e.target.value } : item)
                          }))}
                          placeholder="Location (e.g. San Francisco, CA)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, startDate: e.target.value } : item)
                          }))}
                          placeholder="Start Date"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, endDate: e.target.value } : item)
                          }))}
                          placeholder="End Date (or Present)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>

                      {/* Bullets List */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono text-purple-300 font-bold">
                            Accomplishment Bullets ({exp.bullets?.length || 0})
                          </label>
                          <button
                            onClick={() => updateResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, bullets: [...item.bullets, 'Accomplished [X], as measured by [Y], by doing [Z].'] } : item)
                            }))}
                            className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bullet</span>
                          </button>
                        </div>

                        {exp.bullets?.map((bullet, bIdx) => {
                          const isEnhancing = enhancingBulletId === `${exp.id}-${bIdx}`;

                          return (
                            <div key={bIdx} className="space-y-1">
                              <div className="flex items-start gap-2">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateResumeData(prev => ({
                                      ...prev,
                                      experience: prev.experience.map(item => {
                                        if (item.id !== exp.id) return item;
                                        const newB = [...item.bullets];
                                        newB[bIdx] = val;
                                        return { ...item, bullets: newB };
                                      })
                                    }));
                                  }}
                                  className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed h-18 resize-none focus:border-purple-500"
                                />

                                <div className="flex flex-col gap-1">
                                  {/* AI Polish Button */}
                                  <button
                                    onClick={() => handleEnhanceBullet(exp.id, bIdx)}
                                    disabled={isEnhancing}
                                    className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 hover:bg-purple-900 cursor-pointer disabled:opacity-50 relative group"
                                    title="AI Polish bullet to Google XYZ formula (₹0.20)"
                                  >
                                    <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin text-amber-300' : 'text-amber-400'}`} />
                                    <span className="absolute -top-7 right-0 hidden group-hover:block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-300 whitespace-nowrap z-20">
                                      Polish (₹0.20)
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      updateResumeData(prev => ({
                                        ...prev,
                                        experience: prev.experience.map(item => {
                                          if (item.id !== exp.id) return item;
                                          return {
                                            ...item,
                                            bullets: item.bullets.filter((_, idx) => idx !== bIdx)
                                          };
                                        })
                                      }));
                                    }}
                                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- 5. TECHNICAL PROJECTS ---------------- */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Key Technical Projects
                  </h3>
                  <button
                    onClick={handleAddProject}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-xs font-mono text-purple-300 font-bold hover:bg-purple-900 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(resumeData.projects || []).map((proj) => (
                    <div key={proj.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === proj.id ? { ...p, name: e.target.value } : p)
                          }))}
                          placeholder="Project Name"
                          className="font-bold text-xs text-slate-100 bg-transparent border-b border-slate-800 focus:border-purple-500 font-mono flex-1 mr-2"
                        />
                        <button
                          onClick={() => updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.filter(p => p.id !== proj.id)
                          }))}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.technologies?.join(', ')}
                          onChange={(e) => {
                            const techs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, technologies: techs } : p)
                            }));
                          }}
                          placeholder="Technologies (comma-separated)"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                        />
                        <input
                          type="text"
                          value={proj.link || ''}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === proj.id ? { ...p, link: e.target.value } : p)
                          }))}
                          placeholder="Link / GitHub URL"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                        />
                      </div>

                      <textarea
                        value={proj.bullets[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === proj.id ? { ...p, bullets: [val] } : p)
                          }));
                        }}
                        placeholder="Project accomplishments, scale, metrics..."
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono h-16 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- 6. EDUCATION & CERTIFICATIONS (WITH ADD EDUCATION) ---------------- */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Education & Degrees
                  </h3>
                  <button
                    onClick={handleAddEducation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-xs font-mono text-purple-300 font-bold hover:bg-purple-900 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(resumeData.education || []).map((edu) => (
                    <div key={edu.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item)
                          }))}
                          placeholder="Degree (e.g. B.Tech / B.S. in Computer Science)"
                          className="font-bold text-xs text-slate-100 bg-transparent border-b border-slate-800 focus:border-purple-500 font-mono flex-1 mr-2"
                        />
                        <button
                          onClick={() => updateResumeData(prev => ({
                            ...prev,
                            education: prev.education.filter(item => item.id !== edu.id)
                          }))}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Delete education"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, institution: e.target.value } : item)
                          }))}
                          placeholder="Institution / University Name"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, year: e.target.value } : item)
                          }))}
                          placeholder="Graduation Year (e.g. 2018 - 2022)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.location || ''}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, location: e.target.value } : item)
                          }))}
                          placeholder="Location (e.g. San Jose, CA)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                        />
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, gpa: e.target.value } : item)
                          }))}
                          placeholder="GPA / Honors (e.g. 3.8 / 4.0)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                        />
                      </div>

                    </div>
                  ))}
                </div>

                {/* Certifications Block */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <label className="text-[11px] font-mono text-purple-300 font-bold">
                    Certifications & Professional Licenses
                  </label>
                  <input
                    type="text"
                    value={(resumeData.certifications || []).join(', ')}
                    onChange={(e) => {
                      const certs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateResumeData(prev => ({ ...prev, certifications: certs }));
                    }}
                    placeholder="Certifications (e.g. AWS Solutions Architect, CKAD)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ==================== RIGHT COLUMN: REAL PAPER ATS PREVIEW ==================== */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Zoom and Document Controls Toolbar */}
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-mono text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Machine ATS Document Preview</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewZoom('100')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${previewZoom === '100' ? 'bg-purple-900 text-purple-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom('90')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${previewZoom === '90' ? 'bg-purple-900 text-purple-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                90%
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom('80')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${previewZoom === '80' ? 'bg-purple-900 text-purple-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Fit
              </button>
            </div>
          </div>

          {/* Paper Sheet Wrapper */}
          <div className="overflow-x-auto p-2 sm:p-4 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-2xl flex justify-center">
            
            <div
              ref={previewRef}
              id="ats-resume-paper-document"
              style={{
                transform: previewZoom === '90' ? 'scale(0.92)' : previewZoom === '80' ? 'scale(0.85)' : 'none',
                transformOrigin: 'top center'
              }}
              className="w-full max-w-[820px] min-h-[1050px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-xl space-y-4 font-sans border border-slate-200/80 transition-all select-text"
            >
              
              {/* Header / Contact Row */}
              <div className="text-center space-y-1 pb-2 border-b border-slate-300">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                  {resumeData.personalInfo?.fullName || 'ALEX RIVERA'}
                </h1>
                
                <div className="text-xs font-bold text-slate-800 tracking-wide font-mono">
                  {resumeData.targetRole || 'Senior Software Engineer (SDE-2 / Full Stack)'}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-2 text-[11px] text-slate-600 font-mono pt-0.5">
                  <span>{resumeData.personalInfo?.location || 'San Francisco, CA / Remote'}</span>
                  <span>&bull;</span>
                  <span>{resumeData.personalInfo?.phone || '+1 (555) 234-5678'}</span>
                  <span>&bull;</span>
                  <span>{resumeData.personalInfo?.email || 'alex.rivera@example.com'}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-3 text-[11px] text-slate-600 font-mono">
                  {resumeData.personalInfo?.linkedin && (
                    <span>{resumeData.personalInfo.linkedin}</span>
                  )}
                  {resumeData.personalInfo?.github && (
                    <>
                      <span>&bull;</span>
                      <span>{resumeData.personalInfo.github}</span>
                    </>
                  )}
                  {resumeData.personalInfo?.portfolio && (
                    <>
                      <span>&bull;</span>
                      <span>{resumeData.personalInfo.portfolio}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {resumeData.summary && (
                <div className="space-y-1 pt-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 font-mono">
                    Professional Summary
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-800 text-justify pt-0.5">
                    {resumeData.summary}
                  </p>
                </div>
              )}

              {/* Core Technical Skills */}
              <div className="space-y-1 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 font-mono">
                  Technical Skills
                </h2>
                
                <div className="text-xs space-y-0.5 pt-1 text-slate-800">
                  {resumeData.skills?.languages?.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-950 font-mono text-[11px]">Languages: </span>
                      <span>{resumeData.skills.languages.join(', ')}</span>
                    </div>
                  )}
                  {resumeData.skills?.frameworks?.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-950 font-mono text-[11px]">Frameworks & Libraries: </span>
                      <span>{resumeData.skills.frameworks.join(', ')}</span>
                    </div>
                  )}
                  {resumeData.skills?.cloudDevOps?.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-950 font-mono text-[11px]">Cloud & DevOps: </span>
                      <span>{resumeData.skills.cloudDevOps.join(', ')}</span>
                    </div>
                  )}
                  {resumeData.skills?.databases?.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-950 font-mono text-[11px]">Databases & Streaming: </span>
                      <span>{resumeData.skills.databases.join(', ')}</span>
                    </div>
                  )}
                  {resumeData.skills?.toolsAndMethods?.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-950 font-mono text-[11px]">Methodologies & Tools: </span>
                      <span>{resumeData.skills.toolsAndMethods.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Experience */}
              {(resumeData.experience || []).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 font-mono">
                    Professional Experience
                  </h2>

                  <div className="space-y-3 pt-1">
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-950 text-[13px]">{exp.company}</span>
                            <span className="text-slate-700 italic"> &mdash; {exp.title}</span>
                          </div>
                          <div className="text-slate-600 font-medium text-[11px] sm:text-right">
                            {exp.location ? `${exp.location} | ` : ''}{exp.startDate} – {exp.endDate}
                          </div>
                        </div>

                        <ul className="list-disc list-outside pl-4 text-xs text-slate-800 space-y-1">
                          {exp.bullets?.map((b, i) => (
                            <li key={i} className="leading-relaxed">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Technical Projects */}
              {(resumeData.projects || []).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 font-mono">
                    Key Projects & Systems
                  </h2>

                  <div className="space-y-2.5 pt-1">
                    {resumeData.projects.map((proj) => (
                      <div key={proj.id} className="space-y-0.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-950 text-[13px]">{proj.name}</span>
                            {proj.technologies?.length > 0 && (
                              <span className="text-slate-600 italic"> ({proj.technologies.join(', ')})</span>
                            )}
                          </div>
                          {proj.link && (
                            <span className="text-[11px] text-slate-600 font-mono">{proj.link}</span>
                          )}
                        </div>
                        <ul className="list-disc list-outside pl-4 text-xs text-slate-800 space-y-0.5">
                          {proj.bullets?.map((b, i) => (
                            <li key={i} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education (Dynamic & Addable) */}
              {(resumeData.education || []).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 font-mono">
                    Education
                  </h2>

                  <div className="space-y-2 pt-1">
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="text-xs">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-bold text-slate-950 text-[13px]">{edu.institution}</span>
                            {edu.location && <span className="text-slate-600"> &mdash; {edu.location}</span>}
                          </div>
                          <span className="text-slate-600 font-medium text-[11px]">{edu.year}</span>
                        </div>
                        <div className="flex items-baseline justify-between text-slate-800">
                          <span className="italic">{edu.degree}</span>
                          {(edu.gpa || edu.honors) && (
                            <span className="text-[11px] text-slate-600">
                              {[edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors].filter(Boolean).join(' | ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {(resumeData.certifications || []).length > 0 && (
                <div className="space-y-1 pt-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 font-mono">
                    Certifications & Honors
                  </h2>
                  <div className="text-xs text-slate-800 pt-0.5 flex flex-wrap gap-x-4">
                    {resumeData.certifications.map((c, i) => (
                      <span key={i}>&bull; {c}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
