import { RecruiterRoute } from './components/RecruiterPreview';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardLandingPage } from './components/DashboardLandingPage';
import { ChannelsPage } from './components/ChannelsPage';
import { LessonPage } from './components/LessonPage';
import { SDESheetExplorer } from './components/SDESheetExplorer';
import { LeetCodeWorkspaceModal } from './components/LeetCodeWorkspaceModal';
import { CompanyDSAProblems } from './components/CompanyDSAProblems';
import { LLDHub } from './components/LLDHub';
import { HLDHub } from './components/HLDHub';
import { UniversalStudioLayout } from './components/studio/UniversalStudioLayout';
import { InterviewCompanion } from './components/InterviewCompanion';
import { ResumeAnalyst } from './components/ResumeAnalyst';
import { CareerSalaryAndJobEnginePage } from './components/CareerSalaryAndJobEnginePage';
import { DeveloperProfilePage } from './components/DeveloperProfilePage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { ThankYouPage } from './components/ThankYouPage';
import { ContactPage } from './components/ContactPage';
import { NotFoundPage } from './components/NotFoundPage';

export function AppRouter() {
  return (
    <AppShell>
      <Routes>
        {/* Home & Dashboard */}
        <Route path="/" element={<DashboardLandingPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Video Learning & Channels */}
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/channel/:channelId" element={<ChannelsPage />} />
        <Route path="/lesson/:videoId" element={<RecruiterRoute kind="lesson"><LessonPage /></RecruiterRoute>} />

        {/* DSA & Coding Practice */}
        <Route path="/dsa-sheets" element={<SDESheetExplorer />} />
        <Route path="/sde-sheet" element={<Navigate to="/dsa-sheets" replace />} />
        <Route path="/problem/:slug" element={<RecruiterRoute kind="problem"><LeetCodeWorkspaceModal /></RecruiterRoute>} />
        <Route path="/dsa-problems" element={<CompanyDSAProblems />} />
        <Route path="/company/:name" element={<CompanyDSAProblems />} />

        {/* System Design */}
        <Route path="/lld" element={<LLDHub />} />
        <Route path="/hld" element={<HLDHub />} />
        <Route path="/system-design" element={<Navigate to="/hld" replace />} />

        {/* Universal Studio v4.0 */}
        <Route path="/studio" element={<RecruiterRoute kind="studio"><UniversalStudioLayout /></RecruiterRoute>} />
        <Route path="/studio/:mode" element={<RecruiterRoute kind="studio"><UniversalStudioLayout /></RecruiterRoute>} />
        <Route path="/studio/:mode/:slug" element={<RecruiterRoute kind="studio"><UniversalStudioLayout /></RecruiterRoute>} />

        {/* AI Career & ATS Studio Suite */}
        <Route path="/career-engine" element={<Navigate to="/resume-analyst?tab=jobs" replace />} />
        <Route path="/compensation" element={<Navigate to="/resume-analyst?tab=jobs" replace />} />
        <Route path="/salary-engine" element={<Navigate to="/resume-analyst?tab=jobs" replace />} />
        <Route path="/interview" element={<RecruiterRoute kind="interview"><InterviewCompanion /></RecruiterRoute>} />
        <Route path="/resume-analyst" element={<RecruiterRoute kind="career"><ResumeAnalyst /></RecruiterRoute>} />
        <Route path="/resume-analyzer" element={<Navigate to="/resume-analyst" replace />} />

        {/* Profile & Analytics */}
        <Route path="/profile" element={<RecruiterRoute kind="profile"><DeveloperProfilePage /></RecruiterRoute>} />
        <Route path="/analytics" element={<RecruiterRoute kind="analytics"><AnalyticsPage /></RecruiterRoute>} />

        {/* Legal & Informational */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
