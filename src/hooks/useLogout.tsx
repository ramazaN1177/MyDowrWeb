// src/hooks/useLogout.ts
import { useAuthContext } from '../context/AuthContext';

export function useLogout() {
  const { setUser } = useAuthContext();

  const logout = async () => {
    try {
      // Backend'e logout request (opsiyonel)
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Tüm auth verilerini temizle
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return { logout };
}