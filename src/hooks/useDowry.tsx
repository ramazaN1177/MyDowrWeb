import { useState } from 'react';
import { toast } from 'react-toastify';

interface DowryData {
  name: string;
  description?: string;
  Category: string;
  dowryPrice: number;
  imageId?: string;
  dowryLocation?: string;
  status: 'purchased' | 'not_purchased';
}

export function useDowry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload image
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/image/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success && data.image) {
        // Try to get image ID from various possible fields
        const imageId = data.image._id || data.image.id || data.image.imageId || data.image.fileId;
        
        if (!imageId) {
          throw new Error('Image ID not found in response');
        }

        return imageId;
      } else {
        const errorMsg = data.message || 'Resim yüklenirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      const errorMsg = err instanceof Error ? err.message : 'Resim yüklenirken hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create dowry
  const createDowry = async (dowryData: DowryData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dowryData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Eşya başarıyla eklendi');
        return data;
      } else {
        const errorMsg = data.message || 'Eşya eklenirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error creating dowry:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşya eklenirken hata oluştu';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get dowries by category
  const getDowriesByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/category/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.dowries || [];
      } else {
        const errorMsg = data.message || 'Eşyalar yüklenirken hata oluştu';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching dowries:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşyalar yüklenirken hata oluştu';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all dowries
  const getAllDowries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/get`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.dowries || [];
      } else {
        const errorMsg = data.message || 'Eşyalar yüklenirken hata oluştu';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching all dowries:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşyalar yüklenirken hata oluştu';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get dowries with filters
  const getDowries = async (params?: { category?: string; search?: string; page?: number; limit?: number; status?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('Category', params.category); // API'de büyük C ile Category
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/dowry/get${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.dowries || [];
      } else {
        const errorMsg = data.message || 'Eşyalar yüklenirken hata oluştu';
        setError(errorMsg);
        return [];
      }
    } catch (err) {
      console.error('Error fetching dowries:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşyalar yüklenirken hata oluştu';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Delete dowry
  const deleteDowry = async (dowryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/delete/${dowryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Eşya başarıyla silindi');
        return true;
      } else {
        const errorMsg = data.message || 'Eşya silinirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting dowry:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşya silinirken hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update dowry status
  const updateDowryStatus = async (dowryId: string, status: 'purchased' | 'not_purchased') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/update/${dowryId}`, {
        method: 'PUT',
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
      console.error('Error updating dowry status:', err);
      toast.error('Durum güncellenirken hata oluştu');
      return false;
    }
  };

  // Get image
  const getImage = async (imageId: string): Promise<string | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/image/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();
      
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error getting image:', err);
      return null;
    }
  };

  // Update dowry
  const updateDowry = async (dowryId: string, dowryData: Partial<DowryData>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/update/${dowryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dowryData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Eşya başarıyla güncellendi');
        return data;
      } else {
        const errorMsg = data.message || 'Eşya güncellenirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error updating dowry:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşya güncellenirken hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single dowry
  const getDowryById = async (dowryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dowry/${dowryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.dowry;
      } else {
        const errorMsg = data.message || 'Eşya yüklenirken hata oluştu';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching dowry:', err);
      const errorMsg = err instanceof Error ? err.message : 'Eşya yüklenirken hata oluştu';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // OCR for book images
  const performOCR = async (imageId: string): Promise<{ bookName?: string; authorName?: string } | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/image/ocr/${imageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.bookInfo) {
        return {
          bookName: data.bookInfo.title,
          authorName: data.bookInfo.author
        };
      } else {
        console.warn('OCR failed:', data.message);
        return null;
      }
    } catch (err) {
      console.error('Error performing OCR:', err);
      return null;
    }
  };

  // Delete image
  const deleteImage = async (imageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/image/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return true;
      } else {
        console.warn('Image delete failed:', data.message);
        return false;
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  };

  return {
    loading,
    error,
    uploadImage,
    createDowry,
    getDowriesByCategory,
    getAllDowries,
    getDowries,
    deleteDowry,
    updateDowryStatus,
    getImage,
    updateDowry,
    getDowryById,
    performOCR,
    deleteImage,
  };
}

