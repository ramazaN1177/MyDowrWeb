import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faImage,
  faCheckCircle,
  faTimesCircle,
  faSave,
  faLock,
  faTag,
  faWallet,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useDowry } from '../hooks/useDowry';
import Input from './Input';


interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

interface DowryItem {
  _id?: string;
  name: string;
  description: string;
  dowryPrice: number;
  dowryLocation?: string;
  status: 'purchased' | 'not_purchased';
  Category: string;
  imageId?: string;
  dowryImage?: string;
}

interface UpdateDowryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: DowryItem | null;
  categories?: Category[];
}

export default function UpdateDowryModal({ visible, onClose, onSuccess, item, categories = [] }: UpdateDowryModalProps) {
  const { updateDowry, getImage, loading } = useDowry();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dowryPrice: '',
    dowryLocation: '',
    status: 'not_purchased' as 'purchased' | 'not_purchased'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load existing dowry data from props
  useEffect(() => {
    if (visible && item) {
      loadDowryData();
    }
  }, [visible, item]);

  const loadDowryData = async () => {
    if (!item) return;
    
    try {
      setIsLoading(true);
      
      setFormData({
        name: item.name || '',
        description: item.description || '',
        dowryPrice: item.dowryPrice?.toString() || '',
        dowryLocation: item.dowryLocation || '',
        status: item.status || 'not_purchased'
      });
      
      setSelectedCategory(item.Category || '');
      
      // Load existing image if available
      if (item.imageId || item.dowryImage) {
        const imageId = item.imageId || item.dowryImage;
        if (imageId) {
          const imageData = await getImage(imageId);
          if (imageData) {
            setImagePreview(imageData);
          }
        }
      } else {
        setImagePreview(null);
      }
    } catch (error) {
      toast.error('Eşya bilgileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - sadece kategori ve isim zorunlu
    if (!selectedCategory) {
      toast.error('Kategori bilgisi bulunamadı');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Eşya adı gereklidir');
      return;
    }

    // Fiyat girildiyse kontrol et
    if (formData.dowryPrice.trim()) {
      const price = parseFloat(formData.dowryPrice);
      if (isNaN(price) || price < 0) {
        toast.error('Geçerli bir fiyat giriniz');
        return;
      }
    }

    try {
      // Update dowry data - sadece güncellenebilir alanlar
      const dowryData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        dowryPrice: formData.dowryPrice.trim() ? parseFloat(formData.dowryPrice) : 0,
        dowryLocation: formData.dowryLocation.trim() || undefined,
        status: formData.status
      };

      if (item?._id) {
        await updateDowry(item._id, dowryData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'purchased' ? 'not_purchased' : 'purchased'
    }));
  };


  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#FFB300' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#8B4513' }}>
            Eşyayı Düzenle
          </h2>
          <button
            onClick={onClose}
            disabled={loading || isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" style={{ color: '#8B4513' }} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-lg font-bold" style={{ color: '#8B4513' }}>
                Yükleniyor...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Category Display (Read Only) */}
              <div className="mb-4">
                <label className="block text-lg font-bold mb-3" style={{ color: '#8B4513' }}>
                  Kategori
                </label>
                
                <div 
                  className="flex items-center p-3 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: '#F5F5F5', 
                    borderColor: '#FFB300' 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#FFB300' }}
                    >
                      <FontAwesomeIcon 
                        icon={faLock} 
                        className="text-lg text-white"
                      />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#8B4513' }}>
                        {categories.find(cat => cat.id === selectedCategory)?.title || 'Kategori'}
                      </p>
                      <p className="text-[10px] text-gray-500">Değiştirilemez</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Display (Read Only) */}
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFB300' }}>
                <h3 className="text-lg font-bold text-center mb-3" style={{ color: '#8B4513' }}>
                  Fotoğraf
                </h3>
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={imagePreview} 
                      alt="Item" 
                      className="w-40 h-32 object-cover rounded-xl border-2" 
                      style={{ borderColor: '#FFB300' }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-32 border-2 border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: '#FFB300', backgroundColor: '#FFF' }}>
                      <FontAwesomeIcon icon={faImage} className="text-3xl" style={{ color: '#CCC' }} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Fotoğraf yok</p>
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Eşya Adı *"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Örn: Bulaşık Makinesi"
                  leftIcon={<FontAwesomeIcon icon={faTag} />}
                  disabled={loading}
                  focusBackground={true}
                  size="md"
                />

                <Input
                  label="Fiyat (₺)"
                  type="number"
                  value={formData.dowryPrice}
                  onChange={(e) => handleInputChange('dowryPrice', e.target.value)}
                  placeholder="0"
                  leftIcon={<FontAwesomeIcon icon={faWallet} />}
                  disabled={loading}
                  focusBackground={true}
                  size="md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: '#8B4513' }}>
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Eşya hakkında detaylı bilgi"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors resize-none"
                  style={{ borderColor: '#FFB300' }}
                  disabled={loading}
                />
              </div>

              <Input
                label="Konum"
                type="text"
                value={formData.dowryLocation}
                onChange={(e) => handleInputChange('dowryLocation', e.target.value)}
                placeholder="Örn: İstanbul, Türkiye"
                leftIcon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
                disabled={loading}
                focusBackground={true}
                size="md"
              />

              <div className="mb-4 mt-4">
                <label className="block text-sm font-bold mb-2" style={{ color: '#8B4513' }}>
                  Durum
                </label>
                <button
                  type="button"
                  onClick={toggleStatus}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 font-bold text-white transition-all"
                  style={{
                    backgroundColor: formData.status === 'purchased' ? '#4CAF50' : '#8B4513',
                    borderColor: '#FFB300'
                  }}
                  disabled={loading}
                >
                  <FontAwesomeIcon 
                    icon={formData.status === 'purchased' ? faCheckCircle : faTimesCircle}
                  />
                  <span>{formData.status === 'purchased' ? 'Alındı' : 'Alınmadı'}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t rounded-b-3xl" style={{ borderColor: '#FFE082', backgroundColor: '#FFF8E1' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border-2 bg-white font-bold text-lg transition-all hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: '#E0E0E0', color: '#8B4513' }}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: loading || !formData.name.trim()
                    ? '#CCC'
                    : 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
