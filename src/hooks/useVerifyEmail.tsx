// src/hooks/useVerifyEmail.tsx
import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

export function useVerifyEmail() {
  const { setPendingVerification, setPendingVerificationEmail } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token'); // Signup'tan gelen token

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend'den dönen message'ı kullan
        throw new Error(data.message || 'Verification failed');
      }
      
      // ✨ Verification başarılı → State temizle
      setPendingVerification(false);
      setPendingVerificationEmail('');

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyEmail, isLoading, error };
}