import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useChessStore from '@/store/useChessStore';
import PuzzleEditModal from '@/components/editor/PuzzleEditModal';

const PuzzleEditorPage = () => {
  const { 
    puzzleSets, 
    loadPgnFile, 
    loadPgnText, 
    exportAsFile,
    isLoading, 
    error 
  } = useChessStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [currentSet, setCurrentSet] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pgnImportText, setPgnImportText] = useState('');
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [showPuzzleEditModal, setShowPuzzleEditModal] = useState(false);
  const fileInputRef = useRef(null);

  // Puzzle düzenleme işlemleri
  const handleEditPuzzle = (puzzle, setIndex) => {
    setSelectedPuzzle({ ...puzzle, setIndex });
    setShowPuzzleEditModal(true);
  };

  const handleCreateNewPuzzle = () => {
    setSelectedPuzzle({
      id: `puzzle-${Date.now()}`,
      title: '',
      difficulty: 1,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mainLine: [],
      variations: [],
      setIndex: puzzleSets.length > 0 ? 0 : -1 // İlk set'e ekle
    });
    setShowPuzzleEditModal(true);
  };

  const handleSavePuzzle = (updatedPuzzle) => {
    // Bu fonksiyon store'a puzzle'ı kaydetmeli
    // Şimdilik console'da gösterelim
    console.log('Puzzle kaydedildi:', updatedPuzzle);
    
    // Modal'ı kapat
    setShowPuzzleEditModal(false);
    setSelectedPuzzle(null);
    
    // TODO: Store'a puzzle güncelleme/ekleme fonksiyonu eklenecek
  };

  const handleCancelPuzzleEdit = () => {
    setShowPuzzleEditModal(false);
    setSelectedPuzzle(null);
  };
  const CreateSetModal = () => {
    const [setTitle, setSetTitle] = useState('');
    const [setSource, setSetSource] = useState('');

    const handleCreate = () => {
      // Basit bir boş set oluştur
      const newSet = {
        metadata: {
          title: setTitle || 'Yeni Puzzle Seti',
          source: setSource || 'Manual',
          count: 0
        },
        puzzles: []
      };
      
      // Store'a ekle (şimdilik manual olarak)
      console.log('Yeni set oluşturulacak:', newSet);
      setShowCreateModal(false);
      setSetTitle('');
      setSetSource('');
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">Yeni Puzzle Seti Oluştur</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Set Başlığı</label>
            <input
              type="text"
              value={setTitle}
              onChange={(e) => setSetTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Örn: Yeni Başlayanlar Puzzleları"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Kaynak</label>
            <input
              type="text"
              value={setSource}
              onChange={(e) => setSetSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Örn: ChessBase, Lichess"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  };

  // PGN import işlemi
  const handlePgnImport = async () => {
    if (pgnImportText.trim()) {
      await loadPgnText(pgnImportText);
      setPgnImportText('');
    }
  };

  const handleFileImport = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await loadPgnFile(e.target.files[0]);
      e.target.value = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                ← Ana Sayfa
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Puzzle Editor</h1>
            </div>
            
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Yeni Set
                </button>
                <button
                  onClick={handleCreateNewPuzzle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + Yeni Puzzle
                </button>
              </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              PGN Import
            </button>
            <button
              onClick={() => setActiveTab('sets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mevcut Setler
            </button>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Puzzle Editor Özeti</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Toplam Set</h3>
                <p className="text-2xl font-bold text-blue-600">{puzzleSets.length}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Toplam Puzzle</h3>
                <p className="text-2xl font-bold text-green-600">
                  {puzzleSets.reduce((total, set) => total + (set.puzzles?.length || 0), 0)}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Durum</h3>
                <p className="text-lg font-medium text-purple-600">
                  {isLoading ? 'İşleniyor...' : 'Hazır'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hızlı İşlemler</h3>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('import')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  PGN Import Et
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Manuel Set Oluştur
                </button>
                <button
                  onClick={() => setActiveTab('sets')}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                >
                  Setleri Görüntüle
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">PGN Import</h2>
            
            <div className="space-y-6">
              {/* Dosya Upload */}
              <div>
                <h3 className="font-medium mb-2">PGN Dosyası Yükle</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pgn"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Dosya Seç
                  </button>
                  <span className="text-gray-500 text-sm">(.pgn formatında)</span>
                </div>
              </div>

              {/* Text Import */}
              <div>
                <h3 className="font-medium mb-2">PGN Metni Yapıştır</h3>
                <textarea
                  value={pgnImportText}
                  onChange={(e) => setPgnImportText(e.target.value)}
                  placeholder="PGN formatındaki puzzle verilerini buraya yapıştırın..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md resize-none"
                  disabled={isLoading}
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {pgnImportText.length} karakter
                  </span>
                  <button
                    onClick={handlePgnImport}
                    disabled={isLoading || !pgnImportText.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'İşleniyor...' : 'Import Et'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sets' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Mevcut Puzzle Setleri</h2>
            </div>
            
            {puzzleSets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-4">Henüz puzzle seti yok</p>
                <button
                  onClick={() => setActiveTab('import')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  İlk Setinizi Import Edin
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Set / Puzzle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detaylar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zorluk
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {puzzleSets.map((set, setIndex) => (
                      <React.Fragment key={setIndex}>
                        {/* Set Başlığı */}
                        <tr className="bg-blue-50">
                          <td className="px-6 py-3" colSpan={4}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm font-bold text-blue-900">
                                  📁 {set.metadata?.title || `Set ${setIndex + 1}`}
                                </div>
                                <div className="text-xs text-blue-600">
                                  {set.puzzles?.length || 0} puzzle • Kaynak: {set.metadata?.source || 'Bilinmiyor'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => exportAsFile(setIndex)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                >
                                  Export
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Puzzle Listesi */}
                        {set.puzzles && set.puzzles.length > 0 ? (
                          set.puzzles.map((puzzle, puzzleIndex) => (
                            <tr key={puzzleIndex} className="hover:bg-gray-50">
                              <td className="px-6 py-4 pl-12">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {puzzle.title || `Puzzle ${puzzleIndex + 1}`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {puzzle.id}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div>
                                  <div>Ana hat: {puzzle.mainLine?.length || 0} hamle</div>
                                  <div className="text-xs text-gray-500">
                                    Varyant: {puzzle.variations?.length || 0}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  puzzle.difficulty <= 2 
                                    ? 'bg-green-100 text-green-800'
                                    : puzzle.difficulty <= 3
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  Seviye {puzzle.difficulty}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleEditPuzzle(puzzle, setIndex)}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                                >
                                  Düzenle
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-6 py-4 pl-12 text-gray-500 text-sm" colSpan={4}>
                              Bu sette henüz puzzle yok
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSetModal />
      
      {/* Puzzle Edit Modal */}
      <PuzzleEditModal
        puzzle={selectedPuzzle}
        isOpen={showPuzzleEditModal}
        onSave={handleSavePuzzle}
        onCancel={handleCancelPuzzleEdit}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            <span>İşleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleEditorPage;