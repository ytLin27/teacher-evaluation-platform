import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Teaching from './pages/Teaching';
import Research from './pages/Research';
import Service from './pages/Service';
import Professional from './pages/Professional';
import Career from './pages/Career';

function App() {
  return (
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
      </Routes>
    </Router>
  );
}

export default App;
