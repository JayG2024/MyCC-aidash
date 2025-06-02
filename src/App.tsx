import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeMonitoring, cleanupMonitoring } from './utils/monitoring';
import Dashboard from './pages/Dashboard';
import AIAssistants from './pages/AIAssistants';
import LeadManagement from './pages/LeadManagement';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import UserProfile from './pages/UserProfile';
import DataAnalysis from './pages/DataAnalysis';
import GravityFormsData from './pages/GravityFormsData';
import FormMonitoring from './pages/FormMonitoring';
import NotificationSettingsPage from './pages/NotificationSettings';
import FormBackup from './pages/FormBackup';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthWrapper from './components/auth/AuthWrapper';

function App() {
  useEffect(() => {
    // Initialize emergency monitoring when app starts
    initializeMonitoring();
    
    // Cleanup when app unmounts
    return () => {
      cleanupMonitoring();
    };
  }, []);

  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Analytics />} />
          <Route path="/assistants" element={<AIAssistants />} />
          <Route path="/leads" element={<LeadManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/content-library" element={<AIAssistants />} />
          <Route path="/gravity-forms" element={<GravityFormsData />} />
          <Route path="/form-monitoring" element={<FormMonitoring />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
          <Route path="/form-backup" element={<FormBackup />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Analytics />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;