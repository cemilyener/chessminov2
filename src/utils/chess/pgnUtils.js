import { Chess } from 'chess.js';

/**
 * PGN dosyasını parse ederek içindeki oyunları ayırır
 * @param {string} pgnData - PGN formatındaki veri
 * @returns {Array} - Ayrıştırılmış oyunların dizisi
 */
export function parsePgnGames(pgnData) {
  try {
    // Her oyun [Event ...] ile başlar, bunu kullanarak oyunları ayırıyoruz
    const games = [];
    let currentGame = "";
    
    // Satır satır okuyoruz
    const lines = pgnData.split('\n');
    
    for (let line of lines) {
      // Yeni oyun başlangıcı
      if (line.trim().startsWith('[Event') && currentGame) {
        games.push(currentGame.trim());
        currentGame = "";
      }
      
      currentGame += line + '\n';
    }
    
    // Son oyunu ekliyoruz
    if (currentGame.trim()) {
      games.push(currentGame.trim());
    }
    
    return games;
  } catch (error) {
    console.error("PGN oyunları ayrıştırma hatası:", error);
    throw new Error("PGN dosyası ayrıştırılamadı: " + error.message);
  }
}

/**
 * PGN formatındaki bir oyundan üst bilgileri çıkarır
 * @param {string} pgnGame - PGN formatındaki bir oyun
 * @returns {Object} - Oyunun üst bilgilerini içeren nesne
 */
export function extractPgnHeaders(pgnGame) {
  try {
    const headers = {};
    const headerRegex = /\[(.*?)\s+"(.*?)"\]/g;
    let match;
    
    while ((match = headerRegex.exec(pgnGame)) !== null) {
      const [_, key, value] = match;
      headers[key] = value;
    }
    
    return headers;
  } catch (error) {
    console.error("PGN başlıkları çıkarma hatası:", error);
    throw new Error("PGN başlıkları çıkarılamadı: " + error.message);
  }
}

/**
 * PGN oyununu hamlelere ayırır (varyantları işleyerek)
 * @param {string} pgnGame - PGN formatındaki bir oyun
 * @returns {Object} - Ana hat ve varyantları içeren hamle yapısı
 */
export function extractPgnMoves(pgnGame) {
  try {
    // Başlıkları ve hamleleri ayırıyoruz
    const headerEndIndex = pgnGame.lastIndexOf(']') + 1;
    const movesText = pgnGame.substring(headerEndIndex).trim();
    
    // Hamleleri analiz etmek için ayrıştırıyoruz
    const moveData = {
      mainLine: [],
      variants: []
    };
    
    // Chess.js ile başlıkları yükleyelim
    const chess = new Chess();
    const headers = extractPgnHeaders(pgnGame);
    
    // Eğer bir FEN varsa yükleyelim
    if (headers.FEN) {
      try {
        chess.load(headers.FEN);
      } catch (e) {
        console.warn("FEN yükleme hatası, varsayılan başlangıç pozisyonu kullanılıyor:", e);
        try {
          // FEN doğrulama olmadan yüklemeyi dene (Chess.js 1.2+ ile)
          chess.load(headers.FEN, { validate: false });
        } catch (e2) {
          console.error("FEN yükleme hatası (validate: false ile bile):", e2);
          chess.reset(); // Varsayılan başlangıç pozisyonuna geri dön
        }
      }
    }
    
    // Şimdi hamleleri ve varyantları ayrıştıracağız
    // Bu karmaşık olabilir, parantezleri ve hamleler takip ederek
    parseMovesAndVariants(movesText, chess, moveData);
    
    return moveData;
  } catch (error) {
    console.error("PGN hamleleri çıkarma hatası:", error);
    throw new Error("PGN hamleleri çıkarılamadı: " + error.message);
  }
}

/**
 * Hamleleri ve varyantları ayrıştırır
 * @param {string} movesText - Hamleler bölümü
 * @param {Chess} chess - Chess.js nesnesi
 * @param {Object} moveData - Hamle verilerini saklayacak nesne
 */
