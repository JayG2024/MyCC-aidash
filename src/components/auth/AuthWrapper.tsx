import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/firebase-auth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authed = await isAuthenticated();
        console.log('Auth check result:', authed);
        setIsAuthed(authed);
        setAuthChecked(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthed(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [location.pathname]);

  if (!authChecked) {
    // Loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is on login page and is authenticated, redirect to home
  if (location.pathname === '/login' && isAuthed) {
    return <Navigate to="/" replace />;
  }
  
  // If user is not on login page and is not authenticated, redirect to login
  if (location.pathname !== '/login' && !isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthWrapper;