import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Teaching from './pages/Teaching';
import Research from './pages/Research';
import Service from './pages/Service';
import Professional from './pages/Professional';
import Career from './pages/Career';
import AllPublications from './pages/AllPublications';
import AllGrants from './pages/AllGrants';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout title="Performance Overview">
                  <Overview />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/teaching" element={
              <ProtectedRoute>
                <Layout title="Teaching Performance">
                  <Teaching />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/research" element={
              <ProtectedRoute>
                <Layout title="Research Portfolio">
                  <Research />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/service" element={
              <ProtectedRoute>
                <Layout title="Service Portfolio">
                  <Service />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/professional" element={
              <ProtectedRoute>
                <Layout title="Professional Development">
                  <Professional />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/career" element={
              <ProtectedRoute>
                <Layout title="Career Journey">
                  <Career />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/research/publications" element={
              <ProtectedRoute>
                <Layout title="All Publications">
                  <AllPublications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/research/grants" element={
              <ProtectedRoute>
                <Layout title="All Grants">
                  <AllGrants />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout title="Report Center">
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <Layout title="Document Library">
                  <Documents />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
