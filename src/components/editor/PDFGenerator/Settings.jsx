import React, { useState, useEffect } from 'react';
import usePDFStore from '@/store/usePDFStore';

/**
 * PDF Oluşturma Ayarları Bileşeni
 * Kullanıcının PDF oluşturma tercihlerini ayarlamasını sağlar
 */
const Settings = ({ 
  onUpdateSettings,
  description = '',
  author = '',
  headerImage = '',
  pageSize = 'A4',
  orientation = 'portrait',
  schoolName = '',
  schoolLogo = '',
  optimizeForWhatsApp = true,
  grayscalePreview = false
}) => {
  // Store'dan ayarları al
  const {
    pageTitle,
    layoutType,
    setPageTitle,
    setLayoutType,
    positions
  } = usePDFStore();

  // Store'da bulunmayan özellikler için local state tanımla
  const [localDescription, setLocalDescription] = useState(description);
  const [localAuthor, setLocalAuthor] = useState(author);
  const [localHeaderImage, setLocalHeaderImage] = useState(headerImage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [localOrientation, setLocalOrientation] = useState(orientation);
  // Okul bilgileri için local state'ler
  const [localSchoolName, setLocalSchoolName] = useState(schoolName);
  const [localSchoolLogo, setLocalSchoolLogo] = useState(schoolLogo);
  // Optimizasyon ayarları
  const [localOptimizeForWhatsApp, setLocalOptimizeForWhatsApp] = useState(optimizeForWhatsApp);
  const [localGrayscalePreview, setLocalGrayscalePreview] = useState(grayscalePreview);

  // Props değiştiğinde local state'leri güncelle
  useEffect(() => {
    setLocalDescription(description);
    setLocalAuthor(author);
    setLocalHeaderImage(headerImage);
    setLocalPageSize(pageSize);
    setLocalOrientation(orientation);
    setLocalSchoolName(schoolName);
    setLocalSchoolLogo(schoolLogo);
    setLocalOptimizeForWhatsApp(optimizeForWhatsApp);
    setLocalGrayscalePreview(grayscalePreview);
  }, [description, author, headerImage, pageSize, orientation, schoolName, schoolLogo, optimizeForWhatsApp, grayscalePreview]);

  // Başlık değişikliğini yönet
  const handleTitleChange = (e) => {
    setPageTitle(e.target.value);
  };

  // Açıklama değişikliğini yönet
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setLocalDescription(value);
    onUpdateSettings?.({ description: value });
  };

  // Yazar değişikliğini yönet
  const handleAuthorChange = (e) => {
    const value = e.target.value;
    setLocalAuthor(value);
    onUpdateSettings?.({ author: value });
  };

  // Düzen tipi değişikliğini yönet
  const handleLayoutTypeChange = (e) => {
    const value = e.target.value;
    // Eğer mevcut pozisyonlar seçilen düzenden daha fazla ise uyarı ver
    if (parseInt(value) < positions.length) {
      if (!window.confirm(
        `Bu düzen tipi yalnızca ${value} pozisyona izin veriyor, ancak şu anda ${positions.length} pozisyonunuz var. 
        Devam ederseniz, pozisyonlar PDF'te kesilebilir. Devam etmek istiyor musunuz?`
      )) {
        return;
      }
    }
    
    setLayoutType(value);
  };

  // Sayfa boyutu değişikliğini yönet
  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    setLocalPageSize(value);
    onUpdateSettings?.({ pageSize: value });
  };

  // Sayfa yönü değişikliğini yönet
  const handleOrientationChange = (e) => {
    const value = e.target.value;
    setLocalOrientation(value);
    onUpdateSettings?.({ orientation: value });
  };

  // Okul adı değişikliğini yönet
  const handleSchoolNameChange = (e) => {
    const value = e.target.value;
    setLocalSchoolName(value);
    onUpdateSettings?.({ schoolName: value });
  };

  // Okul logosu değişikliğini yönet
  const handleSchoolLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dosya türünü kontrol et
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }
    
    // Dosya boyutunu kontrol et (max 500KB)
    if (file.size > 500 * 1024) {
      alert('Logo dosyası 500KB\'dan küçük olmalıdır.');
      return;
    }
    
    // Resmi Base64'e dönüştür ve boyutlandır
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Maksimum boyutlar
        const maxWidth = 200;
        const maxHeight = 100;
        
        // Oranları hesapla
        let width = img.width;
        let height = img.height;
        
        // En-boy oranını koru
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
        
        // Canvas oluştur ve resmi yeniden boyutlandır
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Yeniden boyutlandırılmış resmi base64 formatına dönüştür
        const resizedImageDataUrl = canvas.toDataURL(file.type);
        
        setLocalSchoolLogo(resizedImageDataUrl);
        onUpdateSettings?.({ schoolLogo: resizedImageDataUrl });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Okul logosunu kaldır
  const handleRemoveSchoolLogo = () => {
    setLocalSchoolLogo('');
    onUpdateSettings?.({ schoolLogo: '' });
  };

  // Başlık resmi değişikliğini yönet
  const handleHeaderImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dosya türünü kontrol et
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }
    
    // Dosya boyutunu kontrol et (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('Resim dosyası 1MB\'dan küçük olmalıdır.');
      return;
    }
    
    // Resmi Base64'e dönüştür ve boyutlandır
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Başlık resmi için maksimum boyutlar (daha geniş olabilir)
        const maxWidth = 800;
        const maxHeight = 150;
        
        // Oranları hesapla
        let width = img.width;
        let height = img.height;
        
        // En-boy oranını koru
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
        
        // Canvas oluştur ve resmi yeniden boyutlandır
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Yeniden boyutlandırılmış resmi base64 formatına dönüştür
        const resizedImageDataUrl = canvas.toDataURL(file.type);
        
        setLocalHeaderImage(resizedImageDataUrl);
        onUpdateSettings?.({ headerImage: resizedImageDataUrl });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Başlık resmini kaldır
  const handleRemoveHeaderImage = () => {
    setLocalHeaderImage('');
    onUpdateSettings?.({ headerImage: '' });
  };
  
  // WhatsApp optimizasyonu değişikliğini yönet
  const handleOptimizeForWhatsAppChange = (e) => {
    const value = e.target.checked;
    setLocalOptimizeForWhatsApp(value);
    onUpdateSettings?.({ optimizeForWhatsApp: value });
  };
  
  // Grayscale önizleme değişikliğini yönet
  const handleGrayscalePreviewChange = (e) => {
    const value = e.target.checked;
    setLocalGrayscalePreview(value);
    onUpdateSettings?.({ grayscalePreview: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">PDF Ayarları</h2>
      
      <div className="space-y-4">
        {/* Okul Bilgileri */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Okul Bilgileri</h3>
          
          <div className="space-y-3">
            {/* Okul Adı */}
            <div className="form-group">
              <label htmlFor="school-name" className="block text-sm font-medium text-gray-700 mb-1">
                Okul Adı
              </label>
              <input
                id="school-name"
                type="text"
                value={localSchoolName}
                onChange={handleSchoolNameChange}
                placeholder="Okul adını yazın"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            {/* Okul Logosu */}
            <div className="form-group">
              <label htmlFor="school-logo" className="block text-sm font-medium text-gray-700 mb-1">
                Okul Logosu
              </label>
              
              {localSchoolLogo ? (
                <div className="mb-2">
                  <img
                    src={localSchoolLogo}
                    alt="Okul Logosu"
                    className="max-h-20 max-w-20 mb-2 border rounded"
                  />
                  <button
                    onClick={handleRemoveSchoolLogo}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logoyu Kaldır
                  </button>
                </div>
              ) : (
                <input
                  id="school-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleSchoolLogoChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-3 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-xs file:bg-blue-500 file:text-white
                    hover:file:bg-blue-600
                    border border-gray-300 rounded"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Önerilen: 100x100px, 500KB'dan küçük
              </p>
            </div>
          </div>
        </div>
        
        {/* Başlık */}
        <div className="form-group">
          <label htmlFor="pdf-title" className="block text-sm font-medium text-gray-700 mb-1">
            Başlık
          </label>
          <input
            id="pdf-title"
            type="text"
            value={pageTitle}
            onChange={handleTitleChange}
            placeholder="Ödev Başlığı"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        
        {/* Açıklama */}
        <div className="form-group">
          <label htmlFor="pdf-description" className="block text-sm font-medium text-gray-700 mb-1">
            Açıklama
          </label>
          <textarea
            id="pdf-description"
            value={localDescription}
            onChange={handleDescriptionChange}
            placeholder="Bu ödevin hangi konu/lar hakkında olduğunu yazın..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20"
          />
        </div>
        
        {/* Yazar */}
        <div className="form-group">
          <label htmlFor="pdf-author" className="block text-sm font-medium text-gray-700 mb-1">
            Yazar / Öğretmen Adı
          </label>
          <input
            id="pdf-author"
            type="text"
            value={localAuthor}
            onChange={handleAuthorChange}
            placeholder="Adınızı yazın"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        
        {/* Başlık Resmi */}
        <div className="form-group">
          <label htmlFor="pdf-header-image" className="block text-sm font-medium text-gray-700 mb-1">
            Başlık Resmi
          </label>
          
          {localHeaderImage ? (
            <div className="mb-2">
              <img
                src={localHeaderImage}
                alt="Başlık Resmi"
                className="max-h-20 mb-2 border rounded"
              />
              <button
                onClick={handleRemoveHeaderImage}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Resmi Kaldır
              </button>
            </div>
          ) : (
            <input
              id="pdf-header-image"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleHeaderImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-3 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-xs file:bg-blue-500 file:text-white
                hover:file:bg-blue-600
                border border-gray-300 rounded"
            />
          )}
          <p className="text-xs text-gray-500 mt-1">
            Önerilen: 800x150px, 1MB'dan küçük
          </p>
        </div>
        
        {/* Düzen Tipi */}
        <div className="form-group">
          <label htmlFor="layout-type" className="block text-sm font-medium text-gray-700 mb-1">
            Sayfa Düzeni
          </label>
          <select
            id="layout-type"
            value={layoutType}
            onChange={handleLayoutTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="1">1 Pozisyon (Tam Boyut)</option>
            <option value="2">2 Pozisyon (2x1)</option>
            <option value="4">4 Pozisyon (2x2)</option>
            <option value="6">6 Pozisyon (3x2)</option>
            <option value="8">8 Pozisyon (4x2)</option>
          </select>
        </div>
        
        {/* Sayfa Boyutu ve Yönü */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="page-size" className="block text-sm font-medium text-gray-700 mb-1">
              Sayfa Boyutu
            </label>
            <select
              id="page-size"
              value={localPageSize}
              onChange={handlePageSizeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="A4">A4 (210x297mm)</option>
              <option value="LETTER">Letter (216x279mm)</option>
              <option value="LEGAL">Legal (216x356mm)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="orientation" className="block text-sm font-medium text-gray-700 mb-1">
              Sayfa Yönü
            </label>
            <select
              id="orientation"
              value={localOrientation}
              onChange={handleOrientationChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="portrait">Dikey</option>
              <option value="landscape">Yatay</option>
            </select>
          </div>
        </div>
        
        {/* Optimizasyon Ayarları */}
        <div className="form-group p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-800 mb-3">Yazdırma Optimizasyonu</h3>
          
          {/* WhatsApp Optimizasyonu */}
          <div className="flex items-center mb-2">
            <input
              id="whatsapp-optimize"
              type="checkbox"
              checked={localOptimizeForWhatsApp}
              onChange={handleOptimizeForWhatsAppChange}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="whatsapp-optimize" className="text-sm text-gray-700">
              WhatsApp için dosya boyutunu optimize et
            </label>
          </div>
          
          {/* Grayscale Önizleme */}
          <div className="flex items-center">
            <input
              id="grayscale-preview"
              type="checkbox"
              checked={localGrayscalePreview}
              onChange={handleGrayscalePreviewChange}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="grayscale-preview" className="text-sm text-gray-700">
              Siyah/beyaz yazdırma önizlemesi
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Tahta renklerini kontrastlı gösterir, siyah-beyaz yazıcılarda daha net çıktı almanızı sağlar
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;