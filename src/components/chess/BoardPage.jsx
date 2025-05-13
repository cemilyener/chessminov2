import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useChessStore from '../../store/useChessStore';
import ChessBoard from './ChessBoard';
import VariantSelector from './VariantSelector';

const BoardPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [pgnText, setPgnText] = useState('');
  const [pgnInfo, setPgnInfo] = useState({
    isValid: false,
    hasHeader: false,
    hasEvents: false,
    hasFEN: false,
    gameCount: 0
  });

  // useChessStore hook'undan gerekli state ve metodları al
  const currentFen = useChessStore(state => state.currentFen);
  const loadPgnText = useChessStore(state => state.loadPgnText);
  const exportAsJson = useChessStore(state => state.exportAsJson);
  const variations = useChessStore(state => state.variations);
  const alternatives = useChessStore(state => state.alternatives);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pgnParam = queryParams.get('pgn');
    
    if (pgnParam) {
      try {
        const decodedPgn = decodeURIComponent(pgnParam);
        setPgnText(decodedPgn);
        processPgn(decodedPgn);
      } catch (error) {
        console.error('PGN decode error:', error);
      }
    }
  }, [location]);

  const processPgn = async (text) => {
    if (!text) return;
    
    // PGN hakkında bazı basit kontroller yap
    const size = new Blob([text]).size;
    console.log('PGN dosya boyutu:', size, 'karakter');
    
    // PGN dosya formatını kontrol et
    const hasHeader = text.includes('[Event');
    const hasEvents = text.includes('[Event');
    const hasFEN = text.includes('[FEN');
    const gameEstimate = (text.match(/\[Event/g) || []).length;
    
    const info = {
      isValid: text.length > 50 && (hasHeader || text.includes('1.')),
      hasHeader,
      hasEvents,
      hasFEN,
      gameCount: gameEstimate
    };
    
    console.log('PGN format kontrolü:', info);
    setPgnInfo(info);
    
    // Tahmini oyun sayısı
    console.log('Tahmini oyun sayısı:', gameEstimate);
    
    // Çoklu oyun durumunda ilk oyunu ayıkla
    if (gameEstimate > 1) {
      console.log('Çoklu oyun algılandı. İlk oyunu ayıklama denenecek...');
      const games = text.split(/\r?\n\r?\n\[Event/);
      const firstGame = games[0];
      const restGames = games.slice(1).map(g => `[Event${g}`);
      console.log(`${games.length} oyun ayıklandı. İlk oyun kullanılacak.`);
      
      // İlk oyunu yükle
      const loadResult = await loadPgnText(firstGame);
      console.log('İlk oyun yükleme başarılı:', loadResult);
    } else {
      // Tek oyun varsa doğrudan yükle
      const loadResult = await loadPgnText(text);
      console.log('PGN yükleme başarılı:', loadResult);
    }
    
    // Varyantları göster
    console.log('Tüm varyantlar:', variations);
    
    // Alternatif hamleleri göster
    console.log('Mevcut alternatifler:', alternatives);
  };

  return (
    <div className="board-page">
      <h2>Satranç Tahtası</h2>
      <div className="chess-container">
        <div className="board-wrapper">
          <ChessBoard position={currentFen} />
        </div>
      
      </div>
    </div>
  );
};

export default BoardPage;