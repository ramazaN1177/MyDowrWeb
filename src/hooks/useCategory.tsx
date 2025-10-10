import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export function useCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category/get`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.categories) {
        const transformedCategories = data.categories.map((category: any) => ({
          id: category._id,
          title: category.name?.toUpperCase() || '',
          icon: category.icon || 'folder',
          color: '#FFB300',
          description: category.name || '',
        }));

        setCategories(transformedCategories);
        return transformedCategories;
      } else {
        const errorMsg = data.message || 'Kategoriler yüklenemedi';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kategoriler yüklenirken hata oluştu';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async (name: string, icon?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(),
          ...(icon && { icon })
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Kategori başarıyla eklendi');
        await fetchCategories(); // Refresh categories
        return data;
      } else {
        const errorMsg = data.message || 'Kategori eklenirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error creating category:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kategori eklenirken hata oluştu';
      if (!toast.isActive('create-error')) {
        toast.error(errorMsg, { toastId: 'create-error' });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string, categoryTitle: string) => {
    if (!window.confirm(`"${categoryTitle}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category/delete/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Kategori başarıyla silindi');
        await fetchCategories(); // Refresh categories
        return true;
      } else {
        const errorMsg = data.message || 'Kategori silinirken hata oluştu';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMsg = err instanceof Error ? err.message : 'Kategori silinirken hata oluştu';
      if (!toast.isActive('delete-error')) {
        toast.error(errorMsg, { toastId: 'delete-error' });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
  };
}

