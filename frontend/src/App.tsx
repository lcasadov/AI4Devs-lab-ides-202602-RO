import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CandidatesPage } from './pages/CandidatesPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobTypesPage } from './pages/JobTypesPage';
import { LoginPage } from './pages/LoginPage';
import { SectorsPage } from './pages/SectorsPage';
import { UsersPage } from './pages/UsersPage';

function AppLayout(): JSX.Element {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: '100vh', marginLeft: '240px', marginTop: '56px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedRoute>
                  <CandidatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requireAdmin>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sectors"
              element={
                <ProtectedRoute requireAdmin>
                  <SectorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobtypes"
              element={
                <ProtectedRoute requireAdmin>
                  <JobTypesPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
