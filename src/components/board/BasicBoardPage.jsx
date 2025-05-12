import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { ExtendedChess } from "../../utils/chess/ExtendedChess.js";
import useChessStore from '../../store/useChessStore';

// Styles
const boardWrapper = { margin: "0 auto", maxWidth: "60vh" };
const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};
const inputStyle = {
  padding: "10px 20px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  width: "100%",
};

const BasicBoardPage = () => {
  const { setPosition } = useChessStore();
  
  // Boş tahta ile başla
  const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
  const game = useMemo(() => new ExtendedChess(emptyFen, { bypass: [10] }), []);
  
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(360);
  const [fenPosition, setFenPosition] = useState(emptyFen);
  const [errorMessage, setErrorMessage] = useState("");

  // FEN pozisyonu değiştiğinde store'a kaydet
  const updatePosition = useCallback((fen) => {
    setFenPosition(fen);
    setPosition(fen, true);
    console.log("FEN güncellendi:", fen);
  }, [setPosition]);

  // Yedek taşları yerleştirme
  const handleSparePieceDrop = useCallback((piece, square) => {
    console.log("handleSparePieceDrop çalıştı:", piece, square);
    try {
      const color = piece.charAt(0);
      const type = piece.charAt(1).toLowerCase();
      
      // Önce karedeki mevcut taşı kaldır
      game.remove(square);
      
      // Yeni taşı yerleştir
      const success = game.put({ type, color }, square);
      
      if (success) {
        updatePosition(game.fen());
        console.log("Taş başarıyla yerleştirildi:", piece, square);
        setErrorMessage("");
        return true;
      } else {
        console.error("Taş yerleştirilemedi:", piece, square);
        setErrorMessage("Taş yerleştirilemedi!");
        return false;
      }
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      setErrorMessage(`Hata: ${error.message}`);
      return false;
    }
  }, [game, updatePosition]);

  // Taş taşıma işlevi
  const handlePieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    console.log("handlePieceDrop çalıştı:", sourceSquare, targetSquare, piece);
    try {
      // Kaynak ve hedef karelerdeki taşları kaldır
      const chessPiece = game.get(sourceSquare);
      if (!chessPiece) return false;
      
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      // Taşı hedef kareye yerleştir
      const success = game.put(chessPiece, targetSquare);
      
      if (success) {
        updatePosition(game.fen());
        console.log("Taş başarıyla taşındı:", sourceSquare, "->", targetSquare);
        setErrorMessage("");
        return true;
      } else {
        console.error("Taş taşınamadı:", sourceSquare, "->", targetSquare);
        setErrorMessage("Taş taşınamadı!");
        return false;
      }
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      setErrorMessage(`Hata: ${error.message}`);
      return false;
    }
  }, [game, updatePosition]);

  // Taşı tahtadan kaldırma
  const handlePieceDropOffBoard = useCallback((sourceSquare) => {
    console.log("handlePieceDropOffBoard çalıştı:", sourceSquare);
    try {
      game.remove(sourceSquare);
      updatePosition(game.fen());
      setErrorMessage("");
      return true;
    } catch (error) {
      console.error("Taş kaldırma hatası:", error.message);
      setErrorMessage(`Hata: ${error.message}`);
      return false;
    }
  }, [game, updatePosition]);

  // FEN giriş değişikliğini işle
  const handleFenInputChange = useCallback((e) => {
    const fen = e.target.value;
    setFenPosition(fen);
    
    try {
      // Şah kontrolünü bypass et
      game.load(fen, { bypass: [10] });
      updatePosition(game.fen());
      setErrorMessage("");
    } catch (error) {
      console.error("Geçersiz FEN:", error.message);
      setErrorMessage("Geçersiz FEN pozisyonu");
    }
  }, [game, updatePosition]);

  // Tahtayı temizle
  const handleClearBoard = useCallback(() => {
    try {
      game.clear();
      updatePosition(game.fen());
      setErrorMessage("");
    } catch (error) {
      console.error("Tahta temizleme hatası:", error.message);
      setErrorMessage("Tahta temizlenemedi");
    }
  }, [game, updatePosition]);

  // Başlangıç konumu
  const handleStartPosition = useCallback(() => {
    try {
      game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
      updatePosition(game.fen());
      setErrorMessage("");
    } catch (error) {
      console.error("Başlangıç konumu yükleme hatası:", error.message);
      setErrorMessage("Başlangıç konumu yüklenemedi");
    }
  }, [game, updatePosition]);

  // Özel pozisyon - h1'de beyaz şah, h8'de siyah şah
  const handlePlaceKings = useCallback(() => {
    try {
      game.clear();
      
      // Önce şahları yerleştirmeyi dene
      const whiteSuccess = game.put({ type: 'k', color: 'w' }, 'h1');
      const blackSuccess = game.put({ type: 'k', color: 'b' }, 'h8');
      
      if (whiteSuccess && blackSuccess) {
        updatePosition(game.fen());
        console.log("Şahlar başarıyla yerleştirildi. FEN:", game.fen());
        setErrorMessage("");
      } else {
        console.error("Şahlar yerleştirilemedi");
        setErrorMessage("Şahlar yerleştirilemedi");
      }
    } catch (error) {
      console.error("Şahları yerleştirme hatası:", error.message);
      setErrorMessage(`Şahları yerleştirme hatası: ${error.message}`);
    }
  }, [game, updatePosition]);

  // Bu useEffect, tahtanın düzgün görüntülenmesi için başlangıçta FEN'i güncelliyor
  useEffect(() => {
    updatePosition(game.fen());
  }, [updatePosition, game]);

  return (
    <div style={boardWrapper}>
      <div style={{ height: "60vh", width: "100%" }}>
        {/* react-chessboard sparePieces kullanımı */}
        <Chessboard
          id="BasicBoard"
          animationDuration={200}
          arePiecesDraggable={true}
          position={fenPosition}
          boardOrientation={boardOrientation}
          onPieceDrop={handlePieceDrop}
          onPieceDropOffBoard={handlePieceDropOffBoard}
          boardWidth={boardWidth}
          onBoardWidthChange={setBoardWidth}
          customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
          // Yedek taşlar (spare pieces) için düzgün ayarlar
          sparePieces={true}
          onSparePieceDrop={handleSparePieceDrop}
          dropOffBoardAction="trash"
        />
      </div>
      
      {/* Hata mesajları */}
      {errorMessage && (
        <div style={{ 
          margin: "10px 0", 
          padding: "8px 12px", 
          backgroundColor: "#ffebee", 
          color: "#c62828",
          borderRadius: "4px",
          fontSize: "14px" 
        }}>
          {errorMessage}
        </div>
      )}
      
      {/* Kontrol butonları */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        <button 
          style={buttonStyle} 
          onClick={handleStartPosition}
        >
          Başlangıç konumu ♟️
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleClearBoard}
        >
          Tahtayı temizle 🗑️
        </button>
        <button 
          style={buttonStyle} 
          onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
        >
          Tahtayı çevir 🔁
        </button>
        <button 
          style={buttonStyle} 
          onClick={handlePlaceKings}
        >
          Şahları Yerleştir 👑
        </button>
      </div>
      
      {/* FEN girişi */}
      <input
        value={fenPosition}
        style={inputStyle}
        onChange={handleFenInputChange}
        placeholder="FEN pozisyonu yapıştırın"
      />
      
      {/* Debug bilgisi */}
      <div style={{ 
        margin: "10px 0", 
        padding: "5px", 
        backgroundColor: "#f5f5f5", 
        borderRadius: "4px", 
        fontSize: "12px",
        color: "#666"
      }}>
        <div>FEN: {fenPosition}</div>
        <div>Tahta yönü: {boardOrientation}</div>
      </div>
    </div>
  );
};

export default BasicBoardPage;