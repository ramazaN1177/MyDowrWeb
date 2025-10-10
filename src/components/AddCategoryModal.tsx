import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useCategory } from '../hooks/useCategory';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Predefined icons for category selection
const AVAILABLE_ICONS = [
  { icon: faUtensils, name: 'utensils', label: 'Mutfak' },
  { icon: faBed, name: 'bed', label: 'Yatak Odası' },
  { icon: faTv, name: 'tv', label: 'Salon' },
  { icon: faBath, name: 'bath', label: 'Banyo' },
  { icon: faChild, name: 'child', label: 'Çocuk Odası' },
  { icon: faDesktop, name: 'desktop', label: 'Ofis' },
  { icon: faBook, name: 'book', label: 'Kütüphane' },
  { icon: faCar, name: 'car', label: 'Araba' },
  { icon: faShirt, name: 'shirt', label: 'Giyim' },
  { icon: faMusic, name: 'music', label: 'Müzik' },
  { icon: faGamepad, name: 'gamepad', label: 'Oyun' },
  { icon: faDumbbell, name: 'dumbbell', label: 'Spor' },
  { icon: faBriefcaseMedical, name: 'briefcase-medical', label: 'Sağlık' },
  { icon: faGraduationCap, name: 'graduation-cap', label: 'Eğitim' },
  { icon: faBriefcase, name: 'briefcase', label: 'İş' },
  { icon: faHome, name: 'home', label: 'Ev' },
  { icon: faLeaf, name: 'leaf', label: 'Bahçe' },
  { icon: faCoffee, name: 'coffee', label: 'Kafe' },
  { icon: faStore, name: 'store', label: 'Mağaza' },
  { icon: faPlane, name: 'plane', label: 'Seyahat' },
  { icon: faCamera, name: 'camera', label: 'Fotoğraf' },
  { icon: faMobileAlt, name: 'mobile-alt', label: 'Teknoloji' },
  { icon: faGem, name: 'gem', label: 'Mücevher' },
  { icon: faGift, name: 'gift', label: 'Hediye' },
  { icon: faHeart, name: 'heart', label: 'Aşk' },
  { icon: faStar, name: 'star', label: 'Yıldız' },
  { icon: faSeedling, name: 'seedling', label: 'Çiçek' },
  { icon: faGlobe, name: 'globe', label: 'Doğa' },
  { icon: faEllipsisH, name: 'ellipsis-h', label: 'Diğer' },
];

export default function AddCategoryModal({ visible, onClose, onSuccess }: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const { createCategory, loading } = useCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('Kategori adı boş olamaz');
      return;
    }

    if (!selectedIcon) {
      toast.error('Lütfen bir ikon seçin');
      return;
    }

    try {
      await createCategory(categoryName.trim(), selectedIcon);
      setCategoryName('');
      setSelectedIcon('');
      onSuccess();
      onClose();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCategoryName('');
      setSelectedIcon('');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-5"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold" style={{ color: '#8B4513' }}>
            Yeni Kategori Ekle
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" style={{ color: '#8B4513' }} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Category Name Input */}
            <div className="mb-6">
              <label className="block text-lg font-bold mb-3" style={{ color: '#8B4513' }}>
                Kategori Adı
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Kategori adını girin"
                maxLength={50}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '16px' }}
              />
              <p className="text-sm text-gray-500 mt-1">
                {categoryName.length}/50 karakter
              </p>
            </div>

            {/* Icon Selection */}
            <div className="mb-4">
              <label className="block text-lg font-bold mb-3" style={{ color: '#8B4513' }}>
                İkon Seçin
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {AVAILABLE_ICONS.map((iconItem) => (
                  <button
                    key={iconItem.name}
                    type="button"
                    onClick={() => setSelectedIcon(iconItem.name)}
                    disabled={loading}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-200 p-1.5
                      ${
                        selectedIcon === iconItem.name
                          ? 'bg-yellow-500 border-yellow-800'
                          : 'bg-gray-100 border-transparent hover:border-gray-300'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <FontAwesomeIcon
                      icon={iconItem.icon}
                      className={`text-lg ${
                        selectedIcon === iconItem.name ? 'text-white' : 'text-yellow-800'
                      }`}
                    />
                    <span
                      className={`text-[9px] font-medium text-center px-0.5 mt-0.5 leading-tight ${
                        selectedIcon === iconItem.name ? 'text-white' : 'text-yellow-900'
                      }`}
                    >
                      {iconItem.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 bg-gray-100 font-bold text-lg transition-all hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: '#8B4513' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!categoryName.trim() || !selectedIcon || loading}
              className="flex-1 py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              style={{
                background:
                  !categoryName.trim() || !selectedIcon || loading
                    ? undefined
                    : 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Ekleniyor...
                </span>
              ) : (
                'Kategori Ekle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

