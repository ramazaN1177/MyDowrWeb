// src/hooks/useAuth.tsx
import { useAuthContext } from '../context/AuthContext';
import { useLogin } from './useLogin';
import { useLogout } from './useLogout';
import { useRegister } from './useRegister';
import { useVerifyEmail } from './useVerifyEmail';

export function useAuth() {
  const { 
    user, 
    isLoading: globalLoading,
    pendingVerification,
    pendingVerificationEmail,
    setPendingVerificationEmail,
  } = useAuthContext();
  
  const { login, isLoading: loginLoading, error: loginError } = useLogin();
  const { logout } = useLogout();
  const { register, isLoading: registerLoading, error: registerError } = useRegister();
  const { verifyEmail, isLoading: verifyLoading, error: verifyError } = useVerifyEmail();

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: globalLoading || loginLoading || registerLoading || verifyLoading,
    
    // ✨ YENİ: Verification
    pendingVerification,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    
    // Actions
    login,
    logout,
    register,
    verifyEmail, // ✨ YENİ
    
    // Errors
    loginError,
    registerError,
    verifyError, // ✨ YENİ
  };
}