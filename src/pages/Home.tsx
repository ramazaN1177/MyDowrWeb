import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faPlus,
  faFolder,
  faList,
  faSignOutAlt,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faUtensils,
  faBed,
  faTv,
  faBath,
  faChild,
  faDesktop,
  faBook,
  faCar,
  faShirt,
  faMusic,
  faGamepad,
  faDumbbell,
  faBriefcaseMedical,
  faGraduationCap,
  faBriefcase,
  faHome,
  faLeaf,
  faCoffee,
  faStore,
  faPlane,
  faCamera,
  faMobileAlt,
  faGem,
  faGift,
  faHeart,
  faStar,
  faSeedling,
  faGlobe,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useCheckAuth } from '../hooks/useCheckAuth';
import { useCategory } from '../hooks/useCategory';
import AddCategoryModal from '../components/AddCategoryModal';
import AddDowryModal from '../components/AddDowryModal';
import ConfirmDialog from '../components/ConfirmDialog';

// Icon mapping for categories
const ICON_MAP: Record<string, any> = {
  'utensils': faUtensils,
  'bed': faBed,
  'tv': faTv,
  'bath': faBath,
  'child': faChild,
  'desktop': faDesktop,
  'book': faBook,
  'car': faCar,
  'shirt': faShirt,
  'music': faMusic,
  'gamepad': faGamepad,
  'dumbbell': faDumbbell,
  'briefcase-medical': faBriefcaseMedical,
  'graduation-cap': faGraduationCap,
  'briefcase': faBriefcase,
  'home': faHome,
  'leaf': faLeaf,
  'coffee': faCoffee,
  'store': faStore,
  'plane': faPlane,
  'camera': faCamera,
  'mobile-alt': faMobileAlt,
  'gem': faGem,
  'gift': faGift,
  'heart': faHeart,
  'star': faStar,
  'seedling': faSeedling,
  'globe': faGlobe,
  'ellipsis-h': faEllipsisH,
  'folder': faFolder,
};

