import { useState, useEffect, useRef } from 'react';
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
  faCrop,
  faLink,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useDowry } from '../hooks/useDowry';
import { useBook } from '../hooks/useBook';
import Input from './Input';
import ReactCrop from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


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
  isRead?: boolean;
  url?: string;
}

interface UpdateDowryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: DowryItem | null;
  categories?: Category[];
}

export default function UpdateDowryModal({ visible, onClose, onSuccess, item, categories = [] }: UpdateDowryModalProps) {
  const { updateDowry, getImage, updateDowryImage, removeDowryImage, loading: dowryLoading } = useDowry();
  const { updateBook, loading: bookLoading } = useBook();
  const loading = dowryLoading || bookLoading;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dowryPrice: '',
    dowryLocation: '',
    url:'',
    status: 'not_purchased' as 'purchased' | 'not_purchased'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  
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
        url: item.url || '',
        status: item.status || 'not_purchased'
      });
      
      setSelectedCategory(item.Category || '');
      setNewImageFile(null);
      setImageChanged(false);
      setImageRemoved(false);
      setShowCropModal(false);
      setTempImageSrc('');
      setCompletedCrop(null);
      
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen geçerli bir resim dosyası seçin');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Resim boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Show crop modal instead of direct preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewImageFile(null);
    setImagePreview(null);
    setImageChanged(true);
    setImageRemoved(true);
    setShowCropModal(false);
    setTempImageSrc('');
    setCompletedCrop(null);
  };

  // Kırpılmış resmi canvas'a çiz ve File'a çevir
  const getCroppedImage = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
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
      setNewImageFile(croppedFile);
      setImageChanged(true);
      setImageRemoved(false); // Yeni resim eklendi, kaldırıldı durumunu sıfırla
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
      setShowCropModal(false);
      setTempImageSrc('');
      setCompletedCrop(null);
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
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      if (input) input.value = '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) {
      return;
    }

    // Validation - sadece kategori ve isim zorunlu
    if (!selectedCategory) {
      toast.error('Kategori bilgisi bulunamadı');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Eşya adı gereklidir');
      return;
    }

    // Check if category is book
    const category = categories.find(cat => cat.id === selectedCategory);
    const isBookCategory = category?.icon === 'book';

    // Fiyat girildiyse kontrol et (only for non-book categories)
    if (!isBookCategory && formData.dowryPrice.trim()) {
      const price = parseFloat(formData.dowryPrice);
      if (isNaN(price) || price < 0) {
        toast.error('Geçerli bir fiyat giriniz');
        return;
      }
    }

    try {
      if (item?._id) {
        if (isBookCategory) {
          // Update book
          const bookData: any = {
            name: formData.name.trim(),
            author: formData.description.trim() || undefined,
            status: formData.status,
            isRead: item?.isRead
          };
          await updateBook(item._id, bookData);
        } else {
          // Update dowry data - sadece güncellenebilir alanlar
          const dowryData: any = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            dowryPrice: formData.dowryPrice.trim() ? parseFloat(formData.dowryPrice) : 0,
            dowryLocation: formData.dowryLocation.trim() || undefined,
            url: formData.url.trim() || undefined,
            status: formData.status,
          };
          await updateDowry(item._id, dowryData);

          // Handle image changes
          if (imageChanged) {
            if (imageRemoved && !newImageFile) {
              // Resim kaldırıldı ve yeni resim yok - mevcut resmi sil
              if (item._id) {
                await removeDowryImage(item._id);
              }
            } else if (newImageFile) {
              // Yeni resim var - güncelle
              await updateDowryImage(item._id, newImageFile);
            }
          }
        }
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

              {/* Check if category is book */}
              {(() => {
                const category = categories.find(cat => cat.id === selectedCategory);
                const isBookCategory = category?.icon === 'book';

                return (
                  <>
                    {/* Image Upload/Display - Hide for books */}
                    {!isBookCategory && (
                      <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFB300' }}>
                        <h3 className="text-lg font-bold text-center mb-3" style={{ color: '#8B4513' }}>
                          Fotoğraf
                        </h3>
                        {imagePreview ? (
                          <div className="flex flex-col items-center gap-3">
                            <img 
                              src={imagePreview} 
                              alt="Item" 
                              className="w-40 h-32 object-contain rounded-xl border-2" 
                              style={{ borderColor: '#FFB300' }}
                            />
                            <div className="flex gap-2">
                              <label className="cursor-pointer px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:shadow-md" style={{ background: 'linear-gradient(90deg, #FFB300 0%, #F57C00 100%)' }}>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageSelect}
                                  className="hidden"
                                  disabled={loading}
                                />
                                Değiştir
                              </label>
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:shadow-md"
                                style={{ backgroundColor: '#8B4513' }}
                              >
                                Kaldır
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <label className="cursor-pointer">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={loading}
                              />
                              <div className="w-40 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:bg-white transition-colors" style={{ borderColor: '#FFB300', backgroundColor: '#FFF' }}>
                                <FontAwesomeIcon icon={faImage} className="text-3xl mb-2" style={{ color: '#FFB300' }} />
                                <p className="text-sm font-semibold" style={{ color: '#8B4513' }}>Fotoğraf Ekle</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        label={isBookCategory ? "Kitap Adı *" : "Eşya Adı *"}
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={isBookCategory ? "Örn: Suç ve Ceza" : "Örn: Bulaşık Makinesi"}
                        leftIcon={<FontAwesomeIcon icon={faTag} />}
                        disabled={loading}
                        focusBackground={true}
                        size="md"
                      />

                      {!isBookCategory && (
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
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2" style={{ color: '#8B4513' }}>
                        {isBookCategory ? "Yazar" : "Açıklama"}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={isBookCategory ? "Yazar adı" : "Eşya hakkında detaylı bilgi"}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors resize-none"
                        style={{ borderColor: '#FFB300' }}
                        disabled={loading}
                      />
                    </div>

                    {!isBookCategory && (
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
                    )}
                       {!isBookCategory && (
                      <Input
                        label="URL"
                        type="text"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        placeholder="Örn: https://www.google.com"
                        leftIcon={<FontAwesomeIcon icon={faLink} />}
                        disabled={loading}
                        focusBackground={true}
                        size="md"
                      />
                    )}

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
                  </>
                );
              })()}
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
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#FFB300' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#8B4513' }}>
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
