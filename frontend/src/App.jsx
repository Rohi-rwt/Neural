import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Pages
import Dashboard from '@/pages/Dashboard';
import AITutor from '@/pages/AITutor';
import DSAPractice from '@/pages/DSAPractice';
import ProblemDetail from '@/pages/ProblemDetail';
import AptitudePage from '@/pages/AptitudePage';
import FundamentalsPage from '@/pages/FundamentalsPage';
import MockTests from '@/pages/MockTests';
import TestEngine from '@/pages/TestEngine';
import TestResult from '@/pages/TestResult';
import DSAVisualizer from '@/pages/DSAVisualizer';
import InterviewPrep from '@/pages/InterviewPrep';
import AIInterviewer from '@/pages/AIInterviewer';
import RoadmapPage from '@/pages/RoadmapPage';
import ProgressPage from '@/pages/ProgressPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import AdminPanel from '@/pages/AdminPanel';
import SubscriptionPage from '@/pages/SubscriptionPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import AuthCallback from '@/pages/auth/AuthCallback';
import NotFound from '@/pages/NotFound';

export default function App() {
  const { initAuth } = useAuthStore();
  const { initTheme } = useUIStore();

  useEffect(() => {
    initAuth();
    initTheme();
  }, []);

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* App routes — protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/ai-tutor/:problemId" element={<AITutor />} />
          <Route path="/dsa" element={<DSAPractice />} />
          <Route path="/dsa/:slug" element={<ProblemDetail />} />
          <Route path="/aptitude" element={<AptitudePage />} />
          <Route path="/fundamentals" element={<FundamentalsPage />} />
          <Route path="/tests" element={<MockTests />} />
          <Route path="/tests/:id/take" element={<TestEngine />} />
          <Route path="/tests/result/:attemptId" element={<TestResult />} />
          <Route path="/visualizer" element={<DSAVisualizer />} />
          <Route path="/interview" element={<InterviewPrep />} />
          <Route path="/ai-interviewer" element={<AIInterviewer />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          {/* Admin */}
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
