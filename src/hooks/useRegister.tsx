// src/hooks/useRegister.tsx
import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

export function useRegister() {
  const { setPendingVerification, setPendingVerificationEmail } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend'den dönen message'ı kullan
        throw new Error(data.message || 'Registration failed');
      }
      
      // ✨ Signup başarılı → Email verification bekleniyor
      setPendingVerification(true);
      setPendingVerificationEmail(email);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}