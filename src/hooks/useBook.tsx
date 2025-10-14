import { useState } from 'react';
import { toast } from 'react-toastify';

interface BookData {
  name?: string;
  author?: string;
  Category?: string;
  status?: 'purchased' | 'not_purchased';
  isRead?: boolean;
}

export function useBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add multiple books from text
  const addBooks = async (text: string, categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/book/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, categoryId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const successCount = data.data?.summary?.successful || 0;
        const failedCount = data.data?.summary?.failed || 0;
        
        if (failedCount > 0) {
          toast.warning(`${successCount} kitap eklendi, ${failedCount} kitap eklenemedi`);
        } else {
          toast.success(`${successCount} kitap başarıyla eklendi`);
        }
        
        return data;
      } else {
        const errorMsg = data.message || 'Kitaplar eklenirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error adding books:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kitaplar eklenirken hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get books with filters
  const getBooks = async (params?: { 
    Category?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
    status?: 'purchased' | 'not_purchased';
    isRead?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.Category) queryParams.append('Category', params.Category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/book/get${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.books || [];
      } else {
        const errorMsg = data.message || 'Kitaplar yüklenirken hata oluştu';
        setError(errorMsg);
        return [];
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kitaplar yüklenirken hata oluştu';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update book
  const updateBook = async (bookId: string, bookData: BookData, silent: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/book/update/${bookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!silent) {
          toast.success('Kitap başarıyla güncellendi');
        }
        return data;
      } else {
        const errorMsg = data.message || 'Kitap güncellenirken hata oluştu';
        if (!silent) {
          toast.error(errorMsg);
        }
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error updating book:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kitap güncellenirken hata oluştu';
      setError(errorMsg);
      if (!silent) {
        toast.error(errorMsg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update book status
  const updateBookStatus = async (bookId: string, status: 'purchased' | 'not_purchased') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/book/update-status/${bookId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return true;
      } else {
        const errorMsg = data.message || 'Durum güncellenirken hata oluştu';
        toast.error(errorMsg);
        return false;
      }
    } catch (err) {
      console.error('Error updating book status:', err);
      toast.error('Durum güncellenirken hata oluştu');
      return false;
    }
  };

  // Delete book
  const deleteBook = async (bookId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/book/delete/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Kitap başarıyla silindi');
        return true;
      } else {
        const errorMsg = data.message || 'Kitap silinirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kitap silinirken hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addBooks,
    getBooks,
    updateBook,
    updateBookStatus,
    deleteBook,
  };
}
