import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faSearch,
  faCube,
  faTag,
  faMapMarkerAlt,
  faEdit,
  faTrash,
  faExclamationCircle,
  faTimes,
  faFolder,
  faCouch,
  faBed,
  faUtensils,
  faShirt,
  faTv,
  faBook,
  faCar,
  faHome,
  faHeart,
  faGift,
  faStar,
  faShoppingBag,
  faCoffee,
  faMusic,
  faPalette,
  faGamepad,
  faCamera,
  faBicycle,
  faUmbrella,
  faGlasses,
  faDesktop,
  faBath,
  faChild,
  faDumbbell,
  faBriefcaseMedical,
  faGraduationCap,
  faBriefcase,
  faLeaf,
  faStore,
  faPlane,
  faMobileAlt,
  faGem,
  faSeedling,
  faGlobe,
  faEllipsisH,
  faSortAmountDown,
  faSortAmountUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import AddDowryModal from '../components/AddDowryModal';
import UpdateDowryModal from '../components/UpdateDowryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDowry } from '../hooks/useDowry';
import { useCategory } from '../hooks/useCategory';

interface DowryItem {
  _id?: string;
  name: string;
  description: string;
  Category: string;
  dowryPrice: number;
  imageId?: string;
  dowryImage?: string;
  dowryLocation?: string;
  status: 'purchased' | 'not_purchased';
  isRead?: boolean;
}

