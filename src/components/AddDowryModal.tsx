import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faFolder,
  faImage,
  faCamera,
  faCheckCircle,
  faTimesCircle,
  faPlusCircle,
  faLock,
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
  faMobileAlt,
  faGem,
  faGift,
  faHeart,
  faStar,
  faSeedling,
  faGlobe,
  faEllipsisH,
  faTag,
  faWallet,
  faMapMarkerAlt,
  faCrop,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useDowry } from '../hooks/useDowry';
import Input from './Input';
import ReactCrop from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

interface AddDowryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: string;
  categories?: Category[];
}

export default function AddDowryModal({ visible, onClose, onSuccess, category, categories = [] }: AddDowryModalProps) {
  const { uploadImage, createDowry, addBooks, loading } = useDowry();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dowryPrice: '',
    dowryLocation: '',
    status: 'not_purchased' as 'purchased' | 'not_purchased'
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(category === 'select' ? '' : (category || ''));
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isCategoryLocked, setIsCategoryLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Book bulk add states
  const [bookText, setBookText] = useState('');
  const isBookCategory = categories.find(cat => cat.id === selectedCategory)?.icon === 'book';
  
  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setFormData({
        name: '',
        description: '',
        dowryPrice: '',
        dowryLocation: '',
        status: 'not_purchased'
      });
      setSelectedImage(null);
      setImagePreview(null);
      setBookText(''); // Reset book text
      
      // Kategori varsa ve 'select' değilse, otomatik seç ve kilitle
      const hasValidCategory = Boolean(category && category !== 'select' && category !== '');
      setSelectedCategory(hasValidCategory ? category! : '');
      setIsCategoryLocked(hasValidCategory);
    }
  }, [visible, category]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 7 * 1024 * 1024) { // 7 MB limit
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen bir resim dosyası seçin');
        return;
      }

      // Resmi kırpmak için modal aç
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Kırpılmış resmi canvas'a çiz ve File'a çevir
  const getCroppedImage = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  // Kırpma işlemini onayla
  const handleCropComplete = async () => {
    const croppedFile = await getCroppedImage();
    if (croppedFile) {
      setSelectedImage(croppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
      setShowCropModal(false);
      setTempImageSrc('');
    } else {
      toast.error('Resim kırpılamadı');
    }
  };

  // Kırpma işlemini iptal et
  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageSrc('');
    setCompletedCrop(null);
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - sadece kategori zorunlu
    if (!selectedCategory) {
      toast.error('Lütfen bir kategori seçiniz');
      return;
    }

    if (categories.length === 0) {
      toast.error('Kategoriler yükleniyor, lütfen bekleyiniz');
      return;
    }

    // Kitap kategorisi ise
    if (isBookCategory) {
      if (!bookText.trim()) {
        toast.error('Lütfen kitap listesi giriniz');
        return;
      }

      try {
        await addBooks(bookText, selectedCategory);
        onSuccess();
        onClose();
      } catch (error) {
        // Error already handled in hook
      }
      return;
    }

    // Normal eşya için validasyon
    if (!formData.name.trim()) {
      toast.error('Eşya adı gereklidir');
      return;
    }

    // Fiyat girildiyse kontrol et
    let price = 0;
    if (formData.dowryPrice.trim()) {
      price = parseFloat(formData.dowryPrice);
      if (isNaN(price) || price < 0) {
        toast.error('Geçerli bir fiyat giriniz');
        return;
      }
    }

    try {
      // Upload image if selected
      let imageId = '';
      if (selectedImage) {
        imageId = await uploadImage(selectedImage) || '';
        if (!imageId) {
          return; // Error already shown by uploadImage
        }
      }

      // Find category ID
      let apiCategory;
      if (isCategoryLocked && category && category !== 'select') {
        apiCategory = category;
      } else {
        apiCategory = selectedCategory;
      }

      // Create dowry data
      const dowryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        Category: apiCategory,
        dowryPrice: price,
        imageId: imageId || undefined,
        dowryLocation: formData.dowryLocation.trim() || undefined,
        status: formData.status
      };

      await createDowry(dowryData);
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

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryPicker(false);
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
            {isBookCategory ? 'Kitap Ekle' : 'Yeni Eşya Ekle'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" style={{ color: '#8B4513' }} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-lg font-bold mb-3" style={{ color: '#8B4513' }}>
                Kategori *
              </label>
              
              {selectedCategory ? (
                <div 
                  className="flex items-center justify-between p-3 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: isCategoryLocked ? '#F5F5F5' : '#FFF8E1', 
                    borderColor: '#FFB300' 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#FFB300' }}
                    >
                      <FontAwesomeIcon 
                        icon={isCategoryLocked ? faLock : faFolder} 
                        className="text-lg text-white"
                      />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#8B4513' }}>
                        {categories.find(cat => cat.id === selectedCategory)?.title || 'Kategori'}
                      </p>
                      {isCategoryLocked && (
                        <p className="text-[10px] text-gray-500">Kilitli</p>
                      )}
                    </div>
                  </div>
                  {!isCategoryLocked && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('')}
                      className="p-1.5 hover:bg-yellow-200 rounded-full transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="text-lg" style={{ color: '#8B4513' }} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(true)}
                  disabled={isCategoryLocked}
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all hover:bg-yellow-50 hover:border-solid disabled:opacity-50 flex items-center justify-between"
                  style={{ borderColor: '#FFB300' }}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFolder} className="text-lg" style={{ color: '#FFB300' }} />
                    <span className="font-semibold" style={{ color: '#8B4513' }}>
                      Kategori Seçmek İçin Tıklayın
                    </span>
                  </div>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-gray-300" />
                </button>
              )}
            </div>

            {/* Book Category - Show only textarea */}
            {isBookCategory ? (
              <div className="mb-4">
                <label className="block text-lg font-bold mb-3" style={{ color: '#8B4513' }}>
                  Kitap Listesi *
                </label>
                <div className="p-4 rounded-xl mb-3" style={{ backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFB300' }}>
                  <p className="text-sm mb-2" style={{ color: '#8B4513' }}>
                    <strong>Format:</strong> Her satıra bir kitap yazın. Format: <code>Yazar – Kitap Adı</code>
                  </p>
                  <p className="text-xs text-gray-600">
                    Örnek: William Shakespeare – Romeo ve Juliet
                  </p>
                </div>
                <textarea
                  value={bookText}
                  onChange={(e) => setBookText(e.target.value)}
                  placeholder="William Shakespeare – Romeo ve Juliet&#10;Fyodor M. Dostoyevski – Yeraltından Notlar&#10;Oscar Wilde – Dorian Gray'in Portresi"
                  rows={15}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors resize-none font-sans text-xs leading-relaxed"
                  style={{ borderColor: '#FFB300' }}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {bookText.split('\n').filter(line => line.trim()).length} kitap girildi
                </p>
              </div>
            ) : (
              <>
                {/* Image Upload Section */}
                <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFB300' }}>
                  <h3 className="text-lg font-bold text-center mb-3" style={{ color: '#8B4513' }}>
                    Eşya Fotoğrafı
                  </h3>
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Preview" className="w-40 h-32 object-contain rounded-xl mb-3 border-2" style={{ borderColor: '#FFB300' }} />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:shadow-lg text-xs"
                          style={{ backgroundColor: '#FFB300' }}
                        >
                          <FontAwesomeIcon icon={faCamera} className="text-sm" />
                          <span>Kamera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:shadow-lg text-xs"
                          style={{ backgroundColor: '#8B4513' }}
                        >
                          <FontAwesomeIcon icon={faImage} className="text-sm" />
                          <span>Dosya</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Camera Button */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-xl hover:bg-yellow-50 transition-all hover:border-solid"
                        style={{ borderColor: '#FFB300' }}
                      >
                        <FontAwesomeIcon icon={faCamera} className="text-4xl mb-2" style={{ color: '#FFB300' }} />
                        <span className="font-medium text-sm" style={{ color: '#8B4513' }}>Kameradan Çek</span>
                      </button>
                      
                      {/* File Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-xl hover:bg-yellow-50 transition-all hover:border-solid"
                        style={{ borderColor: '#FFB300' }}
                      >
                        <FontAwesomeIcon icon={faImage} className="text-4xl mb-2" style={{ color: '#FFB300' }} />
                        <span className="font-medium text-sm" style={{ color: '#8B4513' }}>Dosya Yükle</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Hidden File Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
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

                <div className="mb-4">
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
              </>
            )}
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
              disabled={loading || !selectedCategory || (isBookCategory ? !bookText.trim() : !formData.name.trim())}
              className="flex-1 py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: loading || !selectedCategory || (isBookCategory ? !bookText.trim() : !formData.name.trim())
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
                  Ekleniyor...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlusCircle} />
                  {isBookCategory ? 'Kitapları Ekle' : 'Eşyayı Ekle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-5"
          onClick={() => setShowCategoryPicker(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#FFB300' }}>
              <h2 className="text-xl font-bold" style={{ color: '#8B4513' }}>
                Kategori Seçiniz
              </h2>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} style={{ color: '#8B4513' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FontAwesomeIcon icon={faFolder} className="text-5xl mb-4" style={{ color: '#FFB300' }} />
                  <p className="text-lg font-bold" style={{ color: '#8B4513' }}>Henüz kategori yok</p>
                  <p className="text-sm text-gray-500 mt-2">Önce bir kategori oluşturun</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const categoryIcon = ICON_MAP[cat.icon] || faFolder;
                    const isSelected = selectedCategory === cat.id;
                    
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat.id)}
                        className={`
                          flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all shadow-md hover:shadow-xl
                          ${isSelected ? 'border-yellow-800' : 'bg-white border-gray-300 hover:border-yellow-500'}
                        `}
                        style={{ backgroundColor: isSelected ? '#FFB300' : 'white' }}
                      >
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                          style={{ backgroundColor: isSelected ? '#FFF' : '#FFF8E1' }}
                        >
                          <FontAwesomeIcon 
                            icon={categoryIcon} 
                            className="text-2xl"
                            style={{ color: isSelected ? '#FFB300' : '#8B4513' }}
                          />
                        </div>
                        <span 
                          className="text-sm font-bold text-center"
                          style={{ color: isSelected ? '#FFF' : '#8B4513' }}
                        >
                          {cat.title}
                        </span>
                        {isSelected && (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white mt-2 text-lg" />
                        )}
                      </button>  
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-5"
          onClick={handleCropCancel}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#FFB300' }}>
              <h2 className="text-xl font-bold" style={{ color: '#8B4513' }}>
                Resmi Kırp
              </h2>
              <button
                onClick={handleCropCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} style={{ color: '#8B4513' }} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50">
              <div className="w-full max-w-2xl">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={undefined}
                >
                  <img
                    ref={imgRef}
                    src={tempImageSrc}
                    alt="Crop"
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t rounded-b-3xl" style={{ borderColor: '#FFE082', backgroundColor: '#FFF8E1' }}>
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 py-2.5 rounded-xl border-2 bg-white font-semibold text-base transition-all hover:bg-gray-50"
                style={{ borderColor: '#E0E0E0', color: '#8B4513' }}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="flex-1 py-2.5 rounded-xl font-semibold text-white text-base shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: !completedCrop
                    ? '#CCC'
                    : 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)',
                }}
              >
                <FontAwesomeIcon icon={faCrop} className="text-sm" />
                <span className="whitespace-nowrap">Kırpmayı Onayla</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

