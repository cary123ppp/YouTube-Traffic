import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './pages/admin/Dashboard';
import EditProfile from './pages/admin/EditProfile';
import PublicProfile from './pages/PublicProfile';

// Admin/System Domains (Domains that serve the landing page or admin panel)
const SYSTEM_DOMAINS = [
  'grandservicehub.com',
  'www.grandservicehub.com',
  'localhost', 
  '127.0.0.1'
];

function App() {
  const hostname = window.location.hostname;
  // If the current hostname is NOT in the system list, treat it as a custom user domain
  const isCustomDomain = !SYSTEM_DOMAINS.includes(hostname);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edit/:id" element={<EditProfile />} />
        <Route path="/:slug" element={<PublicProfile />} />
        <Route path="/" element={
          isCustomDomain ? (
            // Pass the hostname as the 'domainSlug' prop to fetch by custom_domain
            <PublicProfile domainSlug={hostname} />
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              <h1 className="text-4xl font-bold mb-8 text-gray-800">Grand Service Hub</h1>
              <Link to="/admin" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Go to Admin Dashboard
              </Link>
            </div>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
