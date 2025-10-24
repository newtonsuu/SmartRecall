import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { HomePage } from "./pages/HomePage";
import { StudyPage } from "./pages/StudyPage";
import { AddPage } from "./pages/AddPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { FlashcardPage } from "./pages/FlashcardPage";
import { QuizPage } from "./pages/QuizPage";
import { SummaryPage } from "./pages/SummaryPage";
import { Layout } from "./components/Layout";
import { useAuth } from "./auth/AuthProvider";
import { EditFlashcardPage } from "./pages/EditFlashcardPage";
import { EditQuizPage } from "./pages/EditQuizPage";
import { EditSummaryPage } from "./pages/EditSummaryPage";
import { EditProfilePage } from "./pages/EditProfilePage";

export function AppRouter() {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) =>
    profile ? (
      <Layout>{children}</Layout>
    ) : (
      <Navigate to="/login" replace />
    );

  const PublicRoute = ({ children }: { children: React.ReactNode }) =>
    profile ? <Navigate to="/" replace /> : <>{children}</>;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcard/:id"
          element={
            <ProtectedRoute>
              <FlashcardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary/:id"
          element={
            <ProtectedRoute>
              <SummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcard/:id/edit"
          element={
            <ProtectedRoute>
              <EditFlashcardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id/edit"
          element={
            <ProtectedRoute>
              <EditQuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary/:id/:edit"
          element={
            <ProtectedRoute>
              <EditSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default AppRouter;
