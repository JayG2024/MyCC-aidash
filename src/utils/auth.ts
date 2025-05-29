import localforage from 'localforage';

// Configure localforage for auth
localforage.config({
  name: 'mcc-ai-dashboard',
  storeName: 'auth_data'
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: 'user1',
    email: 'admin@mycomputercareer.edu',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: 'user2',
    email: 'user@mycomputercareer.edu',
    password: 'user123',
    name: 'Jaydus Martin',
    role: 'marketing',
  }
];

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // In production, this would be a call to your authentication API
    // For now, we'll simulate authentication with mock users
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create user object (excluding password)
    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    // Store in local storage
    await localforage.setItem('current_user', userData);
    await localforage.setItem('auth_token', `mock-token-${Date.now()}`);
    
    console.log('Login successful, user stored:', userData);
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Clear user data and token
    await localforage.removeItem('current_user');
    await localforage.removeItem('auth_token');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await localforage.getItem<User>('current_user');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    const token = await localforage.getItem<string>('auth_token');
    return !!(user && token);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const checkAuthAndRedirect = async (): Promise<boolean> => {
  const authenticated = await isAuthenticated();
  if (!authenticated && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return false;
  }
  return authenticated;
};