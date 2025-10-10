import { useState } from 'react';

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlama isteği gönderilemedi');
      }

      setSuccess(true);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Şifre sıfırlama isteği gönderilemedi';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { forgotPassword, isLoading, error, success };
}