const Category = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get('id') || '';
  const categoryTitle = searchParams.get('title') || 'Kategori';
  const categoryColor = searchParams.get('color') || '#FFB300';

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getDowries, deleteDowry, updateDowryStatus, getImage, updateDowry } = useDowry();
  const { categories, fetchCategories } = useCategory();

  // Icon mapping for category icons
  const getIconByName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      folder: faFolder,
      couch: faCouch,
      bed: faBed,
      utensils: faUtensils,
      shirt: faShirt,
      tv: faTv,
      book: faBook,
      car: faCar,
      home: faHome,
      heart: faHeart,
      gift: faGift,
      star: faStar,
      'shopping-bag': faShoppingBag,
      coffee: faCoffee,
      music: faMusic,
      palette: faPalette,
      gamepad: faGamepad,
      camera: faCamera,
      bicycle: faBicycle,
      umbrella: faUmbrella,
      glasses: faGlasses,
      desktop: faDesktop,
      bath: faBath,
      child: faChild,
      dumbbell: faDumbbell,
      'briefcase-medical': faBriefcaseMedical,
      'graduation-cap': faGraduationCap,
      briefcase: faBriefcase,
      leaf: faLeaf,
      store: faStore,
      plane: faPlane,
      'mobile-alt': faMobileAlt,
      gem: faGem,
      seedling: faSeedling,
      globe: faGlobe,
      'ellipsis-h': faEllipsisH,
    };
    return iconMap[iconName] || faFolder;
  };

  // Get current category icon from categories list
  const getCurrentCategoryIcon = () => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || 'folder';
  };

  const [items, setItems] = useState<DowryItem[]>([]);
  const [allItems, setAllItems] = useState<DowryItem[]>([]); // Tüm itemlar (istatistikler için)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'purchased' | 'not_purchased'>('all');
  const [isReadFilter, setIsReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [showReadDropdown, setShowReadDropdown] = useState(false);
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState<DowryItem | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DowryItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user && !localStorage.getItem('token')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Auth yüklenirken bekle
    if (authLoading) {
      return;
    }
    
    if (categoryId && isAuthenticated) {
      loadCategoryItems();
      fetchCategories();
    } else if (!isAuthenticated) {
      setError('Oturum açmanız gerekiyor');
      setLoading(false);
    }
  }, [categoryId, isAuthenticated, authLoading]);

  // Filtreleme ve arama için ayrı effect
  useEffect(() => {
    if (allItems.length > 0) {
      filterItems();
    }
  }, [searchText, statusFilter, isReadFilter, sortOrder, allItems]);

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && imageModalVisible) {
        closeImageModal();
      }
    };

    if (imageModalVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // Modal açıkken body scroll'unu engelle
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [imageModalVisible]);

  // Load images
  useEffect(() => {
    if (items.length > 0) {
      items.forEach((item) => {
        // Hem imageId hem de dowryImage alanlarını kontrol et
        const imageId = item.imageId || item.dowryImage;
        if (imageId && !imageCache[imageId]) {
          loadImageAsBase64(imageId);
        }
      });
    }
  }, [items]);

  const loadCategoryItems = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        setError('Oturum açmanız gerekiyor');
        return;
      }

      // Tüm itemları çek (filtresiz)
      const response = await getDowries({
        category: categoryId,
        page: 1,
        limit: 1000,
      });

      if (response) {
        setAllItems(response);
        setItems(response); // İlk yüklemede tümünü göster
      } else {
        setError('Eşyalar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Eşyalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...allItems];

    // Arama filtresi
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.dowryLocation?.toLowerCase().includes(search)
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Okundu filtresi (sadece kitap kategorisi için)
    if (isReadFilter !== 'all' && getCurrentCategoryIcon() === 'book') {
      if (isReadFilter === 'read') {
        filtered = filtered.filter((item) => item.isRead === true);
      } else if (isReadFilter === 'unread') {
        filtered = filtered.filter((item) => item.isRead !== true);
      }
    }

    // Fiyat sıralaması
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.dowryPrice || 0) - (b.dowryPrice || 0));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.dowryPrice || 0) - (a.dowryPrice || 0));
    }

    setItems(filtered);
  };

  const toggleSortOrder = () => {
    if (sortOrder === 'none') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('none');
    }
  };

  const handleEditItem = (item: DowryItem) => {
    setSelectedItemForUpdate(item);
    setUpdateModalVisible(true);
  };

  const handleDeleteItem = (item: DowryItem) => {
    setItemToDelete(item);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteDowry(itemToDelete._id);
      setAllItems((prevItems) => prevItems.filter((i) => i._id !== itemToDelete._id));
      setItems((prevItems) => prevItems.filter((i) => i._id !== itemToDelete._id));
      setDeleteDialogVisible(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Eşya silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (item: DowryItem, newStatus: boolean) => {
    try {
      if (!item._id) return;

      const status: 'purchased' | 'not_purchased' = newStatus ? 'purchased' : 'not_purchased';
      const oldStatus = item.status;

      // Optimistic update
      setAllItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, status } : i))
      );
      setItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, status } : i))
      );

      const success = await updateDowryStatus(item._id, status);

      if (!success) {
        // Revert on failure
        setAllItems((prevItems) =>
          prevItems.map((i) => (i._id === item._id ? { ...i, status: oldStatus } : i))
        );
        setItems((prevItems) =>
          prevItems.map((i) => (i._id === item._id ? { ...i, status: oldStatus } : i))
        );
      }
    } catch (error) {
      const oldStatus = item.status;
      setAllItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, status: oldStatus } : i))
      );
      setItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, status: oldStatus } : i))
      );
    }
  };

  const handleIsReadChange = async (item: DowryItem, newIsRead: boolean) => {
    try {
      if (!item._id) return;

      // Optimistic update
      setAllItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, isRead: newIsRead } : i))
      );
      setItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, isRead: newIsRead } : i))
      );

      await updateDowry(item._id, { isRead: newIsRead }, true);
    } catch (error) {
      // Revert on failure
      const oldIsRead = item.isRead || false;
      setAllItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, isRead: oldIsRead } : i))
      );
      setItems((prevItems) =>
        prevItems.map((i) => (i._id === item._id ? { ...i, isRead: oldIsRead } : i))
      );
    }
  };

  const handleModalClose = () => {
    setAddModalVisible(false);
    setUpdateModalVisible(false);
    setSelectedItemForUpdate(null);
  };

  const handleModalSuccess = () => {
    loadCategoryItems();
  };

  const openImageModal = async (imageId: string) => {
    const base64Image = await loadImageAsBase64(imageId);
    if (base64Image) {
      setSelectedImage(base64Image);
      setImageModalVisible(true);
    }
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const loadImageAsBase64 = async (imageId: string): Promise<string | null> => {
    try {
      if (imageCache[imageId]) {
        return imageCache[imageId];
      }

      const base64 = await getImage(imageId);
      if (base64) {
        setImageCache((prev) => ({
          ...prev,
          [imageId]: base64,
        }));
        return base64;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const totalItems = allItems.length;
  const purchasedItems = allItems.filter((item) => item.status === 'purchased').length;
  const notPurchasedItems = allItems.filter((item) => item.status === 'not_purchased').length;
  
  // Kitap kategorisi kontrolü
  const isBookCategory = getCurrentCategoryIcon() === 'book';

  // Toplam fiyat hesaplamaları (kategori bazlı)
  const totalPrice = allItems.reduce((sum, item) => sum + (item.dowryPrice || 0), 0);
  const purchasedPrice = allItems
    .filter((item) => item.status === 'purchased')
    .reduce((sum, item) => sum + (item.dowryPrice || 0), 0);
  const notPurchasedPrice = allItems
    .filter((item) => item.status === 'not_purchased')
    .reduce((sum, item) => sum + (item.dowryPrice || 0), 0);

  // Show loading while checking auth
  if (authLoading || (!user && localStorage.getItem('token'))) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8E1' }}>
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8E1' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 shadow-xl"
        style={{ backgroundColor: categoryColor }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-white text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-white flex-1 text-center drop-shadow-md">
          {categoryTitle}
        </h1>
        <div className="flex items-center gap-2">
          {!isBookCategory && (
            <button
              onClick={toggleSortOrder}
              className="p-2 hover:bg-white/20 rounded-full transition-colors relative"
              title={sortOrder === 'none' ? 'Sıralama yok' : sortOrder === 'asc' ? 'Artan fiyat' : 'Azalan fiyat'}
            >
              <FontAwesomeIcon 
                icon={sortOrder === 'desc' ? faSortAmountDown : faSortAmountUp} 
                className="text-white text-xl" 
                style={{ opacity: sortOrder === 'none' ? 0.5 : 1 }}
              />
            </button>
          )}
          <button
            onClick={() => setAddModalVisible(true)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-white text-xl" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mt-5">
        <div className="flex gap-2 items-center">
          <div
            className="bg-white rounded-xl p-3 shadow-lg flex items-center border-2 flex-1 min-w-0"
            style={{ borderColor: '#FFB300' }}
          >
            <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Eşya ara"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 outline-none text-base min-w-0"
              style={{ color: '#8B4513' }}
            />
          </div>
          
          {/* Read Status Filter - Only for book category */}
          {isBookCategory && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowReadDropdown(!showReadDropdown)}
                className="bg-white rounded-xl px-3 py-3 shadow-lg border-2 outline-none font-semibold text-xs cursor-pointer flex items-center gap-2"
                style={{ 
                  borderColor: '#FFB300', 
                  color: '#8B4513',
                  minWidth: '100px'
                }}
              >
                <span>
                  {isReadFilter === 'all' ? 'Tümü' : isReadFilter === 'read' ? 'Okundu' : 'Okunmadı'}
                </span>
                <FontAwesomeIcon 
                  icon={faChevronDown}
                  className={`transition-transform duration-200 ${showReadDropdown ? 'rotate-180' : ''}`}
                  style={{ color: '#FFB300', fontSize: '10px' }}
                />
              </button>
              
              {showReadDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowReadDropdown(false)}
                  />
                  <div 
                    className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 overflow-hidden z-20"
                    style={{ borderColor: '#FFB300', minWidth: '140px' }}
                  >
                    <button
                      onClick={() => {
                        setIsReadFilter('all');
                        setShowReadDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left font-semibold text-xs hover:bg-yellow-50 transition-colors"
                      style={{ 
                        color: '#8B4513',
                        backgroundColor: isReadFilter === 'all' ? '#FFF8E1' : 'white'
                      }}
                    >
                      Tümü
                    </button>
                    <div style={{ height: '1px', backgroundColor: '#FFE082' }} />
                    <button
                      onClick={() => {
                        setIsReadFilter('read');
                        setShowReadDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left font-semibold text-xs hover:bg-blue-50 transition-colors"
                      style={{ 
                        color: isReadFilter === 'read' ? '#2196F3' : '#8B4513',
                        backgroundColor: isReadFilter === 'read' ? '#E3F2FD' : 'white'
                      }}
                    >
                      Okundu
                    </button>
                    <div style={{ height: '1px', backgroundColor: '#FFE082' }} />
                    <button
                      onClick={() => {
                        setIsReadFilter('unread');
                        setShowReadDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left font-semibold text-xs hover:bg-gray-100 transition-colors"
                      style={{ 
                        color: isReadFilter === 'unread' ? '#757575' : '#8B4513',
                        backgroundColor: isReadFilter === 'unread' ? '#F5F5F5' : 'white'
                      }}
                    >
                      Okunmadı
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className="bg-white p-4 rounded-2xl text-center shadow-lg border-2 transition-all"
            style={{ 
              borderColor: statusFilter === 'all' ? categoryColor : '#FFB300',
              transform: statusFilter === 'all' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: statusFilter === 'all' ? '0 10px 25px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <p className="text-2xl font-bold" style={{ color: '#253d50' }}>
              {totalItems}
            </p>
            <p className="text-xs font-bold mt-1" style={{ color: '#253d50' }}>
              {isBookCategory ? 'Toplam' : 'Toplam Eşya'}
            </p>
            <p className="text-sm font-bold mt-2" style={{ color: categoryColor }}>
              ₺{totalPrice.toLocaleString('tr-TR')}
            </p>
          </button>
          <button
            onClick={() => setStatusFilter('purchased')}
            className="bg-white p-4 rounded-2xl text-center shadow-lg border-2 transition-all"
            style={{ 
              borderColor: statusFilter === 'purchased' ? categoryColor : '#FFB300',
              transform: statusFilter === 'purchased' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: statusFilter === 'purchased' ? '0 10px 25px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <p className="text-2xl font-bold" style={{ color: '#253d50' }}>
              {purchasedItems}
            </p>
            <p className="text-xs font-bold mt-1" style={{ color: '#253d50' }}>
              Alınan
            </p>
            {isBookCategory ? (
              <div className="text-[9px] font-medium mt-2 text-gray-600 leading-tight">
                <div className="mb-0.5">
                  Okunan: <span className="text-blue-500 font-semibold">{allItems.filter(item => item.status === 'purchased' && item.isRead).length}</span>
                </div>
                <div>
                  Okunmayan: <span className="font-semibold">{allItems.filter(item => item.status === 'purchased' && !item.isRead).length}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold mt-2" style={{ color: '#4CAF50' }}>
                ₺{purchasedPrice.toLocaleString('tr-TR')}
              </p>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('not_purchased')}
            className="bg-white p-4 rounded-2xl text-center shadow-lg border-2 transition-all"
            style={{ 
              borderColor: statusFilter === 'not_purchased' ? categoryColor : '#FFB300',
              transform: statusFilter === 'not_purchased' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: statusFilter === 'not_purchased' ? '0 10px 25px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <p className="text-2xl font-bold" style={{ color: '#253d50' }}>
              {notPurchasedItems}
            </p>
            <p className="text-xs font-bold mt-1" style={{ color: '#253d50' }}>
              Alınmayan
            </p>
            {!isBookCategory && (
              <p className="text-sm font-bold mt-2" style={{ color: '#8B4513' }}>
                ₺{notPurchasedPrice.toLocaleString('tr-TR')}
              </p>
            )}
          </button>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
            <p className="mt-4 text-lg font-bold" style={{ color: '#8B4513' }}>
              Eşyalar yükleniyor...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-6xl mb-4"
              style={{ color: '#8B4513' }}
            />
            <p className="text-lg font-bold text-center mb-8" style={{ color: '#8B4513' }}>
              {error}
            </p>
            <button
              onClick={() => loadCategoryItems()}
              className="px-8 py-3 rounded-full font-bold text-white shadow-xl border-2 border-white"
              style={{ backgroundColor: '#FFB300' }}
            >
              Tekrar Dene
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FontAwesomeIcon icon={faCube} className="text-6xl text-gray-300 mb-4" />
            <p className="text-lg font-bold text-center mb-8" style={{ color: '#8B4513' }}>
              {allItems.length === 0
                ? 'Bu kategoride henüz eşya bulunmuyor'
                : 'Filtreye uygun eşya bulunamadı'}
            </p>
            {allItems.length === 0 ? (
              <button
                onClick={() => setAddModalVisible(true)}
                className="px-8 py-3 rounded-full font-bold text-white shadow-xl border-2 border-white"
                style={{ backgroundColor: '#FFB300' }}
              >
                İlk Eşyayı Ekle
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('all');
                  setIsReadFilter('all');
                }}
                className="px-8 py-3 rounded-full font-bold text-white shadow-xl border-2 border-white"
                style={{ backgroundColor: '#FFB300' }}
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id || item.name}
                className="bg-white rounded-2xl p-5 border-2 shadow-md"
                style={{ borderColor: '#FFB300' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center flex-1">
                    {/* Resim veya placeholder ikon */}
                    <div className="w-12 h-12 rounded-lg border-2 mr-3 shadow-sm flex items-center justify-center" style={{ borderColor: categoryColor, backgroundColor: '#FFF8E1' }}>
                      {(item.imageId || item.dowryImage) ? (
                        <button
                          onClick={() => openImageModal(item.imageId || item.dowryImage!)}
                          className="w-full h-full rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={
                              imageCache[item.imageId || item.dowryImage!] ||
                              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
                            }
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Resim yüklenemezse placeholder ikon göster
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <FontAwesomeIcon 
                            icon={getIconByName(getCurrentCategoryIcon())} 
                            className="hidden text-lg" 
                            style={{ color: categoryColor }}
                          />
                        </button>
                      ) : (
                        <FontAwesomeIcon 
                          icon={getIconByName(getCurrentCategoryIcon())} 
                          className="text-lg" 
                          style={{ color: categoryColor }}
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-bold flex-1" style={{ color: '#8B4513' }}>
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* Purchase Status Switch */}
                    <button
                      onClick={() => handleStatusChange(item, item.status !== 'purchased')}
                      className="relative flex items-center rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                      style={{
                        width: '95px',
                        height: '34px',
                        backgroundColor: item.status === 'purchased' ? '#4CAF50' : '#8B4513',
                      }}
                    >
                      {/* Switch Circle */}
                      <div
                        className="absolute w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
                        style={{
                          left: item.status === 'purchased' ? 'calc(100% - 32px)' : '5px',
                        }}
                      />
                      
                      {/* Status Text */}
                      <span 
                        className="absolute text-[11px] font-bold text-white transition-all duration-300"
                        style={{
                          left: item.status === 'purchased' ? '10px' : 'auto',
                          right: item.status === 'purchased' ? 'auto' : '10px',
                        }}
                      >
                        {item.status === 'purchased' ? 'Alındı' : 'Alınmadı'}
                      </span>
                    </button>
                    
                    {/* Read Status Switch - Only for purchased books */}
                    {getCurrentCategoryIcon() === 'book' && item.status === 'purchased' && (
                      <button
                        onClick={() => handleIsReadChange(item, !item.isRead)}
                        className="relative flex items-center rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                        style={{
                          width: '95px',
                          height: '34px',
                          backgroundColor: item.isRead ? '#2196F3' : '#757575',
                        }}
                      >
                        {/* Switch Circle */}
                        <div
                          className="absolute w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
                          style={{
                            left: item.isRead ? 'calc(100% - 32px)' : '5px',
                          }}
                        />
                        
                        {/* Read Status Text */}
                        <span 
                          className="absolute text-[10px] font-bold text-white transition-all duration-300"
                          style={{
                            left: item.isRead ? '8px' : 'auto',
                            right: item.isRead ? 'auto' : '6px',
                          }}
                        >
                          {item.isRead ? 'Okundu' : 'Okunmadı'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm mb-4 opacity-80" style={{ color: '#8B4513' }}>
                  {item.description}
                </p>

                {/* Details */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faTag} className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium" style={{ color: '#8B4513' }}>
                      Fiyat: ₺{item.dowryPrice?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {item.dowryLocation && (
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 mr-2" />
                      <span className="text-sm font-medium" style={{ color: '#8B4513' }}>
                        Konum: {item.dowryLocation}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: '#FFB300' }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: '#8B4513' }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModalVisible && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
          style={{
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideIn {
              from { 
                opacity: 0; 
                transform: scale(0.95); 
              }
              to { 
                opacity: 1; 
                transform: scale(1); 
              }
            }
          `}</style>
          
          <div 
            className="relative w-full max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all duration-200 z-10"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>

            {/* Image Container */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
              {/* Loading overlay */}
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500 text-sm">Yükleniyor...</span>
                </div>
              </div>
              
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-contain max-h-[85vh]"
                onLoad={(e) => {
                  // Resim yüklendiğinde loading overlay'i gizle
                  e.currentTarget.parentElement?.querySelector('.absolute')?.classList.add('hidden');
                }}
                onError={(e) => {
                  // Hata durumunda loading overlay'i gizle ve hata mesajı göster
                  const overlay = e.currentTarget.parentElement?.querySelector('.absolute');
                  if (overlay) {
                    overlay.innerHTML = `
                      <div class="flex flex-col items-center gap-3 text-red-500">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="text-sm">Resim yüklenemedi</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Dowry Modal */}
      <AddDowryModal
        visible={addModalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={categoryId}
        categories={categories}
      />

      {/* Update Dowry Modal */}
      <UpdateDowryModal
        visible={updateModalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        item={selectedItemForUpdate}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Eşyayı Sil"
        message="Bu eşyayı silmek istediğinizden emin misiniz?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogVisible(false);
          setItemToDelete(null);
        }}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Category;