// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  pendingVerification: boolean;
  setPendingVerification: (pending: boolean) => void;
  pendingVerificationEmail: string;
  setPendingVerificationEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────
// Provider - SADECE STATE TUTAR
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta true
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  // Başlangıçta token kontrolü yap
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        console.log('AuthContext check:', { hasToken: !!token, hasUserData: !!userData });
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log('User restored:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('No auth data found in localStorage');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        console.log('Auth loading complete');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification,
    pendingVerificationEmail,
    setPendingVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
// Hook - Context'e erişim
// ─────────────────────────────────────────────
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}