function parseMovesAndVariants(movesText, chess, moveData) {
  // moveData kontrolü ekleyelim
  if (!moveData || !moveData.mainLine) {
    console.error("Geçersiz moveData yapısı");
    return;
  }
  try {
    // Parantez derinliğini takip etmek için
    let depth = 0;
    let currentVariant = null;
    let buffer = "";
    let mainLineBuffer = "";
    
    // Hamleleri ve varyantları ayrıştırmak için karakter karakter okuyoruz
    for (let i = 0; i < movesText.length; i++) {
      const char = movesText[i];
      
      if (char === '(') {
        // Yeni bir varyant başlıyor
        if (depth === 0) {
          // Ana hattaki hamleler buraya kadar
          mainLineBuffer += buffer;
          buffer = "";
        }
        depth++;
      } else if (char === ')') {
        depth--;
        if (depth === 0 && buffer.trim()) {
          // Varyant bitti, varyant hamlelerini işle
          const parentIndex = moveData.mainLine.length - 1; // Ana hat üzerindeki son hamleden sonra
          
          try {
            // Varyantın başladığı ana hattaki hamlenin FEN'ini kullan
            let variantStartFen;
            if (parentIndex >= 0 && moveData.mainLine[parentIndex]) {
              variantStartFen = moveData.mainLine[parentIndex].fen;
            } else {
              // Ana hattın ilk hamlesinden önce başlıyorsa, başlangıç FEN'ini kullan
              variantStartFen = chess.fen();
            }
            
            // Varyant hamlelerini işle
            const variantMoves = parseMoveSequence(buffer, variantStartFen);
            
            if (variantMoves.length > 0) {
              moveData.variants.push({
                parentMoveIndex: parentIndex,
                moves: variantMoves
              });
            }
          } catch (variantError) {
            console.error("Varyant işleme hatası:", variantError);
          }
          
          buffer = "";
        }
      } else {
        // Normal karakterleri buffera ekliyoruz
        buffer += char;
      }
    }
    
    // Buffer'da kalan son hamleler
    if (buffer.trim()) {
      mainLineBuffer += buffer;
    }
    
    // Ana hat hamlelerini işle
    if (mainLineBuffer.trim()) {
      const mainLineMoves = parseMoveSequence(mainLineBuffer, chess.fen());
      moveData.mainLine = mainLineMoves;
    }
  } catch (error) {
    console.error("Hamle ve varyant ayrıştırma hatası:", error);
    // Hatayı yukarı fırlatmak yerine, mevcut işlenen veriyi dönelim
  }
}

/**
 * Bir hamle dizisini ayrıştırır ve hataları tolere eder
 * @param {string} movesText - Hamle metni
 * @param {string} startFen - Başlangıç FEN'i
 * @returns {Array} - Hamle nesneleri dizisi
 */
function parseMoveSequence(movesText, startFen) {
  try {
    let fen = startFen;
    // Eğer FEN'de sıra beyazsa ve hamleler "1..." ile başlıyorsa, FEN'i siyaha çevir
    const startsWithBlack = /^\d+\.\.\./.test(movesText.trim());
    if (startsWithBlack && fen && fen.split(' ')[1] === 'w') {
      const fenParts = fen.split(' ');
      fenParts[1] = 'b';
      fen = fenParts.join(' ');
    }
    const chess = new Chess(fen);
    const moveList = [];
    
    // Boşluklara göre ayır ve sıra numaralarını kaldır
    const tokens = movesText.trim().split(/\s+/);
    const moves = tokens.filter(token => {
      // Sıra numaralarını, sonuç kodlarını ve diğer özel simgeleri filtreleyelim
      return !(token.includes('.') || token === '1-0' || token === '0-1' || 
              token === '1/2-1/2' || token === '*' || token === '');
    });
    
    // Her hamleyi uygula ve kaydet
    for (let i = 0; i < moves.length; i++) {
      const originalSan = moves[i];
      const san = originalSan; // Artık doğrudan SAN kullanılıyor
      
      try {
        const move = chess.move(san);
        if (move) {
          moveList.push({
            move: originalSan,
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            fen: chess.fen(),
            isLast: i === moves.length - 1
          });
        }
      } catch (e) {
        console.warn(`"${originalSan}" hamlesi uygulanamadı (çevrilen: "${san}"): ${e.message}, FEN: ${chess.fen()}`);
        // Özel düzeltmeler
        let success = false;
        // Kd2 gibi hamleler için özel düzeltme (muhtemelen Şah hamlesidir)
        if (!success && originalSan.match(/^[Kk]d[1-8]$/)) {
          try {
            // K harfini ekle (Şah hamlesi olarak dene)
            const kingMove = chess.move('K' + originalSan.substring(1));
            if (kingMove) {
              success = true;
              moveList.push({
                move: originalSan,
                from: kingMove.from,
                to: kingMove.to,
                promotion: kingMove.promotion,
                fen: chess.fen(),
                isLast: i === moves.length - 1
              });
            }
          } catch (kingErr) {}
        }
        // Hala başarısızsa, en yakın legal hamleyi bulmaya çalış
        if (!success) {
          const legalMoves = chess.moves({ verbose: true });
          const targetSquare = originalSan.match(/[a-h][1-8]/)?.[0];
          if (targetSquare) {
            const possibleMove = legalMoves.find(m => m.to === targetSquare);
            if (possibleMove) {
              success = true;
              chess.move(possibleMove);
              moveList.push({
                move: originalSan,
                from: possibleMove.from,
                to: possibleMove.to,
                promotion: possibleMove.promotion,
                fen: chess.fen(),
                isLast: i === moves.length - 1,
                wasFixed: true
              });
            }
          }
        }
        // Eğer ilk hamleyse ve hala başarısız olduysa
        if (i === 0 && !success) {
          console.error("Varyantın ilk hamlesi uygulanamadı, muhtemelen başlangıç FEN'i yanlış.");
          moveList.push({
            move: originalSan,
            from: "error",
            to: "error",
            fen: chess.fen(),
            isLast: i === moves.length - 1,
            hasError: true
          });
        }
      }
    }
    
    return moveList;
  } catch (error) {
    console.error("Hamle dizisi ayrıştırma hatası:", error);
    // Hata durumunda boş bir dizi dönelim, tamamen durdurmak yerine
    return [];
  }
}

/**
 * PGN veri yapısını projede kullanılan düğüm tabanlı ağaç yapısına dönüştürür
 * @param {Object} moveData - Ana hat ve varyantları içeren hamle yapısı
 * @param {string} startFen - Başlangıç FEN'i
 * @returns {Object} - Düğüm tabanlı ağaç yapısı
 */
function convertToNodeTree(moveData, startFen) {
  try {
    // Düğüm ağacı yapısını oluşturuyoruz
    const treeData = {
      nodes: new Map(),
      metadata: {
        rootId: "root",
        mainLineNodeIds: ["root"],
        currentNodeId: "root"
      }
    };
    
    // Kök düğümü oluşturuyoruz
    treeData.nodes.set("root", {
      id: "root",
      fen: startFen,
      parentId: null,
      childrenIds: [],
      depth: 0,
      move: null,
      metadata: { isMainLine: true, comment: "Başlangıç pozisyonu" }
    });
    
    // Önce ana hattı işleyelim
    let currentNodeId = "root";
    for (let i = 0; i < moveData.mainLine.length; i++) {
      const move = moveData.mainLine[i];
      
      // Düğüm ID'si oluşturuyoruz
      const nodeId = `node_${move.from}${move.to}_${Date.now().toString(36)}_${i}`;
      
      // Yeni düğümü oluşturuyoruz
      const newNode = {
        id: nodeId,
        fen: move.fen,
        parentId: currentNodeId,
        childrenIds: [],
        depth: treeData.nodes.get(currentNodeId).depth + 1,
        move: {
          from: move.from,
          to: move.to,
          san: move.move,
          promotion: move.promotion
        },
        metadata: {
          isMainLine: true,
          isLast: move.isLast
        }
      };
      
      // Ebeveyn düğümün childrenIds'ine yeni düğümü ekliyoruz
      const parentNode = treeData.nodes.get(currentNodeId);
      parentNode.childrenIds.push(nodeId);
      
      // Ağaca yeni düğümü ekliyoruz
      treeData.nodes.set(nodeId, newNode);
      
      // Main line listesini güncelliyoruz
      treeData.metadata.mainLineNodeIds.push(nodeId);
      
      // Aktif düğümü güncelliyoruz
      currentNodeId = nodeId;
    }
    
    // Şimdi varyantları işleyelim
    for (const variant of moveData.variants) {
      // Varyantın başlayacağı düğümü buluyoruz
      const parentIndex = variant.parentMoveIndex;
      let parentNodeId = treeData.metadata.mainLineNodeIds[parentIndex + 1]; // Ana hattaki düğüm (+1 çünkü root var)
      
      let currentVariantNodeId = parentNodeId;
      for (let i = 0; i < variant.moves.length; i++) {
        const move = variant.moves[i];
        
        // Düğüm ID'si oluşturuyoruz
        const nodeId = `node_var_${move.from}${move.to}_${Date.now().toString(36)}_${i}`;
        
        // Yeni düğümü oluşturuyoruz
        const newNode = {
          id: nodeId,
          fen: move.fen,
          parentId: currentVariantNodeId,
          childrenIds: [],
          depth: treeData.nodes.get(currentVariantNodeId).depth + 1,
          move: {
            from: move.from,
            to: move.to,
            san: move.move,
            promotion: move.promotion
          },
          metadata: {
            isMainLine: false,
            isLast: move.isLast
          }
        };
        
        // Ebeveyn düğümün childrenIds'ine yeni düğümü ekliyoruz
        const parentNode = treeData.nodes.get(currentVariantNodeId);
        parentNode.childrenIds.push(nodeId);
        
        // Ağaca yeni düğümü ekliyoruz
        treeData.nodes.set(nodeId, newNode);
        
        // Aktif düğümü güncelliyoruz
        currentVariantNodeId = nodeId;
      }
    }
    
    return treeData;
  } catch (error) {
    console.error("Düğüm ağacı dönüşüm hatası:", error);
    throw new Error("Düğüm ağacı oluşturulamadı: " + error.message);
  }
}

/**
 * Map yapısını serileştirme için düz objeye dönüştürür
 * @param {Map} nodesMap - Düğüm ağacının Map yapısı
 * @returns {Object} - JSON uyumlu nesne
 */
function mapToObject(nodesMap) {
  const obj = {};
  nodesMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * Düğüm ağacını dışa aktarım formatına dönüştürür
 * @param {Object} treeData - Düğüm ağacı verisi
 * @returns {Object} - Dışa aktarım formatında veri
 */
function treeToExportFormat(treeData) {
  try {
    // Ana hat düğümlerini alıyoruz
    const mainLineNodes = treeData.metadata.mainLineNodeIds
      .filter(id => id !== "root")
      .map(id => treeData.nodes.get(id));
    
    // Alternatif varyantları buluyoruz
    const alternatives = [];
    
    // Map'i diziye çeviriyoruz
    const nodesArray = Array.from(treeData.nodes.values());
    
    // Ana hat olmayan düğümleri buluyoruz
    const mainLineNodeIds = new Set(treeData.metadata.mainLineNodeIds);
    
    // Varyant kök düğümlerini buluyoruz (ana hattaki düğümlere bağlı olan, ana hat olmayan düğümler)
    for (const node of nodesArray) {
      if (!mainLineNodeIds.has(node.id) && node.parentId && mainLineNodeIds.has(node.parentId)) {
        // Bu düğüm bir varyantın kökü
        const variantSubtree = collectSubtree(treeData, node.id);
        
        // Varyant bilgisini oluşturuyoruz
        const parentIndex = treeData.metadata.mainLineNodeIds.indexOf(node.parentId) - 1; // -1 çünkü root'u çıkarıyoruz
        
        const altVariant = {
          name: `var_${node.id.substring(0, 5)}`,
          parentVariant: "main",
          parentMoveIndex: parentIndex,
          moves: variantSubtree.map(subNode => ({
            move: subNode.move.san,
            from: subNode.move.from,
            to: subNode.move.to,
            promotion: subNode.move.promotion,
            fen: subNode.fen,
            isLast: subNode.metadata.isLast
          }))
        };
        
        alternatives.push(altVariant);
      }
    }
    
    // Dışa aktarım formatını oluşturuyoruz
    return {
      fen: treeData.nodes.get("root").fen,
      mainLine: mainLineNodes.map(node => ({
        move: node.move.san,
        from: node.move.from,
        to: node.move.to,
        promotion: node.move.promotion,
        fen: node.fen,
        isLast: node.metadata.isLast
      })),
      alternatives: alternatives
    };
  } catch (error) {
    console.error("Dışa aktarım formatı dönüşüm hatası:", error);
    throw new Error("Dışa aktarım formatı oluşturulamadı: " + error.message);
  }
}

/**
 * Belirli bir düğümün alt ağacını toplayan fonksiyon
 * @param {Object} treeData - Düğüm ağacı verisi
 * @param {string} nodeId - Başlangıç düğüm ID'si
 * @returns {Array} - Alt ağaçtaki düğümler dizisi
 */
function collectSubtree(treeData, nodeId) {
  const result = [];
  const node = treeData.nodes.get(nodeId);
  if (!node) return result;
  
  result.push(node);
  
  // Çocuk düğümleri için rekursif olarak çağır
  node.childrenIds.forEach(childId => {
    result.push(...collectSubtree(treeData, childId));
  });
  
  return result;
}

/**
 * PGN dosyasını işleyerek ChessMino puzzle seti yapısına dönüştürür
 * @param {string} pgnData - PGN formatındaki veri
 * @param {Object} options - Set bilgileri (id, başlık vb.)
 * @returns {Object} - ChessMino puzzle seti
 */
export function importPgnToPuzzleSet(pgnData, options = {}) {
  try {
    // PGN oyunlarını ayrıştırıyoruz
    const games = parsePgnGames(pgnData);
    
    // Puzzle'ları oluşturuyoruz
    const puzzles = [];
    
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const headers = extractPgnHeaders(game);
      
      // Başlangıç FEN'ini alıyoruz
      const startFen = headers.FEN || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      
      // Hamleleri ayrıştırıyoruz
      const moveData = extractPgnMoves(game);
      
      // Düğüm ağacına dönüştürüyoruz
      const treeData = convertToNodeTree(moveData, startFen);
      
      // Dışa aktarım formatına dönüştürüyoruz
      const puzzleData = treeToExportFormat(treeData);
      
      // Puzzle metadata'sını ekliyoruz
      const puzzleNumber = (i + 1).toString().padStart(2, '0');
      
      // ID'sini belirliyoruz (options.id varsa onu kullanıyoruz)
      const puzzleId = options.id ? `${options.id}_${puzzleNumber}` : `puzzle_${puzzleNumber}`;
      
      // Zorluk seviyesini belirle
      const difficulty = options.id ? options.id.charAt(5) : "1";
      
      // Başlığı oluşturuyoruz
      const title = headers.White || `Puzzle ${i + 1}`;
      
      // Puzzle'ı oluşturuyoruz
      puzzles.push({
        id: puzzleId,
        title: title,
        difficulty: parseInt(difficulty) || 1,
        fen: startFen,
        mainLine: puzzleData.mainLine,
        alternatives: puzzleData.alternatives,
        tags: getPuzzleTags(options.id || "")
      });
    }
    
    // Puzzle setini oluşturuyoruz
    return {
      id: options.id || "puzzle_set",
      title: options.title || "Puzzle Seti",
      description: options.description || "PGN'den oluşturulan puzzle seti",
      category: options.category || "practice",
      tags: getSetTags(options.id || ""),
      puzzles: puzzles
    };
  } catch (error) {
    console.error("PGN'den puzzle seti oluşturma hatası:", error);
    throw new Error("PGN'den puzzle seti oluşturulamadı: " + error.message);
  }
}

/**
 * Puzzle ID'sine göre etiketler oluşturur
 * @param {string} id - Puzzle ID'si
 * @returns {Array} - Etiketler dizisi
 */
function getPuzzleTags(id) {
  const tags = ["puzzle"];
  
  if (id && id.length >= 6) {
    const pieceType = id.charAt(3);
    const exerciseType = id.charAt(4);
    
    // Taş türü
    switch (pieceType) {
      case 'k': tags.push("kale"); break;
      case 'f': tags.push("fil"); break;
      case 'v': tags.push("vezir"); break;
      case 's': tags.push("şah"); break;
      case 'p': tags.push("piyon"); break;
      case 'a': tags.push("at"); break;
      case 'm': tags.push("mat"); break;
      case 't': tags.push("pat"); break;
      case 'r': tags.push("rok"); break;
      case 'g': tags.push("geçerken-alma"); break;
      case 'h': tags.push("şah-çekme"); break;
      case 'b': tags.push("board"); break;
    }
    
    // Egzersiz tipi
    switch (exerciseType) {
      case 'a': tags.push("alma"); break;
      case 'i': tags.push("isteme"); break;
      case 'b': tags.push("bedava"); break;
      case 'c': tags.push("canavar"); break;
      case 's': tags.push("serbest"); break;
    }
  }
  
  return tags;
}

/**
 * Set ID'sine göre etiketler oluşturur
 * @param {string} id - Set ID'si
 * @returns {Array} - Etiketler dizisi
 */
function getSetTags(id) {
  const tags = ["set"];
  
  if (id && id.length >= 6) {
    const pieceType = id.charAt(3);
    const exerciseType = id.charAt(4);
    
    // Taş türü
    switch (pieceType) {
      case 'k': tags.push("kale"); break;
      case 'f': tags.push("fil"); break;
      case 'v': tags.push("vezir"); break;
      case 's': tags.push("şah"); break;
      case 'p': tags.push("piyon"); break;
      case 'a': tags.push("at"); break;
      case 'm': tags.push("mat"); break;
      case 't': tags.push("pat"); break;
      case 'r': tags.push("rok"); break;
      case 'g': tags.push("geçerken-alma"); break;
      case 'h': tags.push("şah-çekme"); break;
      case 'b': tags.push("board"); break;
    }
    
    // Egzersiz tipi
    switch (exerciseType) {
      case 'a': tags.push("alma"); break;
      case 'i': tags.push("isteme"); break;
      case 'b': tags.push("bedava"); break;
      case 'c': tags.push("canavar"); break;
      case 's': tags.push("serbest"); break;
    }
  }
  
  return tags;
}

/**
 * PGN dosya adından ID bileşenlerini ayıklar (örn: 054fc3 -> set:054, piece:f, type:c, difficulty:3)
 * @param {string} fileName - PGN dosya adı
 * @returns {Object} - ID bileşenleri
 */
export function parseIdFromFileName(fileName) {
  try {
    // Dosya uzantısını kaldır
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    
    // Deseni ayrıştır: XXXYZD (XXX:set no, Y:taş, Z:tür, D:zorluk)
    const pattern = /^(\d{3})([kfvspamrtghb])([aibcs])([123])$/;
    const match = baseName.match(pattern);
     
    if (match) {
      return {
        setNumber: match[1],
        pieceType: match[2],
        exerciseType: match[3],
        difficulty: match[4]
      };
    }
     
    // Eğer tam eşleşme bulunamazsa, mümkün olduğunca ayıklamaya çalış
    if (baseName.length >= 3) {
      const setNumber = baseName.substring(0, 3).match(/\d{3}/) ? baseName.substring(0, 3) : "001";
      let pieceType = "b"; // varsayılan 'board'
      let exerciseType = "a"; // varsayılan 'alma'
      let difficulty = "1"; // varsayılan kolay
      
      if (baseName.length >= 4) pieceType = baseName.charAt(3);
      if (baseName.length >= 5) exerciseType = baseName.charAt(4);
      if (baseName.length >= 6) difficulty = baseName.charAt(5);
      
      return { setNumber, pieceType, exerciseType, difficulty };
    }
    
    // Hiçbir şey bulunamazsa varsayılan değerler
    return { 
      setNumber: "001", 
      pieceType: "b", 
      exerciseType: "a", 
      difficulty: "1" 
    };
  } catch (error) {
    console.error("Dosya adı ayrıştırma hatası:", error);
    return { 
      setNumber: "001", 
      pieceType: "b", 
      exerciseType: "a", 
      difficulty: "1" 
    };
  }
}

/**
 * PGN dosyasından ID oluşturur (dosya adı veya içerikten)
 * @param {string} pgnData - PGN formatındaki veri
 * @param {string} fileName - Dosya adı (isteğe bağlı)
 * @param {string} setNumber - Set numarası (isteğe bağlı, fileName olmadığında kullanılır)
 * @returns {string} - Oluşturulan ID (örn: 001fa1)
 */
export function generateIdFromPgn(pgnData, fileName = "", setNumber = "001") {
  try {
    // Öncelikle dosya adından ID bilgilerini çıkarmaya çalış
    if (fileName) {
      const idParts = parseIdFromFileName(fileName);
      return `${idParts.setNumber}${idParts.pieceType}${idParts.exerciseType}${idParts.difficulty}`;
    }
    
    // Dosya adı yoksa, PGN içeriğinden taş türünü tespit et
    const pieceType = detectPiecesFromPgn(pgnData);
        
    // Set numarası formatını düzelt
    const formattedSetNumber = setNumber.toString().padStart(3, '0');
    
    // Egzersiz tipini tespit et
    const exerciseType = detectExerciseTypeFromPgn(pgnData);
    
    // Zorluk seviyesini tespit et
    const difficulty = detectDifficultyFromPgn(pgnData);
    
    // ID'yi oluştur
    return `${formattedSetNumber}${pieceType}${exerciseType}${difficulty}`;
  } catch (error) {
    console.error("PGN'den ID oluşturma hatası:", error);
    return `${setNumber}ba1`; // Hata durumunda varsayılan ID
  }
}

/**
 * PGN dosyasından taş tipini otomatik olarak tespit eder
 * @param {string} pgnData - PGN formatındaki veri
 * @returns {string} - Tespit edilen taş tipi kodu ('f', 'k', 'v', vb.)
 */
export function detectPiecesFromPgn(pgnData) {
  try {
    const games = parsePgnGames(pgnData);
    
    if (games.length === 0) {
      return 'b'; // Varsayılan olarak 'board'
    }
    
    // İlk oyunu analiz edelim
    const game = games[0];
    const moveData = extractPgnMoves(game);
       
    // İlk hamledeki taşın tipini tespit et
    if (moveData && moveData.mainLine && moveData.mainLine.length > 0) {
      const firstMove = moveData.mainLine[0].move;
      
      if (!firstMove) return 'b'; // Hamle yoksa board
         
      // SAN notasyonundan taş tipini çıkar
      if (firstMove.startsWith('B')) {
        return 'f'; // Fil (Bishop)
      } else if (firstMove.startsWith('R')) {
        return 'k'; // Kale (Rook)
      } else if (firstMove.startsWith('Q')) {
        return 'v'; // Vezir (Queen)
      } else if (firstMove.startsWith('K')) {
        return 's'; // Şah (King)
      } else if (firstMove.startsWith('N')) {
        return 'a'; // At (Knight)
      } else {
        return 'p'; // Piyon (Pawn) - notasyonda genellikle taş harfi yok
      }
    }
    
    return 'b'; // Belirlenemezse varsayılan 'board'
  } catch (error) {
    console.error("PGN'den taş tespiti hatası:", error);
    return 'b'; // Hata durumunda varsayılan 'board'
  }
}

/**
 * PGN dosyasından egzersiz tipini otomatik olarak tespit eder
 * @param {string} pgnData - PGN formatındaki veri
 * @returns {string} - Tespit edilen egzersiz tipi kodu ('a', 'i', 'b', 'c', 's')
 */
export function detectExerciseTypeFromPgn(pgnData) {
  try {
    const games = parsePgnGames(pgnData);
    
    if (games.length === 0) {
      return 'a'; // Varsayılan olarak 'alma'
    }
    
    // Hamleler içinde 'x' varsa alma egzersizi
    let hasCaptureInMoves = false;
     
    for (const game of games) {
      const moveData = extractPgnMoves(game);
         
      // moveData kontrolü ekleyelim
      if (!moveData || !moveData.mainLine) continue;
      
      // Ana hat ve varyantlardaki tüm hamleleri kontrol et
      for (const move of moveData.mainLine) {
        if (move && move.move && move.move.includes('x')) {
          hasCaptureInMoves = true;
          break;
        }
      }
       
      // Varyantları da kontrol et
      if (!hasCaptureInMoves && moveData.variants && Array.isArray(moveData.variants)) {
        for (const variant of moveData.variants) {
          if (!variant || !variant.moves || !Array.isArray(variant.moves)) continue;
          
          for (const move of variant.moves) {
            if (move && move.move && move.move.includes('x')) {
              hasCaptureInMoves = true;
              break;
            }
          }
          if (hasCaptureInMoves) break;
        }
      }
      
      if (hasCaptureInMoves) break;
    }
    
    // Hamleler içinde 'x' varsa alma egzersizi
    if (hasCaptureInMoves) {
      return 'a'; // Alma (capture)
    }
    
    // Diğer durumlar için basit bir varsayım yapalım
    return 's'; // Serbest (free) - özel bir durum belirlenemediğinde
  } catch (error) {
    console.error("PGN'den egzersiz tespiti hatası:", error);
    return 'a'; // Hata durumunda varsayılan 'alma'
  }
}

/**
 * PGN dosyasından zorluk seviyesini otomatik olarak tespit eder
 * @param {string} pgnData - PGN formatındaki veri
 * @returns {string} - Tespit edilen zorluk seviyesi (1, 2, 3)
 */
