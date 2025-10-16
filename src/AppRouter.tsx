import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import { AddPage } from './pages/AddPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { FlashcardPage } from './pages/FlashcardPage';
import { QuizPage } from './pages/QuizPage';
import { SummaryPage } from './pages/SummaryPage';
import { Layout } from './components/Layout';
export function AppRouter() {
  // Mock authentication state (in a real app, this would be managed properly)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  return <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignupPage onSignup={handleLogin} />} />
        <Route path="/" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <HomePage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/study" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <StudyPage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/add" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <AddPage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <ProfilePage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <SettingsPage onLogout={handleLogout} />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/ai" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <AIAssistantPage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/flashcard/:topic" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <FlashcardPage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/quiz/:topic/:type" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <QuizPage />
              </Layout> : <Navigate to="/login" />} />
        <Route path="/summary/:topic" element={isAuthenticated ? <Layout onLogout={handleLogout}>
                <SummaryPage />
              </Layout> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>;
}