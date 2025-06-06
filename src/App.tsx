import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataAnalysis from './pages/DataAnalysis';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthWrapper from './components/auth/AuthWrapper';

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<DataAnalysis />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          {/* All routes redirect to data analysis */}
          <Route path="*" element={<DataAnalysis />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;