export function detectDifficultyFromPgn(pgnData) {
  try {
    const games = parsePgnGames(pgnData);
    
    if (games.length === 0) {
      return '1'; // Varsayılan olarak kolay
    }
    
    // Ortalama hamle sayısını hesaplayalım
    let totalMoves = 0;
    let variantCount = 0;
       
    for (const game of games) {
      const moveData = extractPgnMoves(game);
      
      totalMoves += moveData.mainLine.length;
      variantCount += moveData.variants ? moveData.variants.length : 0;
    }
    
    const avgMoves = totalMoves / games.length;
    const avgVariants = variantCount / games.length;
    
    // Hamle sayısı ve varyant sayısına göre zorluk seviyesi belirle
    if (avgMoves > 12 || avgVariants > 2) {
      return '3'; // Zor
    } else if (avgMoves > 8 || avgVariants > 0) {
      return '2'; // Orta
    } else {
      return '1'; // Kolay
    }
  } catch (error) {
    console.error("PGN'den zorluk tespiti hatası:", error);
    return '1'; // Hata durumunda varsayılan kolay seviye
  }
}

/**
 * PGN dosyasını ChessMino projesinde kullanılabilecek formata dönüştürür
 * @param {string} pgnData - PGN formatındaki veri
 * @param {Object} options - Ek seçenekler
 * @returns {Object} - ChessMino veri yapısında puzzle seti
 */
export function convertPgnToChessMinoFormat(pgnData, options = {}) {
  try {
    // Otomatik ID oluştur veya options'dan al
    const setId = options.id || generateIdFromPgn(pgnData, options.setNumber);
    
    // Set başlığını oluştur
    let title = options.title;
    if (!title && setId.length >= 6) {
      // ID'den başlık oluştur
      const pieceType = setId.charAt(3);
      const exerciseType = setId.charAt(4);
            
      // Taş türü
      let pieceTypeText = "";
      switch (pieceType) {
        case 'k': pieceTypeText = "Kale"; break;
        case 'f': pieceTypeText = "Fil"; break;
        case 'v': pieceTypeText = "Vezir"; break;
        case 's': pieceTypeText = "Şah"; break;
        case 'p': pieceTypeText = "Piyon"; break;
        case 'a': pieceTypeText = "At"; break;
        case 'm': pieceTypeText = "Mat"; break;
        case 't': pieceTypeText = "Pat"; break;
        case 'r': pieceTypeText = "Rok"; break;
        case 'g': pieceTypeText = "Geçerken Alma"; break;
        case 'h': pieceTypeText = "Şah Çekme"; break;
        case 'b': pieceTypeText = "Tahta"; break;
        default: pieceTypeText = "Satranç"; break;
      }
      
      // Egzersiz tipi
      let exerciseTypeText = "";
      switch (exerciseType) {
        case 'a': exerciseTypeText = "Alma"; break;
        case 'i': exerciseTypeText = "İsteme"; break;
        case 'b': exerciseTypeText = "Bedava"; break;
        case 'c': exerciseTypeText = "Canavar"; break;
        case 's': exerciseTypeText = "Serbest"; break;
        default: exerciseTypeText = "Alıştırma"; break;
      }
      
      // Başlığı oluştur
      title = `${pieceTypeText} ${exerciseTypeText} Alıştırmaları`;
    }
    
    // Set açıklamasını oluştur
    let description = options.description;
    if (!description && setId.length >= 6) {
      const pieceType = setId.charAt(3);
      const exerciseType = setId.charAt(4);
      const difficulty = setId.charAt(5);
      
      // Taş türü açıklaması
      let pieceDesc = "";
      switch (pieceType) {
        case 'k': pieceDesc = "Kale, yatay ve dikey yönlerde hareket eder."; break;
        case 'f': pieceDesc = "Fil, çapraz yönlerde hareket eder."; break;
        case 'v': pieceDesc = "Vezir, yatay, dikey ve çapraz yönlerde hareket eder."; break;
        case 's': pieceDesc = "Şah, her yöne bir kare hareket eder."; break;
        case 'p': pieceDesc = "Piyon, ileri doğru gider ve çapraz alır."; break;
        case 'a': pieceDesc = "At, L şeklinde hareket eder."; break;
        default: pieceDesc = "Bu set, satranç becerileri geliştirmek için tasarlanmıştır."; break;
      }
      
      // Egzersiz tipi açıklaması
      let exerciseDesc = "";
      switch (exerciseType) {
        case 'a': exerciseDesc = "Bu alıştırmalarda, taşlarınızla rakip taşları alacaksınız."; break;
        case 'i': exerciseDesc = "Bu alıştırmalarda, belirtilen hamleleri yapmanız isteniyor."; break;
        case 'b': exerciseDesc = "Bu alıştırmalarda, taşları özgürce hareket ettirebilirsiniz."; break;
        case 'c': exerciseDesc = "Bu alıştırmalarda, tehlikeli pozisyonlardan kurtulmanız gerekiyor."; break;
        case 's': exerciseDesc = "Bu alıştırmalarda, kendi stratejinizi geliştirmeniz gerekiyor."; break;
        default: exerciseDesc = "Bu set çeşitli satranç alıştırmaları içerir."; break;
      }
      
      // Zorluk seviyesi açıklaması
      let difficultyDesc = "";
      switch (difficulty) {
        case '1': difficultyDesc = "Bu, başlangıç seviyesi bir settir."; break;
        case '2': difficultyDesc = "Bu, orta seviye bir settir."; break;
        case '3': difficultyDesc = "Bu, ileri seviye bir settir."; break;
        default: difficultyDesc = ""; break;
      }
      
      description = `${pieceDesc} ${exerciseDesc} ${difficultyDesc}`;
    }
    
    // Puzzle setini oluştur
    return importPgnToPuzzleSet(pgnData, {
      id: setId,
      title: title || "Satranç Alıştırmaları",
      description: description || "PGN dosyasından oluşturulan satranç alıştırmaları seti",
      category: options.category || "practice"
    });
  } catch (error) {
    console.error("PGN dönüştürme hatası:", error);
    throw new Error("PGN dönüştürülemedi: " + error.message);
  }
}

