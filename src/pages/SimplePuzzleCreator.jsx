import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import { ExtendedChess } from '@/utils/chess/ExtendedChess';
import MetadataStep from '@/components/puzzleCreator/MetadataStep';
import PuzzleCreationStep from '@/components/puzzleCreator/PuzzleCreationStep';
import SmartNamingDecoder from '@/utils/smartNaming/SmartNamingDecoder';

const SimplePuzzleCreator = () => {  const [step, setStep] = useState(1);
  const [puzzleSet, setPuzzleSet] = useState({
    id: '',
    pieceSet: 'merida',
    puzzles: [],
    nextSetId: '',
    title: '',
    description: '',
    puzzleCount: 0
  });
  
  const handleMetadataNext = () => {
    if (puzzleSet.id.length === 6) {
      const decoded = SmartNamingDecoder.decode(puzzleSet.id);
      if (decoded.isValid) {
        setPuzzleSet(prev => ({
          ...prev,
          title: decoded.generatedTitle,
          description: decoded.generatedDescription
        }));
      }
      setStep(2);
    }
  };
  const generateNextSetId = (currentId) => {
    if (!currentId || currentId.length < 6) return '';
    const num = parseInt(currentId.substring(0, 3)) + 1;
    return String(num).padStart(3, '0') + currentId.substring(3);
  };

  const handlePgnImport = (importedData) => {
    console.log('📥 PGN Import received:', importedData);
    
    setPuzzleSet({
      ...puzzleSet,
      id: importedData.id || puzzleSet.id,
      title: importedData.title || puzzleSet.title,
      pieceSet: importedData.pieceSet || puzzleSet.pieceSet,
      difficulty: importedData.difficulty,
      puzzles: importedData.puzzles || [],
      puzzleCount: importedData.puzzleCount || 0
    });
    
    alert(`${importedData.puzzleCount || 0} puzzle başarıyla içe aktarıldı!`);
    
    if (importedData.puzzles && importedData.puzzles.length > 0) {
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-teal-600 hover:text-teal-800">
                ← Ana Sayfa
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Basit Puzzle Oluşturucu
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Adım {step} / 3
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">        {step === 1 && (
          <MetadataStep 
            puzzleSet={puzzleSet} 
            setPuzzleSet={setPuzzleSet}
            onNext={handleMetadataNext}
            onPgnImport={handlePgnImport}
            generateNextSetId={generateNextSetId}
          />
        )}
          {step === 2 && (
          <PuzzleCreationStep 
            puzzleSet={puzzleSet} 
            setPuzzleSet={setPuzzleSet}
            onNext={() => setStep(3)}
            onPrevious={() => setStep(1)}
          />
        )}
        
        {step === 3 && (
          <ExportStep 
            puzzleSet={puzzleSet}
            onPrevious={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
};

// Export Step Component
const ExportStep = ({ puzzleSet, onPrevious }) => {
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const calculateFenForMoves = (startFen, moves) => {
    if (!moves || moves.length === 0) return [];
    
    try {
      const chess = new Chess(startFen);
      
      return moves.map((move, index) => {        try {
          const result = chess.move(move);
          
          if (!result) {
            return {
              move: move,
              fen: chess.fen(),
              isLast: index === moves.length - 1
            };
          }
          
          return {
            move: result.san,
            fen: chess.fen(),
            isLast: index === moves.length - 1
          };
        } catch {
          return {
            move: move,
            fen: chess.fen(),
            isLast: index === moves.length - 1
          };
        }
      });    } catch {
      return moves.map((move, index) => ({
        move: move,
        fen: startFen,
        isLast: index === moves.length - 1
      }));
    }
  };

  const generateNextSetId = (currentId) => {
    const num = parseInt(currentId.substring(0, 3)) + 1;
    return String(num).padStart(3, '0') + currentId.substring(3);
  };

  const formatExportData = () => {
    const formattedPuzzles = puzzleSet.puzzles.map((puzzle, index) => {
      const puzzleId = `${puzzleSet.id}_${String(index + 1).padStart(2, '0')}`;
      const fenToUse = puzzle.startingFen || puzzle.fen;
      
      const mainLine = calculateFenForMoves(fenToUse, puzzle.mainLine || []);
      
      const alternatives = (puzzle.alternatives || []).map((alt, altIndex) => ({
        name: alt.name || `variant_${String.fromCharCode(97 + altIndex)}`,
        parentVariant: alt.parentVariant || "main",
        parentMoveIndex: alt.parentMoveIndex || 0,
        moves: calculateFenForMoves(fenToUse, alt.moves || [])
      }));

      return {
        id: puzzleId,
        index: index + 1,
        fen: fenToUse,
        mainLine: mainLine,
        alternatives: alternatives
      };
    });

    return {
      id: puzzleSet.id,
      pieceSet: puzzleSet.pieceSet || "merida",
      nextSetId: puzzleSet.nextSetId || generateNextSetId(puzzleSet.id),
      puzzles: formattedPuzzles,
      puzzleCount: formattedPuzzles.length
    };
  };

  const downloadJson = () => {
    const exportData = formatExportData();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `chessmino-${puzzleSet.id}-${today}.json`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const exportData = formatExportData();
    const jsonString = JSON.stringify(exportData, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      alert('JSON panoya kopyalandı!');
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Panoya kopyalama başarısız!');
    }
  };

  const exportData = formatExportData();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">JSON Export</h2>
          <button
            onClick={onPrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Puzzle Creation'a Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-800">📊 Puzzle Set Özeti</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Smart Code:</span>
                  <span className="font-mono font-medium">{puzzleSet.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Başlık:</span>
                  <span className="font-medium">{puzzleSet.title || 'Otomatik'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Piece Set:</span>
                  <span>{puzzleSet.pieceSet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Puzzle Sayısı:</span>
                  <span className="font-medium text-teal-600">{exportData.puzzleCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Set:</span>
                  <span className="font-mono text-sm">{exportData.nextSetId}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3 text-blue-800">🧩 Puzzle Detayları</h3>              <div className="space-y-2 text-sm">
                {exportData.puzzles.map((puzzle) => (
                  <div key={puzzle.id} className="bg-white p-2 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{puzzle.id}</span>
                      <span className="text-xs text-gray-500">
                        {puzzle.mainLine.length} hamle
                        {puzzle.alternatives.length > 0 && ` + ${puzzle.alternatives.length} varyant`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={downloadJson}
                className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON Dosyası İndir
              </button>
              
              <button
                onClick={copyToClipboard}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Panoya Kopyala
              </button>

              <button
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
              >
                {showJsonPreview ? '🔼 Önizlemeyi Gizle' : '🔽 JSON Önizleme'}
              </button>
            </div>
          </div>

          {/* Right Column - JSON Preview */}
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2">💡 Format Bilgisi</h3>
              <div className="text-sm text-amber-700 space-y-1">
                <div>• <strong>Format:</strong> ChessMino Puzzle Set v1.0</div>
                <div>• <strong>Dosya:</strong> chessmino-{puzzleSet.id}-YYYY-MM-DD.json</div>
                <div>• <strong>FEN:</strong> Her hamle için hesaplanır</div>
                <div>• <strong>Varyantlar:</strong> alternatives[] formatında</div>
              </div>
            </div>

            {showJsonPreview && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-200">📄 JSON Önizleme</h3>
                <pre className="text-xs overflow-auto max-h-96 bg-gray-800 p-3 rounded border scrollbar-thin scrollbar-thumb-gray-600">
                  {JSON.stringify(exportData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <div className="mb-1">🎯 ChessMino Basit Puzzle Oluşturucu</div>
            <div>Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePuzzleCreator;
