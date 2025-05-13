import React, { useState, useRef } from 'react';

const PgnImporterUI = ({ onImport }) => {
  const [pgnText, setPgnText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Metin kutusundan import işlemi
  const handleImport = () => {
    if (!pgnText.trim()) {
      setError('Lütfen PGN metnini girin');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // Callback fonksiyon ile parent bileşene PGN metnini ilet
      onImport(pgnText);
      setMessage('PGN başarıyla içe aktarıldı');
      
      // Başarılı içe aktarmadan sonra temizle
      setPgnText(''); 
      setIsLoading(false);
    } catch (err) {
      setError(`PGN içe aktarma hatası: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  // fc3.pgn dosyasından örnek yükleme
  const loadSamplePgn = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('/fc3.pgn');
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status}`);
      }
      
      const text = await response.text();
      console.log("Yüklenen örnek PGN (ilk 100 karakter):", text.substring(0, 100) + "...");
      
      // Tüm PGN'i metin kutusuna yükle
      setPgnText(text);
      setMessage('Örnek PGN başarıyla yüklendi. İçe aktarmak için "İçe Aktar" butonuna tıklayın.');
    } catch (err) {
      console.error("Örnek PGN yükleme hatası:", err);
      setError(`Örnek PGN yükleme hatası: ${err.message}`);
    }
    
    setIsLoading(false);
  };
  
  // Dosya yükleme işleyicisi
  const handleFileUpload = (event) => {
    setError(null);
    setMessage(null);
    
    const file = event.target.files[0];
    if (!file) return;
    
    // Sadece .pgn dosyalarını kabul et
    if (!file.name.toLowerCase().endsWith('.pgn')) {
      setError('Lütfen sadece .pgn uzantılı dosyalar yükleyin');
      return;
    }
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        setPgnText(text);
        setMessage('PGN dosyası başarıyla yüklendi. İçe aktarmak için "İçe Aktar" butonuna tıklayın.');
        setIsLoading(false);
      } catch (err) {
        setError(`PGN dosyası okuma hatası: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Dosya okuma hatası');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Doğrudan import butonu için tıklama işleyici
  const handleFileSelectClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="pgn-importer">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">PGN İçe Aktar</h3>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 text-red-700">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4 text-green-700">
          {message}
        </div>
      )}
      
      <textarea
        className="w-full p-3 border rounded-md bg-gray-50 font-mono text-sm resize-y min-h-[200px] focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
        rows="10"
        placeholder="PGN metnini buraya yapıştırın..."
        value={pgnText}
        onChange={(e) => setPgnText(e.target.value)}
        disabled={isLoading}
      />
      
      <div className="flex flex-wrap gap-3 mt-4">
        <button 
          onClick={handleImport} 
          disabled={isLoading} 
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
        </button>
        
        <button 
          onClick={loadSamplePgn} 
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Örnek PGN Yükle
        </button>
        
        <button 
          onClick={handleFileSelectClick} 
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          PGN Dosyası Seç...
        </button>
        
        <input
          type="file"
          accept=".pgn"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-semibold text-gray-700 mb-2">Test İpuçları:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
          <li>"Örnek PGN Yükle" butonu ile /public/fc3.pgn dosyasını yükleyebilirsiniz</li>
          <li>PGN metnini metin kutusuna yapıştırabilirsiniz</li>
          <li>Kendi PGN dosyanızı seçip yükleyebilirsiniz</li>
          <li>İçe aktardıktan sonra varyantların doğru tespit edilip edilmediğini kontrol edin</li>
        </ul>
      </div>
    </div>
  );
};

export default PgnImporterUI;