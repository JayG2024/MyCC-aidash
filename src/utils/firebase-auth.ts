import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import localforage from 'localforage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  firebaseUid?: string; // Add Firebase UID for tracking
}

// Your existing authorized users - kept for compatibility
const AUTHORIZED_USERS = [
  {
    id: 'admin1',
    email: 'admin@mycomputercareer.edu',
    password: 'MyCC2024!Admin',
    name: 'System Administrator',
    role: 'admin',
  },
  {
    id: 'marketing1',
    email: 'marketing@mycomputercareer.edu',
    password: 'MyCC2024!Marketing',
    name: 'Marketing Director',
    role: 'marketing',
  },
  {
    id: 'sales1',
    email: 'sales@mycomputercareer.edu',
    password: 'MyCC2024!Sales',
    name: 'Sales Director',
    role: 'sales',
  },
  {
    id: 'exec1',
    email: 'executive@mycomputercareer.edu',
    password: 'MyCC2024!Executive',
    name: 'Executive Team',
    role: 'executive',
  }
];

export const loginWithFirebase = async (email: string, password: string): Promise<User | null> => {
  try {
    // First check if this is one of your authorized users
    const authorizedUser = AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!authorizedUser) {
      throw new Error('Invalid email or password');
    }

    let firebaseUser: FirebaseUser;
    
    try {
      // Try to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
      console.log('Signed in existing Firebase user:', firebaseUser.uid);
    } catch (firebaseError: any) {
      if (firebaseError.code === 'auth/user-not-found') {
        // User doesn't exist in Firebase, create them
        console.log('Creating new Firebase user for:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
        console.log('Created new Firebase user:', firebaseUser.uid);
      } else {
        // Other Firebase error, but still allow login with local auth
        console.warn('Firebase auth failed, continuing with local auth:', firebaseError.message);
        firebaseUser = null as any;
      }
    }

    // Create user object with Firebase UID for tracking
    const userData: User = {
      id: authorizedUser.id,
      name: authorizedUser.name,
      email: authorizedUser.email,
      role: authorizedUser.role,
      firebaseUid: firebaseUser?.uid || null
    };

    // Store in local storage
    await localforage.setItem('current_user', userData);
    await localforage.setItem('auth_token', `firebase-token-${Date.now()}`);

    console.log('User email', userData.email);
    console.log('User profile created successfully');
    
    return userData;

  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

export const logoutWithFirebase = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await auth.signOut();
    
    // Clear local storage
    await localforage.removeItem('current_user');
    await localforage.removeItem('auth_token');
    
    console.log('User logged out successfully');
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

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Export original functions with Firebase integration
export const login = loginWithFirebase;
export const logout = logoutWithFirebase;