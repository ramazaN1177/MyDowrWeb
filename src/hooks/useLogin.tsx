// src/hooks/useLogin.ts
import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

export function useLogin() {
  const { setUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend'den dönen message'ı kullan
        throw new Error(data.message || 'Login failed');
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('token', data.token); // Eski kod için backward compatibility
      
      // User'ı localStorage'a kaydet
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Context'e set et
      setUser(data.user);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}