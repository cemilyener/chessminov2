import React, { useState, useRef, useEffect } from 'react';
import { usePDFStore } from '../store/usePDFStore';

/**
 * PDF oluşturma ayarları bileşeni
 */
const PDFSettings = () => {
  const settings = usePDFStore(state => state.settings);
  const updateSettings = usePDFStore(state => state.updateSettings);
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(settings.schoolLogo || null);
  
  // Form değerlerinin başlangıç durumu için güvenli değerler atama
  const [formValues, setFormValues] = useState({
    title: settings.title || '',
    author: settings.author || '',
    schoolName: settings.schoolName || '',
    layoutType: settings.layoutType || '1',
    pageSize: settings.pageSize || 'A4',
    orientation: settings.orientation || 'portrait'
  });
  
  // Store'daki değerler değiştiğinde formu güncelle
  useEffect(() => {
    setFormValues({
      title: settings.title || '',
      author: settings.author || '',
      schoolName: settings.schoolName || '',
      layoutType: settings.layoutType || '1',
      pageSize: settings.pageSize || 'A4',
      orientation: settings.orientation || 'portrait'
    });
  }, [settings]);

  // Ayarları güncelleyen genel işleyici
  const handleChange = (key, value) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
    updateSettings({ [key]: value });
  };
  
  // Logo yükleme işleyicisi
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Sadece görüntü dosyaları
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görüntü dosyası seçin (.png, .jpg)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const logoData = e.target.result;
      setLogoPreview(logoData);
      updateSettings({ schoolLogo: logoData });
    };
    reader.readAsDataURL(file);
  };
  
  // Logo kaldırma işleyicisi
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateSettings({ schoolLogo: null });
    
    // Input değerini temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">PDF Ayarları</h3>
      
      <div className="space-y-4">
        {/* Başlık */}
        <div>
          <label htmlFor="pdf-title" className="block text-sm font-medium mb-1 text-gray-700">
            Başlık
          </label>
          <input
            id="pdf-title"
            type="text"
            value={formValues.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Çalışma sayfası başlığı"
          />
        </div>
        
        {/* Yazar */}
        <div>
          <label htmlFor="pdf-author" className="block text-sm font-medium mb-1 text-gray-700">
            Hazırlayan
          </label>
          <input
            id="pdf-author"
            type="text"
            value={formValues.author}
            onChange={(e) => handleChange('author', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hazırlayan kişi/kurum"
          />
        </div>
        
        {/* Okul Adı */}
        <div>
          <label htmlFor="school-name" className="block text-sm font-medium mb-1 text-gray-700">
            Okul Adı
          </label>
          <input
            id="school-name"
            type="text"
            value={formValues.schoolName}
            onChange={(e) => handleChange('schoolName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Okul adı"
          />
        </div>
        
        {/* Okul Logosu */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Okul Logosu
          </label>
          
          <div className="flex items-center gap-3 mb-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Logo Seç
            </button>
            
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="px-3 py-1 bg-red-100 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Logoyu Kaldır
              </button>
            )}
          </div>
          
          {logoPreview ? (
            <div className="mt-2 border rounded-md p-2 bg-gray-50 flex items-center justify-center">
              <img 
                src={logoPreview} 
                alt="Okul logosu" 
                className="max-h-20 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="mt-2 border rounded-md p-4 bg-gray-50 text-center text-gray-500 text-sm">
              Logo seçilmedi
            </div>
          )}
        </div>
        
        {/* Düzen Tipi */}
        <div>
          <label htmlFor="layout-type" className="block text-sm font-medium mb-1 text-gray-700">
            Pozisyon Düzeni
          </label>
          <select
            id="layout-type"
            value={formValues.layoutType}
            onChange={(e) => handleChange('layoutType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">1 x 1 (1 pozisyon)</option>
            <option value="2">1 x 2 (2 pozisyon)</option>
            <option value="4">2 x 2 (4 pozisyon)</option>
            <option value="6">2 x 3 (6 pozisyon)</option>
            <option value="8">2 x 4 (8 pozisyon)</option>
          </select>
        </div>
        
        {/* Sayfa Boyutu */}
        <div>
          <label htmlFor="page-size" className="block text-sm font-medium mb-1 text-gray-700">
            Sayfa Boyutu
          </label>
          <select
            id="page-size"
            value={formValues.pageSize}
            onChange={(e) => handleChange('pageSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="A4">A4</option>
            <option value="letter">Letter</option>
          </select>
        </div>
        
        {/* Sayfa Yönü */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Sayfa Yönü
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="portrait"
                checked={formValues.orientation === 'portrait'}
                onChange={() => handleChange('orientation', 'portrait')}
                className="focus:ring-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Dikey</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="landscape"
                checked={formValues.orientation === 'landscape'}
                onChange={() => handleChange('orientation', 'landscape')}
                className="focus:ring-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yatay</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSettings;