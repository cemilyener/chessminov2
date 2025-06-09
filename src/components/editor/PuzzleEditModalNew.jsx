// PuzzleEditModal.jsx - Step 3: variations → alternatives field name düzeltmesi

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import { Chess } from 'chess.js';
import { ExtendedChess } from '@/utils/chess/ExtendedChess.js';
import SmartNamingDecoder from '@/utils/smartNaming/SmartNamingDecoder';

const PuzzleEditModal = ({ puzzle, isOpen, onSave, onCancel }) => {
  // ✅ DÜZELTME 1: Form state - variations → alternatives
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    smartCode: '',
    customTitle: false,
    customDescription: false,
    pieceSet: 'merida',
    nextSetId: '',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    mainLine: [],
    alternatives: []  // ⭐ DEĞIŞIKLIK: variations → alternatives
  });

  // Board state
  const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(360);
  const [activeTab, setActiveTab] = useState('setup'); // setup, moves, variations
  
  // Game state for move recording
  const [gameForMoves, setGameForMoves] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  
  // Board editor state
  const game = useMemo(() => new ExtendedChess(currentFen, { bypass: [10] }), [currentFen]);
  const boardRef = useRef(null);
  const uniqueId = useId();

  const [decodedData, setDecodedData] = useState(SmartNamingDecoder.getDefaultDecoded());
  const [codeValidation, setCodeValidation] = useState({ isValid: true, message: '' });
  const [allOptions] = useState(SmartNamingDecoder.getAllOptions());

  // ✅ DÜZELTME 2: Puzzle verisi yükleme - variations → alternatives
  useEffect(() => {
    if (puzzle) {
      const newFormData = {
        title: puzzle.title || '',
        description: puzzle.description || '',
        smartCode: puzzle.smartCode || '',
        customTitle: Boolean(puzzle.customTitle),
        customDescription: Boolean(puzzle.customDescription),
        pieceSet: puzzle.pieceSet || 'merida',
        nextSetId: puzzle.nextSetId || '',
        fen: puzzle.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        mainLine: puzzle.mainLine || [],
        alternatives: puzzle.alternatives || []  // ⭐ DEĞIŞIKLIK: variations → alternatives
      };
      
      setFormData(newFormData);
      setCurrentFen(newFormData.fen);
      setMoveHistory(newFormData.mainLine);
      
      // Game state'i puzzle pozisyonuna getir
      try {
        const newGame = new Chess(newFormData.fen);
        setGameForMoves(newGame);
      } catch (error) {
        console.error("FEN yüklenirken hata:", error);
      }
      
      // Eğer smart code varsa decode et
      if (puzzle.smartCode) {
        handleSmartCodeChange(puzzle.smartCode);
      }
    } else {
      // Yeni puzzle için default değerler
      resetForm();
    }
  }, [puzzle]);

  // Board boyutu responsive ayarı
  useEffect(() => {
    const updateBoardSize = () => {
      if (boardRef.current) {
        const containerWidth = boardRef.current.offsetWidth;
        setBoardWidth(Math.min(containerWidth - 40, 400));
      }
    };

    const observer = new ResizeObserver(updateBoardSize);
    if (boardRef.current) observer.observe(boardRef.current);
    updateBoardSize();

    return () => observer.disconnect();
  }, []);

  // ✅ DÜZELTME 3: Reset form - variations → alternatives
  const resetForm = () => {
    const defaultData = {
      title: '',
      description: '',
      smartCode: '',
      customTitle: false,
      customDescription: false,
      pieceSet: 'merida',
      nextSetId: '',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mainLine: [],
      alternatives: []  // ⭐ DEĞIŞIKLIK: variations → alternatives
    };
    setFormData(defaultData);
    setCurrentFen(defaultData.fen);
    setMoveHistory([]);
    setCurrentMoveIndex(0);
    setDecodedData(SmartNamingDecoder.getDefaultDecoded());
    setCodeValidation({ isValid: true, message: '' });
    setGameForMoves(new Chess());
  };

  // Smart code değiştiğinde
  const handleSmartCodeChange = (code) => {
    const validation = SmartNamingDecoder.validateCode(code);
    setCodeValidation(validation);
    
    if (code.length === 6) {
      const decoded = SmartNamingDecoder.decode(code);
      setDecodedData(decoded);
      
      // Otomatik başlık ve açıklama güncelle (eğer custom değilse)
      if (decoded.isValid) {
        setFormData(prev => ({
          ...prev,
          smartCode: code,
          title: prev.customTitle ? prev.title : decoded.generatedTitle,
          description: prev.customDescription ? prev.description : decoded.generatedDescription
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, smartCode: code }));
    }
  };

  // Input değişiklikleri
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Custom title/description toggle
  const toggleCustomField = (field) => {
    const isCustom = !formData[`custom${field.charAt(0).toUpperCase() + field.slice(1)}`];
    setFormData(prev => ({
      ...prev,
      [`custom${field.charAt(0).toUpperCase() + field.slice(1)}`]: isCustom,
      [field]: isCustom ? prev[field] : decodedData[`generated${field.charAt(0).toUpperCase() + field.slice(1)}`]
    }));
  };

  // Board Editor Functions (Taş yerleştirme, hareket ettirme vs. - değişmez)
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      game.remove(targetSquare);
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        const newFen = game.fen();
        setCurrentFen(newFen);
        setFormData(prev => ({ ...prev, fen: newFen }));
        
        // Reset move game to new position
        try {
          const hasKings = newFen.includes('K') && newFen.includes('k');
          if (hasKings) {
            setGameForMoves(new Chess(newFen));
          } else {
            setGameForMoves(new ExtendedChess(newFen, { bypass: [10] }));
          }
          setMoveHistory([]);
          setCurrentMoveIndex(0);
        } catch (error) {
          console.warn("Move game reset warning:", error);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  };

  // Move recording functions (değişmez)
  const handleMoveDrop = (sourceSquare, targetSquare) => {
    try {
      const gameCopy = new Chess(gameForMoves.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      const newHistory = [...moveHistory, move.san];
      setMoveHistory(newHistory);
      setFormData(prev => ({ ...prev, mainLine: newHistory }));
      setGameForMoves(gameCopy);
      setCurrentMoveIndex(newHistory.length);

      return true;
    } catch (error) {
      console.error('Move recording error:', error);
      return false;
    }
  };

  // ✅ DÜZELTME 4: Form submit - alternatives field mapping
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const puzzleData = {
      ...puzzle,
      ...formData,
      alternatives: formData.alternatives,  // ⭐ EXPLICIT MAPPING: alternatives field
      metadata: {
        smartCode: formData.smartCode,
        decodedData: decodedData.isValid ? decodedData : null,
        pieceSet: formData.pieceSet,
        nextSetId: formData.nextSetId,
        customTitle: formData.customTitle,
        customDescription: formData.customDescription,
        lastModified: new Date().toISOString()
      }
    };

    onSave(puzzleData);
  };

  if (!isOpen) return null;

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {puzzle ? 'Puzzle Düzenle' : 'Yeni Puzzle Oluştur'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b">
            <nav className="flex space-x-8">
              {[
                { key: 'setup', label: 'Temel Bilgiler', icon: '📝' },
                { key: 'board', label: 'Tahta & Pozisyon', icon: '♟️' },
                { key: 'moves', label: 'Hamleler', icon: '➡️' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Setup Tab */}
            {activeTab === 'setup' && (
              <div className="space-y-4">
                {/* ✅ BONUS KONTROL: SmartNamingDecoder getAllOptions() uyumluluğu */}
                {/* Dropdown/Select componentleri için field name kontrolü */}
                
                {/* Akıllı Kod - SmartNamingDecoder kullanımı */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Akıllı Kod
                    <span className="text-gray-500 text-xs ml-2">(Format: 001ka1)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.smartCode}
                      onChange={(e) => handleSmartCodeChange(e.target.value.toLowerCase())}
                      className={`w-full px-3 py-2 border rounded-md font-mono text-lg ${
                        codeValidation.isValid ? 'border-gray-300' : 'border-red-500'
                      }`}
                      placeholder="001ka1"
                      maxLength={6}
                    />
                  </div>
                  
                  {/* ✅ KONTROL: getAllOptions().lessonTopics kullanımı */}
                  {decodedData.isValid && formData.smartCode.length === 6 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div><strong>Set:</strong> {decodedData.setNumber}</div>
                        <div><strong>Taş:</strong> {decodedData.pieceType.name}</div>
                        <div><strong>Tip:</strong> {decodedData.exerciseType.name}</div>
                        <div><strong>Zorluk:</strong> {decodedData.difficulty.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diğer form alanları (title, description, pieceSet vs.) */}
                {/* ... (UI kısımları kısaltıldı, değişiklik yok) */}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!codeValidation.isValid || formData.smartCode.length !== 6}
              >
                {puzzle ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PuzzleEditModal;