const Home = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { checkAuth } = useCheckAuth();
  const { categories, loading, error, fetchCategories } = useCategory();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddDowryModal, setShowAddDowryModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 9;

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      checkAuth();
    } else if (!token) {
      navigate('/');
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user && !localStorage.getItem('token')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteClick = (category: { id: string; title: string }) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      // useCategory hook içinde window.confirm kullanmadan direkt silme yapalım
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category/delete/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Kategori başarıyla silindi');
        fetchCategories();
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
      } else {
        toast.error(data.message || 'Kategori silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kategori silinirken hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setCurrentPage(1);
  };

  const navigateToCategory = (category: { id: string; title: string; color: string }) => {
    // URL query parameters kullanarak navigate et
    const params = new URLSearchParams({
      id: category.id,
      title: category.title,
      color: category.color,
    });
    navigate(`/category?${params.toString()}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  // Show loading while checking auth
  if (authLoading || (!user && localStorage.getItem('token'))) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8E1' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-600"></div>
          <p className="mt-4 text-lg font-bold" style={{ color: '#8B4513' }}>
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#FFF8E1' }}
    >
      {/* Header */}
      <header
        className="pt-3 pb-6 px-5 rounded-b-3xl shadow-2xl"
        style={{ backgroundColor: '#FFB300' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div
              className="flex items-center px-4 py-2 rounded-2xl border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <img
                src="/myDowryLogo.png"
                alt="MyDowry Logo"
                className="w-9 h-9 mr-3 object-contain"
              />
              <h1
                className="text-xl font-bold text-white"
                style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)' }}
              >
                Çeyiz Yönetimi
              </h1>
            </div>
            <button
              className="p-2 rounded-2xl border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <FontAwesomeIcon icon={faUserCircle} className="text-white text-2xl" />
            </button>
          </div>
          <p
            className="text-white text-sm text-center"
            style={{
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            Hoş geldin, {user?.name || 'Kullanıcı'}!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-6 pb-6 max-w-6xl mx-auto w-full">
        {/* Categories Section */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-center mb-4" style={{ color: '#8B4513' }}>
            Kategoriler
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
              <p className="mt-4 text-lg" style={{ color: '#8B4513' }}>
                Kategoriler yükleniyor...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 text-center mb-4">{error}</p>
              <button
                onClick={fetchCategories}
                className="px-6 py-2 rounded-lg font-bold text-white"
                style={{ backgroundColor: '#FFB300' }}
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-6">
                {currentCategories.map((category) => {
                  const categoryIcon = ICON_MAP[category.icon] || faFolder;
                  
                  return (
                    <div key={category.id} className="relative group">
                      <button
                        onClick={() => navigateToCategory(category)}
                        className="w-full aspect-square bg-white rounded-2xl border-2 flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-200 p-3"
                        style={{ borderColor: '#FFB300' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                          style={{ backgroundColor: '#FFF8E1' }}
                        >
                          <FontAwesomeIcon icon={categoryIcon} className="text-xl" style={{ color: '#FFB300' }} />
                        </div>
                        <p className="text-xs font-bold text-center mt-2" style={{ color: '#8B4513' }}>
                          {category.title}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(category);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-125 active:scale-95"
                        style={{ borderColor: '#8B4513', backgroundColor: '#FFF' }}
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" style={{ color: '#8B4513' }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="px-5 mb-4 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center px-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border bg-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                borderColor: currentPage === 1 ? '#DDD' : '#FFB300',
                color: currentPage === 1 ? '#CCC' : '#8B4513',
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Önceki</span>
            </button>

            <div
              className="px-4 py-2 rounded-2xl border font-bold text-sm"
              style={{ backgroundColor: '#FFB300', borderColor: '#8B4513', color: '#FFF' }}
            >
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border bg-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                borderColor: currentPage === totalPages ? '#DDD' : '#FFB300',
                color: currentPage === totalPages ? '#CCC' : '#8B4513',
              }}
            >
              <span>Sonraki</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <section className="px-5 mb-4 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-bold text-center mb-4" style={{ color: '#8B4513' }}>
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowAddDowryModal(true)}
            className="bg-white rounded-2xl border-2 flex flex-col items-center justify-center py-4 shadow-md hover:shadow-xl transition-all duration-200"
            style={{ borderColor: '#FFB300' }}
          >
            <FontAwesomeIcon icon={faPlus} className="text-3xl mb-2" style={{ color: '#FFB300' }} />
            <p className="text-sm font-bold" style={{ color: '#8B4513' }}>
              Yeni Eşya
            </p>
          </button>

          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="bg-white rounded-2xl border-2 flex flex-col items-center justify-center py-4 shadow-md hover:shadow-xl transition-all duration-200"
            style={{ borderColor: '#FFB300' }}
          >
            <FontAwesomeIcon icon={faFolder} className="text-3xl mb-2" style={{ color: '#FFB300' }} />
            <p className="text-sm font-bold" style={{ color: '#8B4513' }}>
              Yeni Kategori
            </p>
          </button>

          <button
            onClick={() => navigate('/all-list')}
            className="bg-white rounded-2xl border-2 flex flex-col items-center justify-center py-4 shadow-md hover:shadow-xl transition-all duration-200"
            style={{ borderColor: '#FFB300' }}
          >
            <FontAwesomeIcon icon={faList} className="text-3xl mb-2" style={{ color: '#FFB300' }} />
            <p className="text-sm font-bold" style={{ color: '#8B4513' }}>
              Tüm Eşyalar
            </p>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 pb-6 max-w-6xl mx-auto w-full">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-white shadow-lg font-bold text-white text-lg transition-all hover:scale-105"
          style={{
            backgroundColor: '#8B4513',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Çıkış Yap</span>
        </button>
      </footer>

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={handleCategoryAdded}
      />

      {/* Add Dowry Modal */}
      <AddDowryModal
        visible={showAddDowryModal}
        onClose={() => setShowAddDowryModal(false)}
        onSuccess={()=>{fetchCategories();}}
        category="select"
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Kategoriyi Sil"
        message={`"${categoryToDelete?.title}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kategoriye ait tüm eşyalar da silinecektir.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Home;
