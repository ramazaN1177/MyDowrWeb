import { useState } from 'react';

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (resetToken: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlanamadı');
      }

      setSuccess(true);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Şifre sıfırlanamadı';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error, success };
}

