import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Teaching from './pages/Teaching';
import Research from './pages/Research';
import Service from './pages/Service';
import Professional from './pages/Professional';
import Career from './pages/Career';
import AllPublications from './pages/AllPublications';
import AllGrants from './pages/AllGrants';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <Router>
      <Routes>
        <Route path="/" element={
          <Layout title="Performance Overview">
            <Overview />
          </Layout>
        } />
        <Route path="/teaching" element={
          <Layout title="Teaching Performance">
            <Teaching />
          </Layout>
        } />
        <Route path="/research" element={
          <Layout title="Research Portfolio">
            <Research />
          </Layout>
        } />
        <Route path="/service" element={
          <Layout title="Service Portfolio">
            <Service />
          </Layout>
        } />
        <Route path="/professional" element={
          <Layout title="Professional Development">
            <Professional />
          </Layout>
        } />
        <Route path="/career" element={
          <Layout title="Career Journey">
            <Career />
          </Layout>
        } />
        <Route path="/research/publications" element={
          <Layout title="All Publications">
            <AllPublications />
          </Layout>
        } />
        <Route path="/research/grants" element={
          <Layout title="All Grants">
            <AllGrants />
          </Layout>
        } />
      </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
