import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Upload,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Eye,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { ResumeData } from '../../types';
import { INITIAL_RESUME_DATA, validateResumeData, exportResumeToPdf } from '../../utils/resumeUtils';
import { TOOLS } from '../../data/tools';

export const ResumeBuilderPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'resume-builder')!;

  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('quickutility_resume');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_RESUME_DATA;
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'coverLetter'>('editor');
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'creative'>(resume.template || 'modern');
  const [isExporting, setIsExporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // AI Assistant states
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiStatusMsg, setAiStatusMsg] = useState<string>('');
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiModalType, setAiModalType] = useState<'bullet' | 'summary' | 'coverLetter'>('bullet');
  const [aiInputTarget, setAiInputTarget] = useState<{ expIdx?: number; bulletIdx?: number }>({});
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResults, setAiResults] = useState<string[]>([]);

  // Cover letter state
  const [coverTargetCompany, setCoverTargetCompany] = useState<string>('Google');
  const [coverTargetRole, setCoverTargetRole] = useState<string>(resume.personal.jobTitle || 'Full-Stack Engineer');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('quickutility_resume', JSON.stringify(resume));
  }, [resume]);

  // Check server-side Gemini AI status
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setAiAvailable(data.available);
        setAiStatusMsg(data.message);
      })
      .catch(() => {
        setAiAvailable(false);
        setAiStatusMsg('AI server endpoint offline.');
      });
  }, []);

  const handlePersonalChange = (field: keyof ResumeData['personal'], value: string) => {
    setResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ['Led cross-functional initiatives delivering measurable impact.'],
        },
      ],
    }));
  };

  const removeExperience = (idx: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));
  };

  const updateExperience = (idx: number, field: string, val: any) => {
    const copy = [...resume.experience];
    copy[idx] = { ...copy[idx], [field]: val };
    setResume((prev) => ({ ...prev, experience: copy }));
  };

  const updateBullet = (expIdx: number, bulletIdx: number, val: string) => {
    const copy = [...resume.experience];
    copy[expIdx].description[bulletIdx] = val;
    setResume((prev) => ({ ...prev, experience: copy }));
  };

  const addBullet = (expIdx: number) => {
    const copy = [...resume.experience];
    copy[expIdx].description.push('');
    setResume((prev) => ({ ...prev, experience: copy }));
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    const copy = [...resume.experience];
    copy[expIdx].description.splice(bulletIdx, 1);
    setResume((prev) => ({ ...prev, experience: copy }));
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          institution: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
        },
      ],
    }));
  };

  const removeEducation = (idx: number) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const updateEducation = (idx: number, field: string, val: string) => {
    const copy = [...resume.education];
    copy[idx] = { ...copy[idx], [field]: val };
    setResume((prev) => ({ ...prev, education: copy }));
  };

  const handleExportPdf = async () => {
    const validation = validateResumeData(resume);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    setIsExporting(true);

    try {
      const pdfBytes = await exportResumeToPdf({ ...resume, template });
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(resume.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessNotice('PDF Resume exported successfully!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setValidationErrors([err.message || 'PDF export failed.']);
    } finally {
      setIsExporting(false);
    }
  };

  // AI Trigger
  const triggerAiImproveBullet = (expIdx: number, bulletIdx: number) => {
    const curBullet = resume.experience[expIdx]?.description[bulletIdx] || '';
    setAiInputTarget({ expIdx, bulletIdx });
    setAiPromptText(curBullet);
    setAiModalType('bullet');
    setAiResults([]);
    setAiModalOpen(true);
  };

  const triggerAiSummary = () => {
    setAiPromptText(resume.summary);
    setAiModalType('summary');
    setAiResults([]);
    setAiModalOpen(true);
  };

  const executeAiCall = async () => {
    setAiLoading(true);
    try {
      if (aiModalType === 'bullet') {
        const res = await fetch('/api/ai/resume-bullet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bullet: aiPromptText,
            role: resume.personal.jobTitle,
          }),
        });
        const data = await res.json();
        if (data.variations) {
          setAiResults(data.variations);
        } else {
          setValidationErrors([data.error || 'AI generation failed.']);
        }
      } else if (aiModalType === 'summary') {
        const res = await fetch('/api/ai/resume-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: resume.personal.jobTitle,
            keySkills: resume.skills.technical.slice(0, 5).join(', '),
            accomplishments: resume.summary,
          }),
        });
        const data = await res.json();
        if (data.summary) {
          setAiResults([data.summary]);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResult = (text: string) => {
    if (aiModalType === 'bullet' && aiInputTarget.expIdx !== undefined && aiInputTarget.bulletIdx !== undefined) {
      updateBullet(aiInputTarget.expIdx, aiInputTarget.bulletIdx, text);
    } else if (aiModalType === 'summary') {
      setResume((prev) => ({ ...prev, summary: text }));
    }
    setAiModalOpen(false);
  };

  const generateAiCoverLetter = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: resume.personal.fullName,
          targetRole: coverTargetRole,
          companyName: coverTargetCompany,
          experienceSummary: resume.summary,
        }),
      });
      const data = await res.json();
      if (data.letter) {
        setGeneratedCoverLetter(data.letter);
      } else {
        setValidationErrors([data.error || 'Failed to generate cover letter.']);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Fill in your contact details, professional summary, work history, and education.',
        'Use the optional "AI Polish" button on bullet points for punchy, action-oriented wording.',
        'Toggle between Editor, Live Preview, and AI Cover Letter tabs.',
        'Download your print-ready ATS-compliant PDF document.',
      ]}
      limitations={[
        'Export formats directly to vector PDF suitable for applicant tracking systems (ATS).',
        'AI suggestions require a valid GEMINI_API_KEY in the environment. All core resume editing and PDF generation functions operate 100% independently without AI.',
      ]}
    >
      <div className="space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          {/* Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Resume Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setActiveTab('coverLetter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'coverLetter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Cover Letter</span>
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print directly or save as PDF via browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Browser Print</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export PDF Document</span>
            </button>
          </div>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Please review before exporting:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* TAB 1: RESUME EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Personal Details */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Contact & Personal Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={resume.personal.fullName}
                    onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Job Title</label>
                  <input
                    type="text"
                    value={resume.personal.jobTitle}
                    onChange={(e) => handlePersonalChange('jobTitle', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={resume.personal.email}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resume.personal.phone}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={resume.personal.location}
                    onChange={(e) => handlePersonalChange('location', e.target.value)}
                    placeholder="City, State / Country"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">LinkedIn / Portfolio</label>
                  <input
                    type="text"
                    value={resume.personal.linkedin}
                    onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Professional Executive Summary
                </h3>
                <button
                  type="button"
                  onClick={triggerAiSummary}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Polish Summary</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={resume.summary}
                onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of your professional background, key achievements, and primary competencies..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </section>

            {/* Work Experience */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Work Experience</span>
                </h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-4">
                {resume.experience.map((exp, expIdx) => (
                  <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Company name *"
                        value={exp.company}
                        onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Position / Title *"
                        value={exp.position}
                        onChange={(e) => updateExperience(expIdx, 'position', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Start Date (e.g. 2022)"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIdx, 'startDate', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="End Date (or Present)"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(expIdx, 'endDate', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Achievements & Responsibilities:
                      </span>
                      {exp.description.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center space-x-2">
                          <span className="text-slate-400 font-bold">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateBullet(expIdx, bIdx, e.target.value)}
                            placeholder="Describe achievement with quantifiable impact..."
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => triggerAiImproveBullet(expIdx, bIdx)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="AI Polish this bullet"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBullet(expIdx, bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBullet(expIdx)}
                        className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet Point</span>
                      </button>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => removeExperience(expIdx)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Role</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Education</span>
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="space-y-3">
                {resume.education.map((edu, eduIdx) => (
                  <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Institution / University *"
                        value={edu.institution}
                        onChange={(e) => updateEducation(eduIdx, 'institution', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.S.)"
                        value={edu.degree}
                        onChange={(e) => updateEducation(eduIdx, 'degree', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) => updateEducation(eduIdx, 'field', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Graduation Year"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(eduIdx, 'endDate', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => removeEducation(eduIdx)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        Remove Education
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: LIVE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
              <span className="text-slate-600">Template Style:</span>
              <div className="flex space-x-2">
                {(['modern', 'minimal', 'creative'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer ${
                      template === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Sheet Preview (A4 Ratio) */}
            <div className="bg-white border border-slate-300 shadow-xl rounded-xl p-8 sm:p-12 max-w-3xl mx-auto space-y-6 text-slate-900 min-h-[800px]">
              {/* Header */}
              <div className="border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {resume.personal.fullName || 'Your Full Name'}
                </h1>
                <p className="text-base font-semibold text-blue-600 mt-0.5">
                  {resume.personal.jobTitle || 'Your Professional Title'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                  {resume.personal.email && <span>{resume.personal.email}</span>}
                  {resume.personal.phone && <span>• {resume.personal.phone}</span>}
                  {resume.personal.location && <span>• {resume.personal.location}</span>}
                  {resume.personal.linkedin && <span>• {resume.personal.linkedin}</span>}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Summary
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">{resume.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resume.experience.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
                    Experience
                  </h2>
                  {resume.experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-800">
                        <span>{exp.position}</span>
                        <span className="text-slate-500 font-normal">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 italic">{exp.company}</p>
                      <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 mt-1">
                        {exp.description.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
                    Education
                  </h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{edu.degree} in {edu.field}</span>
                        <span className="text-slate-500 block">{edu.institution}</span>
                      </div>
                      <span className="text-slate-500 font-medium">{edu.endDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AI COVER LETTER */}
        {activeTab === 'coverLetter' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Tailored AI Cover Letter Generator</span>
              </div>
              <p className="text-xs text-indigo-800/80 max-w-xl">
                Uses your experience summary to draft a customized, compelling cover letter for any employer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="target-company-input" className="block font-bold text-slate-700 mb-1">Target Company:</label>
                  <input
                    id="target-company-input"
                    type="text"
                    value={coverTargetCompany}
                    onChange={(e) => setCoverTargetCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="target-role-input" className="block font-bold text-slate-700 mb-1">Target Role:</label>
                  <input
                    id="target-role-input"
                    type="text"
                    value={coverTargetRole}
                    onChange={(e) => setCoverTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={generateAiCoverLetter}
                disabled={aiLoading || aiAvailable === false}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate Cover Letter Draft</span>
              </button>

              {aiAvailable === false && (
                <p className="text-xs text-slate-500">
                  Note: AI drafting is disabled because GEMINI_API_KEY is not configured in the Secrets panel.
                </p>
              )}
            </div>

            {generatedCoverLetter && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">Cover Letter Draft</h4>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(generatedCoverLetter)}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <textarea
                  rows={12}
                  value={generatedCoverLetter}
                  onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans"
                />
              </div>
            )}
          </div>
        )}

        {/* AI Polish Modal */}
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Polish Assistant</span>
                </div>
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div>
                <label htmlFor="current-draft-text" className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Draft:
                </label>
                <textarea
                  id="current-draft-text"
                  rows={3}
                  value={aiPromptText}
                  onChange={(e) => setAiPromptText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={executeAiCall}
                  disabled={aiLoading || !aiPromptText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Variations</span>
                </button>
              </div>

              {aiResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Choose an Improved Version:
                  </span>
                  {aiResults.map((resText, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-slate-800 space-y-2 hover:bg-indigo-50"
                    >
                      <p className="leading-snug">{resText}</p>
                      <button
                        type="button"
                        onClick={() => applyAiResult(resText)}
                        className="text-xs font-bold text-indigo-700 hover:underline"
                      >
                        Use This Bullet →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
