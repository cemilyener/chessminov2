/**
 * fc3.pgn formatına optimize edilmiş PGN oyun ayırıcısı
 * @param {string} pgnContent - PGN dosya içeriği
 * @returns {Array<Object>} - Ayrıştırılmış oyunlar
 */
export function splitPgnGames(pgnContent) {
  if (!pgnContent || typeof pgnContent !== 'string') {
    return [];
  }

  const games = [];
  const lines = pgnContent.split('\n');
  let currentGame = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Yeni oyun başlangıcı: [Event "?"]
    if (line.startsWith('[Event "?"')) {
      // Önceki oyunu kaydet
      if (currentGame && currentGame.moves) {
        games.push(currentGame);
      }
      
      // Yeni oyun başlat
      currentGame = {
        headers: {},
        moves: '',
        fullText: line + '\n'
      };
      
      // Event header'ını ekle
      currentGame.headers.Event = '?';
    }
    
    // Diğer header'lar
    else if (line.startsWith('[') && line.endsWith(']') && currentGame) {
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
      if (match) {
        currentGame.headers[match[1]] = match[2];
      }
      currentGame.fullText += line + '\n';
    }
    
    // Hamle satırları (header olmayan, boş olmayan)
    else if (line && !line.startsWith('[') && currentGame) {
      currentGame.moves += line + ' ';
      currentGame.fullText += line + '\n';
    }
    
    // Boş satır
    else if (currentGame) {
      currentGame.fullText += '\n';
    }
  }
  
  // Son oyunu ekle
  if (currentGame && currentGame.moves) {
    games.push(currentGame);
  }
  
  return games;
}

/**
 * Oyun formatını temizle ve normalize et
 * @param {Object} game - Ham oyun verisi
 * @returns {Object} - Temizlenmiş oyun verisi
 */
export function normalizeGame(game) {
  return {
    id: game.headers.White || 'unknown',
    fen: game.headers.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: game.moves.trim(),
    headers: game.headers,
    fullText: game.fullText
  };
}

/**
 * fc3.pgn test fonksiyonu
 */
export function testPgnSplitter(pgnContent) {
  console.log('🧪 PGN Splitter Test Başlatılıyor...\n');
  
  const games = splitPgnGames(pgnContent);
  
  console.log(`📊 Toplam oyun sayısı: ${games.length}`);
  console.log(`🎯 Beklenen: 18 oyun\n`);
  
  // İlk 3 oyunu detaylı göster
  games.slice(0, 3).forEach((game, index) => {
    const normalized = normalizeGame(game);
    console.log(`🎮 Oyun ${index + 1}:`);
    console.log(`  White: ${normalized.id}`);
    console.log(`  FEN: ${normalized.fen.substring(0, 50)}...`);
    console.log(`  Hamle örneği: ${normalized.moves.substring(0, 60)}...`);
    
    // Varyant kontrolü
    const hasVariants = normalized.moves.includes('(') && normalized.moves.includes(')');
    console.log(`  Varyant var mı: ${hasVariants ? '✅' : '❌'}`);
    console.log('');
  });
  
  // Varyant istatistikleri
  const gamesWithVariants = games.filter(game => 
    game.moves.includes('(') && game.moves.includes(')')
  );
  
  console.log(`📈 İstatistikler:`);
  console.log(`  Toplam oyun: ${games.length}`);
  console.log(`  Varyantlı oyun: ${gamesWithVariants.length}`);
  console.log(`  Varyantsız oyun: ${games.length - gamesWithVariants.length}`);
  
  // Doğrulama
  if (games.length === 18) {
    console.log('\n✅ Test başarılı! fc3.pgn\'den 18 oyun çıkarıldı.');
  } else {
    console.error(`\n❌ Test başarısız! Beklenen: 18, Bulunan: ${games.length}`);
  }
  
  return games.map(normalizeGame);
}

/**
 * Debugging için oyun ayrıntılarını göster
 */
export function debugGame(game, index) {
  console.log(`\n🔍 Oyun ${index + 1} Debug:`);
  console.log('Headers:', game.headers);
  console.log('Moves:', game.moves);
  console.log('Full text preview:', game.fullText.substring(0, 200) + '...');
}