/**
 * Çoklu PGN dosyalarını işleyerek bir ders/alıştırma için kullanılacak veriye dönüştürür
 * @param {Object} pgnFiles - Dosya adı -> içerik eşlemesi
 * @param {Object} options - Dönüşüm seçenekleri
 * @returns {Object} - ChessMino formatında dersler/alıştırmalar 
 */
export function processPgnFiles(pgnFiles, options = {}) {
  try {
    const result = [];
    
    // Dosya adlarını sırala
    const fileNames = Object.keys(pgnFiles).sort();
    
    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];
      const pgnData = pgnFiles[fileName];
           
      // Dosya adından set numarasını tahmin et
      let setNumber = "001";
      
      // Dosya adı fa1.pgn gibi bir format ise, 001fa1 olarak yorumla
      if (fileName.length >= 5 && fileName.endsWith('.pgn')) {
        const baseName = fileName.substring(0, fileName.length - 4);
        if (baseName.length === 3) {
          // Set numarası, dosya adından çıkarılıyor (001fa1 -> 001)
          setNumber = String(i + 1).padStart(3, '0');
        }
      }
      
      // PGN'i işle ve sonucu listeye ekle
      const puzzleSet = convertPgnToChessMinoFormat(pgnData, {
        setNumber: setNumber,
        ...options
      });
      
      result.push(puzzleSet);
    }
    
    return result;
  } catch (error) {
    console.error("PGN dosyalarını işleme hatası:", error);
    throw new Error("PGN dosyaları işlenemedi: " + error.message);
  }
}

/**
 * Düğüm ağacını daha okunabilir bir yapıya dönüştürür (hata ayıklama için)
 * @param {Object} treeData - Düğüm ağacı verisi
 * @returns {Object} - Okunabilir ağaç yapısı
 */
export function getReadableTree(treeData) {
  const result = {
    root: null,
    nodes: [],
    mainLine: [],
    variants: []
  };
  
  // Kök düğümü ekle
  const rootNode = treeData.nodes.get("root");
  if (rootNode) {
    result.root = {
      id: rootNode.id,
      fen: rootNode.fen,
      childCount: rootNode.childrenIds.length,
      metadata: rootNode.metadata
    };
  }
  
  // Tüm düğümleri ekle
  treeData.nodes.forEach(node => {
    if (node.id !== "root") {
      result.nodes.push({
        id: node.id,
        fen: node.fen,
        move: node.move,
        parent: node.parentId,
        childCount: node.childrenIds.length,
        metadata: node.metadata
      });
    }
  });
  
  // Ana hattı ekle
  for (const nodeId of treeData.metadata.mainLineNodeIds) {
    if (nodeId !== "root") {
      const node = treeData.nodes.get(nodeId);
      result.mainLine.push({
        id: node.id,
        move: node.move,
        fen: node.fen,
        metadata: node.metadata
      });
    }
  }
  
  // Varyantları ekle
  const mainLineNodeIds = new Set(treeData.metadata.mainLineNodeIds);
  
  // Ana hat düğümlerinin çocuklarını kontrol et (ana hat olmayan çocuklar varyantların başlangıcıdır)
  for (const mainLineId of treeData.metadata.mainLineNodeIds) {
    const mainLineNode = treeData.nodes.get(mainLineId);
    
    for (const childId of mainLineNode.childrenIds) {
      if (!mainLineNodeIds.has(childId)) {
        // Bu, bir varyantın başlangıcı
        const variant = [];
        
        // Varyantı oluşturuyoruz
        let currentNodeId = childId;
        while (currentNodeId) {
          const node = treeData.nodes.get(currentNodeId);
          if (!node) break;
                  
          variant.push({
            id: node.id,
            move: node.move,
            fen: node.fen,
            metadata: node.metadata
          });
                
          // Sonraki düğüme geç (varsa)
          currentNodeId = node.childrenIds.length > 0 ? node.childrenIds[0] : null;
        }
        
        result.variants.push({
          startFrom: mainLineId,
          moves: variant
        });
      }
    }
  }
  
  return result;
}

/**
 * PGN formatındaki oyunun sonucunu döndürür
 * @param {string} pgnGame - PGN formatındaki bir oyun
 * @returns {string} - Oyunun sonucu (1-0, 0-1, 1/2-1/2, *)
 */
export function getGameResult(pgnGame) {
  try {
    const headers = extractPgnHeaders(pgnGame);
    return headers.Result || "*";
  } catch (error) {
    console.error("Oyun sonucu alma hatası:", error);
    return "*";
  }
}