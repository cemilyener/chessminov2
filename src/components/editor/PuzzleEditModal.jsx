import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import { Chess } from 'chess.js';
import { ExtendedChess } from '@/utils/chess/ExtendedChess.js';
import SmartNamingDecoder from '@/utils/smartNaming/SmartNamingDecoder';

const PuzzleEditModal = ({ puzzle, isOpen, onSave, onCancel }) => {
  // Form state
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
  const [activeTab, setActiveTab] = useState('setup'); // setup, moves, alternatives
  
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

  // Puzzle verisi değiştiğinde form'u güncelle
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
        alternatives: puzzle.alternatives || puzzle.variations || []  // ⭐ BACKWARD COMPATIBILITY
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

  // Reset form
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

  // Board Editor Functions (değişmez - sadece alternatives ile uyumlu)
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

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    try {
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        const newFen = game.fen();
        setCurrentFen(newFen);
        setFormData(prev => ({ ...prev, fen: newFen }));
        
        // Reset move game
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
      }
      
      return success;
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      return false;
    }
  };

  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    const newFen = game.fen();
    setCurrentFen(newFen);
    setFormData(prev => ({ ...prev, fen: newFen }));
    
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
  };

  // Board control functions (değişmez)
  const handleClearBoard = () => {
    game.clear();
    const newFen = game.fen();
    setCurrentFen(newFen);
    setFormData(prev => ({ ...prev, fen: newFen }));
    
    try {
      setGameForMoves(new ExtendedChess(newFen, { bypass: [10] }));
    } catch (error) {
      console.warn("Game reset to empty board:", error);
      setGameForMoves(new ExtendedChess("8/8/8/8/8/8/8/8 w - - 0 1", { bypass: [10] }));
    }
    setMoveHistory([]);
    setCurrentMoveIndex(0);
  };

  const handleStartPosition = () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    game.load(startFen, { bypass: [10] });
    setCurrentFen(startFen);
    setFormData(prev => ({ ...prev, fen: startFen }));
    setGameForMoves(new Chess(startFen));
    setMoveHistory([]);
    setCurrentMoveIndex(0);
  };

  const handlePlaceKings = () => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'h1');
    game.put({ type: 'k', color: 'b' }, 'h8');
    const newFen = game.fen();
    setCurrentFen(newFen);
    setFormData(prev => ({ ...prev, fen: newFen }));
    
    try {
      setGameForMoves(new Chess(newFen));
      setMoveHistory([]);
      setCurrentMoveIndex(0);
    } catch (error) {
      console.warn("Kings position may not be legal for move recording:", error);
      setGameForMoves(new ExtendedChess(newFen, { bypass: [10] }));
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

  const undoLastMove = () => {
    if (moveHistory.length === 0) return;

    const newHistory = moveHistory.slice(0, -1);
    setMoveHistory(newHistory);
    setFormData(prev => ({ ...prev, mainLine: newHistory }));

    try {
      const hasKings = formData.fen.includes('K') && formData.fen.includes('k');
      const newGame = hasKings ? new Chess(formData.fen) : new ExtendedChess(formData.fen, { bypass: [10] });
      
      newHistory.forEach(move => {
        newGame.move(move);
      });
      setGameForMoves(newGame);
      setCurrentMoveIndex(newHistory.length);
    } catch (error) {
      console.error('Undo move error:', error);
    }
  };

  const clearMoveHistory = () => {
    setMoveHistory([]);
    setFormData(prev => ({ ...prev, mainLine: [] }));
    
    const hasKings = formData.fen.includes('K') && formData.fen.includes('k');
    const newGame = hasKings ? new Chess(formData.fen) : new ExtendedChess(formData.fen, { bypass: [10] });
    setGameForMoves(newGame);
    setCurrentMoveIndex(0);
  };

  // Form submit
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

          {/* Tab Navigation - alternatives term kullanımı */}
          <div className="mb-6 border-b">
            <nav className="flex space-x-8">
              {{
                { key: 'setup', label: 'Temel Bilgiler', icon: '📝' },
                { key: 'board', label: 'Tahta & Pozisyon', icon: '♟️' },
                { key: 'moves', label: 'Hamleler', icon: '➡️' }
              }.map(tab => (
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
                {/* Akıllı Kod */}
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
                    {codeValidation.message && (
                      <p className={`text-xs mt-1 ${
                        codeValidation.isValid ? 'text-gray-500' : 'text-red-500'
                      }`}>
                        {codeValidation.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Decode preview */}
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

                {/* Başlık */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Başlık</label>
                    <button
                      type="button"
                      onClick={() => toggleCustomField('title')}
                      className={`text-xs px-2 py-1 rounded ${
                        formData.customTitle 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formData.customTitle ? 'Manuel' : 'Otomatik'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Puzzle başlığı"
                    readOnly={!formData.customTitle}
                  />
                </div>

                {/* Açıklama */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Açıklama</label>
                    <button
                      type="button"
                      onClick={() => toggleCustomField('description')}
                      className={`text-xs px-2 py-1 rounded ${
                        formData.customDescription 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formData.customDescription ? 'Manuel' : 'Otomatik'}
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Puzzle açıklaması"
                    readOnly={!formData.customDescription}
                  />
                </div>

                {/* Taş Seti */}
                <div>
                  <label className="block text-sm font-medium mb-2">Taş Seti</label>
                  <select
                    value={formData.pieceSet}
                    onChange={(e) => handleInputChange('pieceSet', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {allOptions.pieceSets.map(set => (
                      <option key={set.value} value={set.value}>
                        {set.label} {set.isDefault ? '(Varsayılan)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sonraki Set ID */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sonraki Set ID
                    <span className="text-gray-500 text-xs ml-2">(İsteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nextSetId}
                    onChange={(e) => handleInputChange('nextSetId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="002ka1"
                  />
                </div>
              </div>
            )}

            {/* Board Tab (değişmez) */}
            {activeTab === 'board' && (
              <ChessboardDnDProvider backend={HTML5Backend}>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Board Editor */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Satranç Tahtası Editörü</h3>
                      <div ref={boardRef} className="bg-gray-50 p-4 rounded-lg">
                        {/* Siyah taşlar */}
                        <div style={{
                          display: "flex",
                          margin: `${boardWidth / 32}px ${boardWidth / 8}px`,
                          justifyContent: "center"
                        }}>
                          {pieces.slice(6, 12).map(piece => (
                            <SparePiece
                              key={piece}
                              piece={piece}
                              width={boardWidth / 8}
                              dndId={uniqueId}
                            >
                              <img 
                                src={`/pieces/${piece}.png`}
                                alt={piece}
                                style={{ width: "100%", height: "100%" }}
                              />
                            </SparePiece>
                          ))}
                        </div>
                        
                        {/* Ana Tahta */}
                        <Chessboard
                          id={uniqueId}
                          position={currentFen}
                          boardOrientation={boardOrientation}
                          onPieceDrop={handlePieceDrop}
                          onPieceDropOffBoard={handlePieceDropOffBoard}
                          onSparePieceDrop={handleSparePieceDrop}
                          boardWidth={boardWidth}
                          customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
                          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                          allowDragOutsideBoard={true}
                          dropOffBoardAction="trash"
                          customPieces={pieces.reduce((acc, piece) => ({
                            ...acc,
                            [piece]: ({ squareWidth }) => (
                              <img
                                src={`/pieces/${piece}.png`}
                                alt={piece}
                                style={{ width: squareWidth, height: squareWidth }}
                              />
                            ),
                          }), {})}
                        />
                        
                        {/* Beyaz taşlar */}
                        <div style={{
                          display: "flex",
                          margin: `${boardWidth / 32}px ${boardWidth / 8}px`,
                          justifyContent: "center"
                        }}>
                          {pieces.slice(0, 6).map(piece => (
                            <SparePiece
                              key={piece}
                              piece={piece}
                              width={boardWidth / 8}
                              dndId={uniqueId}
                            >
                              <img 
                                src={`/pieces/${piece}.png`}
                                alt={piece}
                                style={{ width: "100%", height: "100%" }}
                              />
                            </SparePiece>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Tahta Kontrolleri</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleStartPosition}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                          >
                            🏁 Başlangıç
                          </button>
                          <button
                            type="button"
                            onClick={handleClearBoard}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                          >
                            🗑️ Temizle
                          </button>
                          <button
                            type="button"
                            onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
                            className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                          >
                            🔄 Çevir
                          </button>
                          <button
                            type="button"
                            onClick={handlePlaceKings}
                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                          >
                            👑 Şahlar
                          </button>
                        </div>

                        {/* FEN Display */}
                        <div>
                          <label className="block text-sm font-medium mb-2">FEN Pozisyonu</label>
                          <textarea
                            value={currentFen}
                            onChange={(e) => {
                              const newFen = e.target.value;
                              setCurrentFen(newFen);
                              setFormData(prev => ({ ...prev, fen: newFen }));
                              try {
                                game.load(newFen, { bypass: [10] });
                              } catch (error) {
                                console.warn("FEN load warning:", error);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
                            rows={3}
                          />
                        </div>

                        {/* Pozisyon Bilgisi */}
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div><strong>Sıra:</strong> {currentFen.includes(' w ') ? 'Beyaz' : 'Siyah'}</div>
                            <div><strong>Rok:</strong> {currentFen.split(' ')[2] || '-'}</div>
                            <div><strong>En passant:</strong> {currentFen.split(' ')[3] || '-'}</div>
                            <div><strong>Hamle:</strong> {currentFen.split(' ')[5] || '1'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ChessboardDnDProvider>
            )}

            {/* Moves Tab (değişmez) */}
            {activeTab === 'moves' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Move Input Board */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Hamle Girişi</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Chessboard
                        position={gameForMoves.fen()}
                        boardWidth={300}
                        onPieceDrop={handleMoveDrop}
                        boardOrientation={boardOrientation}
                        customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                      />
                      <div className="mt-3 text-center text-sm text-gray-600">
                        Sıra: <strong>{gameForMoves.turn() === 'w' ? 'Beyaz' : 'Siyah'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Move History */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">Ana Hat Hamleleri</h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={undoLastMove}
                          disabled={moveHistory.length === 0}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
                        >
                          ↶ Geri Al
                        </button>
                        <button
                          type="button"
                          onClick={clearMoveHistory}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          🗑️ Temizle
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
                      {moveHistory.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {moveHistory.length} hamle:
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {moveHistory.map((move, index) => (
                              <span
                                key={index}
                                className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono"
                              >
                                {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mt-3 p-2 bg-white rounded border text-xs">
                            <strong>PGN:</strong> {moveHistory.join(' ')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <p>Henüz hamle girilmedi</p>
                          <p className="text-xs mt-1">Yukarıdaki tahtada taş hareket ettirerek hamle ekleyin</p>
                        </div>
                      )}
                    </div>

                    {/* ✅ BONUS: Alternatif Hamle Önizlemesi */}
                    <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                      <p className="font-medium text-blue-900">💡 Alternatif Hamleler</p>
                      <p className="text-blue-700 text-xs mt-1">
                        {formData.alternatives.length > 0 
                          ? `${formData.alternatives.length} alternatif hamle kaydedildi`
                          : 'Alternatif hamle ekleme özelliği yakında gelecek'
                        }
                      </p>
                    </div>
                  </div>
                </div>
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