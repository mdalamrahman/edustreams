import React, { useState, useRef } from 'react';
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
  ChevronUp
} from 'lucide-react';
import {
  AtsResumeData,
  DEFAULT_ATS_RESUME,
  generateAtsResumeWithMistral,
  enhanceBulletWithMistral,
  ResumeAnalysisResult
} from '../../lib/resumeAnalyzerService';

interface AtsResumeCreatorViewProps {
  initialData?: AtsResumeData;
  analysisContext?: ResumeAnalysisResult | null;
}

export const AtsResumeCreatorView: React.FC<AtsResumeCreatorViewProps> = ({
  initialData,
  analysisContext
}) => {
  const [resumeData, setResumeData] = useState<AtsResumeData>(() => {
    try {
      const saved = localStorage.getItem('edustream_user_ats_resume');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialData || DEFAULT_ATS_RESUME;
  });

  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education'>('experience');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [customJd, setCustomJd] = useState<string>(analysisContext?.job_description_preview || '');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement>(null);

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

  // 1-Click AI Full Generation from Target JD
  const handleAiGenerateResume = async () => {
    if (!customJd.trim()) {
      alert('Please provide a target Job Description to tailor the resume.');
      return;
    }
    setIsGenerating(true);
    setShowAiModal(false);
    try {
      const generated = await generateAtsResumeWithMistral({
        jobDescription: customJd,
        targetRole: resumeData.targetRole,
        baseResumeText: analysisContext?.resume_preview,
        currentProfile: resumeData
      });
      setResumeData(generated);
      try {
        localStorage.setItem('edustream_user_ats_resume', JSON.stringify(generated));
      } catch {}
    } catch (err) {
      console.error('Failed to generate ATS resume:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhance a single bullet point
  const handleEnhanceBullet = async (expId: string, bulletIdx: number) => {
    const exp = resumeData.experience.find(e => e.id === expId);
    if (!exp || !exp.bullets[bulletIdx]) return;

    const bulletKey = `${expId}-${bulletIdx}`;
    setEnhancingBulletId(bulletKey);

    try {
      const enhanced = await enhanceBulletWithMistral(exp.bullets[bulletIdx], resumeData.targetRole);
      updateResumeData(prev => ({
        ...prev,
        experience: prev.experience.map(e => {
          if (e.id !== expId) return e;
          const nextBullets = [...e.bullets];
          nextBullets[bulletIdx] = enhanced;
          return { ...e, bullets: nextBullets };
        })
      }));
    } finally {
      setEnhancingBulletId(null);
    }
  };

  // Print as PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy Plain Text for ATS job applications
  const handleCopyPlainText = () => {
    const p = resumeData.personalInfo;
    let txt = `${p.fullName.toUpperCase()}\n`;
    txt += `${p.location} | ${p.phone} | ${p.email}\n`;
    txt += `${p.linkedin} | ${p.github} | ${p.portfolio}\n\n`;

    txt += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;

    txt += `TECHNICAL SKILLS\n`;
    txt += `- Languages: ${resumeData.skills.languages.join(', ')}\n`;
    txt += `- Frameworks & Libraries: ${resumeData.skills.frameworks.join(', ')}\n`;
    txt += `- Cloud & DevOps: ${resumeData.skills.cloudDevOps.join(', ')}\n`;
    txt += `- Databases & Queues: ${resumeData.skills.databases.join(', ')}\n`;
    txt += `- Tools & Methodologies: ${resumeData.skills.toolsAndMethods.join(', ')}\n\n`;

    txt += `PROFESSIONAL EXPERIENCE\n`;
    resumeData.experience.forEach(exp => {
      txt += `${exp.company} - ${exp.location}\n`;
      txt += `${exp.title} | ${exp.startDate} - ${exp.endDate}\n`;
      exp.bullets.forEach(b => {
        txt += `• ${b}\n`;
      });
      txt += '\n';
    });

    if (resumeData.projects && resumeData.projects.length > 0) {
      txt += `FLAGSHIP PROJECTS\n`;
      resumeData.projects.forEach(proj => {
        txt += `${proj.name} (${proj.technologies.join(', ')}) ${proj.link ? `| ${proj.link}` : ''}\n`;
        proj.bullets.forEach(b => {
          txt += `• ${b}\n`;
        });
        txt += '\n';
      });
    }

    txt += `EDUCATION\n`;
    resumeData.education.forEach(edu => {
      txt += `${edu.institution} | ${edu.degree} (${edu.year})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}\n`;
    });

    if (resumeData.certifications && resumeData.certifications.length > 0) {
      txt += `\nCERTIFICATIONS & AWARDS\n`;
      resumeData.certifications.forEach(cert => {
        txt += `• ${cert}\n`;
      });
    }

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Plain Text
  const handleDownloadTxt = () => {
    handleCopyPlainText();
    const element = document.createElement('a');
    const file = new Blob([navigator.clipboard ? '' : ''], { type: 'text/plain' });
    // create text content
    const p = resumeData.personalInfo;
    let txt = `${p.fullName.toUpperCase()}\n${p.location} | ${p.phone} | ${p.email}\n${p.linkedin} | ${p.github}\n\nPROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    txt += `SKILLS\n${Object.entries(resumeData.skills).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')}\n\n`;
    txt += `EXPERIENCE\n`;
    resumeData.experience.forEach(exp => {
      txt += `${exp.company} - ${exp.title} (${exp.startDate} - ${exp.endDate})\n`;
      exp.bullets.forEach(b => { txt += `• ${b}\n`; });
      txt += '\n';
    });
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(blob);
    element.download = `${p.fullName.replace(/\s+/g, '_')}_ATS_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Keyword counter
  const allSkills = [
    ...resumeData.skills.languages,
    ...resumeData.skills.frameworks,
    ...resumeData.skills.cloudDevOps,
    ...resumeData.skills.databases,
    ...resumeData.skills.toolsAndMethods
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. TOP ACTION & METRICS BAR */}
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 font-mono text-xs font-bold text-indigo-300 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>100% ATS Compliant Generator</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Target: {resumeData.targetRole}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100">
            ATS Resume Builder & Formatter
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Single-column, machine-parseable typography formatted according to Google & FAANG bar-raiser standards.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          
          {/* AI Tailor Modal Trigger */}
          <button
            onClick={() => setShowAiModal(true)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>AI Tailor to Job Description</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold font-mono transition-all shadow-md cursor-pointer"
            title="Print clean ATS PDF via browser"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print PDF</span>
          </button>

          {/* Copy Plaintext Button */}
          <button
            onClick={handleCopyPlainText}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold font-mono transition-all shadow-md cursor-pointer"
            title="Copy plain text formatted for job application forms"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          {/* Download Text */}
          <button
            onClick={handleDownloadTxt}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Download .txt"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. DUAL-PANE WORKSPACE: LEFT EDITOR vs RIGHT ATS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ==================== LEFT PANE: INTERACTIVE RESUME EDITOR ==================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            {[
              { id: 'personal' as const, label: 'Contact', icon: FileText },
              { id: 'summary' as const, label: 'Summary', icon: Briefcase },
              { id: 'skills' as const, label: 'Skills', icon: Layers },
              { id: 'experience' as const, label: 'Experience', icon: Award },
              { id: 'projects' as const, label: 'Projects', icon: Code2 },
              { id: 'education' as const, label: 'Education', icon: GraduationCap }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Editor Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4 max-h-[680px] overflow-y-auto pr-1">
            
            {/* 1. PERSONAL CONTACT INFO */}
            {activeSection === 'personal' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Personal Details & Header
                </h3>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updateResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Email Address</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Phone</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-400">Location (City, State / Remote)</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updateResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">LinkedIn URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">GitHub URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, github: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-400">Target Role Title</label>
                  <input
                    type="text"
                    value={resumeData.targetRole}
                    onChange={(e) => updateResumeData(prev => ({
                      ...prev,
                      targetRole: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL SUMMARY */}
            {activeSection === 'summary' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Professional Summary
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {resumeData.summary.length} chars
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ATS parsers score candidates heavily on matching skills found in the top 3-4 summary sentences.
                </p>

                <textarea
                  value={resumeData.summary}
                  onChange={(e) => updateResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full h-44 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono leading-relaxed resize-none focus:border-purple-500"
                />
              </div>
            )}

            {/* 3. CORE TECHNICAL SKILLS */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Categorized Skills Matrix
                </h3>

                {[
                  { key: 'languages' as const, label: 'Programming Languages' },
                  { key: 'frameworks' as const, label: 'Frameworks & Frontend' },
                  { key: 'cloudDevOps' as const, label: 'Cloud & Infrastructure (DevOps)' },
                  { key: 'databases' as const, label: 'Databases & Message Queues' },
                  { key: 'toolsAndMethods' as const, label: 'Architectures & Tools' }
                ].map(item => (
                  <div key={item.key} className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-400 font-bold">
                      {item.label}
                    </label>
                    <input
                      type="text"
                      value={resumeData.skills[item.key].join(', ')}
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 4. WORK EXPERIENCE WITH AI BULLET ENHANCER */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Work Experience ({resumeData.experience.length})
                  </h3>
                  <button
                    onClick={() => {
                      const newExp = {
                        id: `exp-${Date.now()}`,
                        title: 'Software Engineer',
                        company: 'Company Name',
                        location: 'Location',
                        startDate: '2023',
                        endDate: 'Present',
                        current: true,
                        bullets: ['Architected scalable backend service reducing API latency by 35%.']
                      };
                      updateResumeData(prev => ({ ...prev, experience: [newExp, ...prev.experience] }));
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800 text-[11px] font-mono text-purple-300 font-bold hover:bg-purple-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {resumeData.experience.map((exp, expIdx) => (
                    <div key={exp.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          Role #{expIdx + 1}
                        </span>
                        <button
                          onClick={() => {
                            updateResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.filter(e => e.id !== exp.id)
                            }));
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Remove experience block"
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
                          value={exp.company}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item)
                          }))}
                          placeholder="Company"
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
                          placeholder="End Date (e.g. Present)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>

                      {/* Bullets with AI Enhancer button */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Accomplishment Bullets (Google XYZ)</span>
                          <button
                            onClick={() => {
                              updateResumeData(prev => ({
                                ...prev,
                                experience: prev.experience.map(item => item.id === exp.id ? {
                                  ...item,
                                  bullets: [...item.bullets, 'Engineered high-throughput service reducing system latency by 25%.']
                                } : item)
                              }));
                            }}
                            className="text-purple-400 hover:text-purple-300 cursor-pointer"
                          >
                            + Add Bullet
                          </button>
                        </div>

                        {exp.bullets.map((bullet, bIdx) => {
                          const isEnhancing = enhancingBulletId === `${exp.id}-${bIdx}`;
                          return (
                            <div key={bIdx} className="space-y-1">
                              <div className="flex items-start gap-1.5">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateResumeData(prev => ({
                                      ...prev,
                                      experience: prev.experience.map(item => {
                                        if (item.id !== exp.id) return item;
                                        const nextB = [...item.bullets];
                                        nextB[bIdx] = val;
                                        return { ...item, bullets: nextB };
                                      })
                                    }));
                                  }}
                                  className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono leading-relaxed resize-none h-18"
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleEnhanceBullet(exp.id, bIdx)}
                                    disabled={isEnhancing}
                                    className="p-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 hover:bg-purple-900 cursor-pointer disabled:opacity-50"
                                    title="AI Polish this bullet using Google XYZ formula"
                                  >
                                    <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin text-amber-300' : ''}`} />
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
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer"
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

            {/* 5. PROJECTS */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    Flagship Technical Projects
                  </h3>
                  <button
                    onClick={() => {
                      const newProj = {
                        id: `proj-${Date.now()}`,
                        name: 'Distributed System Project',
                        technologies: ['TypeScript', 'Go', 'Redis'],
                        link: 'github.com/profile/repo',
                        bullets: ['Architected scalable data pipeline handling 50k events per minute.']
                      };
                      updateResumeData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800 text-[11px] font-mono text-purple-300 font-bold hover:bg-purple-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === proj.id ? { ...p, name: e.target.value } : p)
                          }))}
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

                      <input
                        type="text"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => {
                          const techs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === proj.id ? { ...p, technologies: techs } : p)
                          }));
                        }}
                        placeholder="Technologies (comma-separated)"
                        className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                      />

                      <textarea
                        value={proj.bullets[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === proj.id ? { ...p, bullets: [val] } : p)
                          }));
                        }}
                        placeholder="Project accomplishments and scale..."
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono h-16 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. EDUCATION & CERTIFICATIONS */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Education & Certifications
                </h3>

                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateResumeData(prev => ({
                        ...prev,
                        education: prev.education.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item)
                      }))}
                      placeholder="Degree"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateResumeData(prev => ({
                          ...prev,
                          education: prev.education.map(item => item.id === edu.id ? { ...item, institution: e.target.value } : item)
                        }))}
                        placeholder="Institution"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateResumeData(prev => ({
                          ...prev,
                          education: prev.education.map(item => item.id === edu.id ? { ...item, year: e.target.value } : item)
                        }))}
                        placeholder="Graduation Year"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                ))}

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-[11px] font-mono text-slate-400 font-bold">
                    Certifications (One per line)
                  </label>
                  <textarea
                    value={resumeData.certifications.join('\n')}
                    onChange={(e) => {
                      const certs = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                      updateResumeData(prev => ({ ...prev, certifications: certs }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono h-20 resize-none"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ==================== RIGHT PANE: REAL-TIME ATS DOCUMENT PREVIEW ==================== */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex items-center justify-between text-xs font-mono px-2 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live ATS Document Rendering (Print-Optimized)</span>
            </span>
            <span className="text-purple-300 font-bold">
              {allSkills.length} Keywords Embedded
            </span>
          </div>

          {/* Printable White Resume Container */}
          <div
            id="ats-printable-resume"
            ref={previewRef}
            className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 font-sans leading-relaxed selection:bg-indigo-100"
            style={{
              fontFamily: '"Inter", "Segoe UI", -apple-system, sans-serif',
              minHeight: '850px'
            }}
          >
            {/* Header / Name */}
            <div className="text-center pb-4 border-b border-slate-900/80 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-950">
                {resumeData.personalInfo.fullName || 'Candidate Full Name'}
              </h1>
              <div className="text-xs sm:text-[13px] text-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium">
                {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                {resumeData.personalInfo.phone && <span>&bull; {resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo.email && <span>&bull; {resumeData.personalInfo.email}</span>}
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
                {resumeData.personalInfo.linkedin && <span>linkedin.com/{resumeData.personalInfo.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\//, '')}</span>}
                {resumeData.personalInfo.github && <span>&bull; github.com/{resumeData.personalInfo.github.replace(/https?:\/\/(www\.)?github\.com\//, '')}</span>}
                {resumeData.personalInfo.portfolio && <span>&bull; {resumeData.personalInfo.portfolio.replace(/https?:\/\//, '')}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {resumeData.summary && (
              <div className="pt-4 space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-mono">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed pt-1">
                  {resumeData.summary}
                </p>
              </div>
            )}

            {/* Core Technical Skills */}
            <div className="pt-4 space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-mono">
                Technical Skills
              </h2>
              <div className="text-xs text-slate-800 space-y-1 pt-1">
                {resumeData.skills.languages?.length > 0 && (
                  <div>
                    <strong className="font-bold text-slate-950">Languages: </strong>
                    <span>{resumeData.skills.languages.join(', ')}</span>
                  </div>
                )}
                {resumeData.skills.frameworks?.length > 0 && (
                  <div>
                    <strong className="font-bold text-slate-950">Frameworks & Libraries: </strong>
                    <span>{resumeData.skills.frameworks.join(', ')}</span>
                  </div>
                )}
                {resumeData.skills.cloudDevOps?.length > 0 && (
                  <div>
                    <strong className="font-bold text-slate-950">Cloud & Infrastructure: </strong>
                    <span>{resumeData.skills.cloudDevOps.join(', ')}</span>
                  </div>
                )}
                {resumeData.skills.databases?.length > 0 && (
                  <div>
                    <strong className="font-bold text-slate-950">Databases & Streaming: </strong>
                    <span>{resumeData.skills.databases.join(', ')}</span>
                  </div>
                )}
                {resumeData.skills.toolsAndMethods?.length > 0 && (
                  <div>
                    <strong className="font-bold text-slate-950">Architecture & Methodologies: </strong>
                    <span>{resumeData.skills.toolsAndMethods.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Experience */}
            {resumeData.experience?.length > 0 && (
              <div className="pt-4 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-mono">
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
                        {exp.bullets.map((b, i) => (
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

            {/* Flagship Projects */}
            {resumeData.projects?.length > 0 && (
              <div className="pt-4 space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-mono">
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
                        {proj.bullets.map((b, i) => (
                          <li key={i} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education?.length > 0 && (
              <div className="pt-4 space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-mono">
                  Education
                </h2>

                <div className="space-y-1 pt-1">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-950">{edu.institution}</span>
                        <span className="text-slate-700"> &mdash; {edu.degree}</span>
                        {edu.gpa && <span className="text-slate-600"> (GPA: {edu.gpa})</span>}
                      </div>
                      <span className="text-slate-600 text-[11px]">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {resumeData.certifications?.length > 0 && (
              <div className="pt-4 space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-mono">
                  Certifications & Honors
                </h2>
                <div className="text-xs text-slate-800 pt-1">
                  {resumeData.certifications.join(' &bull; ')}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. AI GENERATION MODAL DIALOG                                             */}
      {/* ========================================================================= */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/50 bg-slate-900 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">AI Tailor Resume with Mistral</h3>
                  <p className="text-xs text-slate-400">Generate high-impact ATS bullets matching the job requirements</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 font-mono">
                Paste Target Job Description (Requirements & Responsibilities):
              </label>
              <textarea
                value={customJd}
                onChange={(e) => setCustomJd(e.target.value)}
                placeholder="Paste the job post here..."
                className="w-full h-48 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAiGenerateResume}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate ATS Resume</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
