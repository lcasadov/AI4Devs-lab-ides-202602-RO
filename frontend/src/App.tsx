import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AddCandidatePage } from './pages/AddCandidatePage';
import { DashboardPage } from './pages/DashboardPage';
import { JobTypesPage } from './pages/JobTypesPage';
import { LoginPage } from './pages/LoginPage';
import { SectorsPage } from './pages/SectorsPage';
import { UsersPage } from './pages/UsersPage';

function AppLayout(): JSX.Element {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Header />}
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main
          className={`flex-1 min-h-screen ${isAuthenticated ? 'ml-60 mt-14' : ''}`}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
                  <AddCandidatePage />
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
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
