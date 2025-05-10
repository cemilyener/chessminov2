import { Chess } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * ChessContentManager - Düğüm tabanlı veri yapısıyla satranç içeriğini yöneten sınıf
 * PGN dosyalarını ayrıştırma ve standart JSON formatına dönüştürme işlevleri sunar
 */
class ChessContentManager {
  constructor(initialFen = DEFAULT_FEN) {
    // FEN doğrulaması olmadan direkt kullan
    const startFen = initialFen || DEFAULT_FEN;
    
    this.resetTree(startFen);
    this.contentType = 'generic';
    this.parsedGames = []; // Ayrıştırılan oyunları saklamak için
  }

  /**
   * Ağacı sıfırla
   * @param {string} fen - Başlangıç FEN'i
   */
  resetTree(fen) {
    // FEN validasyonu olmadan direkt kullan
    const startFen = fen || DEFAULT_FEN;
    
    // Düğüm ağacını sıfırla
    this.tree = {
      nodes: new Map(),
      metadata: {
        rootId: "root",
        mainLineNodeIds: ["root"],
        currentNodeId: "root"
      }
    };
    
    // Kök düğümü oluştur
    this.tree.nodes.set("root", {
      id: "root",
      fen: startFen,
      parentId: null,
      childrenIds: [],
      depth: 0,
      move: null,
      metadata: { isMainLine: true, comment: "Başlangıç pozisyonu" }
    });
    
    // Chess.js motorunu başlat
    try {
      this.chess = new Chess(startFen);
    } catch (error) {
      console.warn("FEN yükleme hatası, standart başlangıç pozisyonu kullanılacak:", error);
      this.chess = new Chess();
    }
  }
  
  /**
   * PGN'den veri yükle - Birden fazla oyunu destekler
   * @param {string} pgn - PGN formatındaki veri
   * @returns {boolean} - İşlem başarılı mı?
   */
  async loadFromPgn(pgn) {
    try {
      console.log("PGN yükleme başlatılıyor...");
      
      // PGN'i ayrıştır
      const games = this.splitPgnGames(pgn);
      if (games.length === 0) {
        console.error("Geçerli oyun bulunamadı");
        return false;
      }
      
      console.log(`${games.length} oyun bulundu, ayrıştırılıyor...`);
      
      this.parsedGames = [];
      
      for (const game of games) {
        try {
          // Her oyun için ağacı yeniden başlat
          const parsedGame = parse(game, { startRule: "game" });
          
          if (!parsedGame) {
            console.error("Oyun ayrıştırılamadı");
            continue;
          }
          
          // Varyant kontrolü için debug log
          const movesWithVariations = parsedGame.moves.filter(m => 
            m.variations && m.variations.length > 0
          );
          
          console.log(`Varyant içeren hamle sayısı: ${movesWithVariations.length}`);
          if (movesWithVariations.length > 0) {
            console.log("İlk varyantlı hamle örneği:", movesWithVariations[0]);
          }
          
          // FEN başlığını al
          let fen = DEFAULT_FEN;
          if (parsedGame.tags && parsedGame.tags.FEN) {
            fen = parsedGame.tags.FEN;
          }
          
          // Her oyun için resetTree çağır
          this.resetTree(fen);
          
          // Ana hat ve varyantları işle
          if (parsedGame.moves && parsedGame.moves.length > 0) {
            const chess = new Chess(fen);
            this.processMainLine(chess, parsedGame.moves, this.tree, "root");
          }
          
          // Ayrıştırılmış oyunu sakla
          this.parsedGames.push({
            tags: parsedGame.tags,
            fen,
            gameTree: {
              nodes: new Map(this.tree.nodes), // Sadece referansı değil içeriği kopyalıyoruz
              metadata: JSON.parse(JSON.stringify(this.tree.metadata)) // Derin kopya yapıyoruz
            }
          });
          
        } catch (parseError) {
          console.error("Oyun ayrıştırma hatası:", parseError);
        }
      }
      
      console.log(`${this.parsedGames.length} oyun başarıyla ayrıştırıldı`);
      return this.parsedGames.length > 0;
      
    } catch (error) {
      console.error("PGN yükleme hatası:", error);
      return false;
    }
  }
  
  /**
   * Ana hattı işle
   * @param {Chess} chess - Chess.js nesnesi
   * @param {Array} moves - Hamleler dizisi
   * @param {Object} tree - Oyun ağacı
   * @param {string} parentId - Ebeveyn düğüm ID'si
   * @returns {Object} - Güncellenen oyun ağacı
   */
  processMainLine(chess, moves, tree, parentId) {
    let currentId = parentId;
    
    for (const moveData of moves) {
      // SAN notasyonunu al
      const sanNotation = moveData.notation?.notation;
      if (!sanNotation) continue;
      
      try {
        // Hamleyi uygula
        const result = chess.move(sanNotation);
        if (!result) continue;
        
        // Düğümü ekle
        const newId = this.addNode(tree, currentId, {
          from: result.from,
          to: result.to,
          san: result.san,
          promotion: result.promotion
        }, chess.fen());
        
        // Bu düğümün ana hat olduğunu belirt
        tree.nodes.get(newId).metadata.isMainLine = true;
        
        // Ana hat düğüm ID'lerini güncelle
        if (!tree.metadata.mainLineNodeIds.includes(newId)) {
          tree.metadata.mainLineNodeIds.push(newId);
        }
        
        // Güncel düğüm ID'sini güncelle
        currentId = newId;
        
        // Varyantları işle
        if (moveData.variations && moveData.variations.length > 0) {
          console.log(`"${sanNotation}" hamlesi için ${moveData.variations.length} varyant bulundu`);
          
          for (const variation of moveData.variations) {
            // Geçici pozisyonu kaydet
            const tempPosition = chess.fen();
            
            // Hamleyi geri al
            chess.undo();
            
            // Varyantın başlangıç pozisyonunda yeni bir chess instance'ı oluştur
            const tempChess = new Chess(tree.nodes.get(currentId).parentId ? 
                                      tree.nodes.get(tree.nodes.get(currentId).parentId).fen : 
                                      tree.nodes.get("root").fen);
            
            // Varyantı işle
            this.processVariation(tempChess, variation, tree, tree.nodes.get(currentId).parentId);
            
            // Ana hatta devam et
            chess.load(tempPosition);
          }
        }
        
        // Yorum ekle (varsa)
        if (moveData.commentAfter) {
          tree.nodes.get(newId).metadata.comment = moveData.commentAfter;
        }
        
      } catch (error) {
        console.error(`Hamle işleme hatası (${sanNotation}):`, error);
      }
    }
    
    return tree;
  }
  
  /**
   * Varyantı işle
   * @param {Chess} chess - Chess.js nesnesi
   * @param {Array} moves - Varyant hamleleri dizisi
   * @param {Object} tree - Oyun ağacı
   * @param {string} parentId - Varyantın başladığı ebeveyn düğüm ID'si
   * @returns {Object} - Güncellenen oyun ağacı
   */
  processVariation(chess, moves, tree, parentId) {
    // DEBUG: Varyant işleme
    console.log(`Varyant işleniyor: Ebeveyn=${parentId}, Hamle sayısı=${moves.length}`);
    
    let currentId = parentId;
    
    for (const moveData of moves) {
      // SAN notasyonunu al
      const sanNotation = moveData.notation?.notation;
      if (!sanNotation) continue;
      
      try {
        // Hamleyi uygula
        const result = chess.move(sanNotation);
        if (!result) continue;
        
        // Düğümü ekle
        const newId = this.addNode(tree, currentId, {
          from: result.from,
          to: result.to,
          san: result.san,
          promotion: result.promotion
        }, chess.fen());
        
        // Bu düğümün ana hat olmadığını işaretle
        tree.nodes.get(newId).metadata.isMainLine = false;
        
        // Güncel düğüm ID'sini güncelle
        currentId = newId;
        
        // Yorum ekle (varsa)
        if (moveData.commentAfter) {
          tree.nodes.get(newId).metadata.comment = moveData.commentAfter;
        }
        
        // İç içe varyantları işleme (şimdilik desteklenmiyor)
        // NOT: İç içe varyantlar şu an desteklenmiyor.
        // İleride desteklenmesi planlanıyorsa bu kodu etkinleştirin.
        // if (moveData.variations && moveData.variations.length > 0) {
        //   for (const variation of moveData.variations) {
        //     this.processVariation(chessClone, variation, tree, currentId);
        //   }
        // }
        
      } catch (error) {
        console.error(`Varyant işleme hatası (${sanNotation}):`, error);
      }
    }
    
    return tree;
  }
  
  /**
   * Ağaca yeni düğüm ekle
   * @param {Object} tree - Oyun ağacı
   * @param {string} parentId - Ebeveyn düğüm ID'si
   * @param {Object} move - Hamle verisi
   * @param {string} fen - FEN pozisyonu
   * @returns {string} - Yeni eklenen düğümün ID'si
   */
  addNode(tree, parentId, move, fen) {
    // Benzersiz ID oluştur
    const nodeId = `node_${move.from}${move.to}_${Date.now().toString(36)}`;
    
    // Ebeveyn düğümü bul
    const parentNode = tree.nodes.get(parentId);
    if (!parentNode) {
      throw new Error(`Ebeveyn düğüm bulunamadı: ${parentId}`);
    }
    
    // Yeni düğümü oluştur
    const newNode = {
      id: nodeId,
      fen: fen,
      parentId: parentId,
      childrenIds: [],
      depth: parentNode.depth + 1,
      move: {...move},
      metadata: {
        isMainLine: parentNode.metadata.isMainLine,
        isLast: false,
        comment: ""
      }
    };
    
    // Ağaca yeni düğümü ekle
    parentNode.childrenIds.push(nodeId);
    tree.nodes.set(nodeId, newNode);
    
    return nodeId;
  }
  
  /**
   * PGN oyunlarını ayır
   * @param {string} pgnData - PGN formatındaki veri
   * @returns {Array} - Ayrıştırılmış oyunların dizisi
   */
  splitPgnGames(pgnData) {
    if (!pgnData || typeof pgnData !== 'string') {
      return [];
    }
    
    const games = [];
    let currentGame = "";
    let insideGame = false;
    const lines = pgnData.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      if (line.startsWith('[Event ')) {
        if (insideGame && currentGame.trim()) {
          games.push(currentGame.trim());
        }
        currentGame = line;
        insideGame = true;
      } else if (insideGame) {
        currentGame += '\n' + line;
      }
    }
    
    // Son oyunu ekle
    if (insideGame && currentGame.trim()) {
      games.push(currentGame.trim());
    }
    
    return games;
  }
  
  /**
   * JSON çıktısı oluştur - Belirlenen formatta
   * @returns {Object} - Standart JSON çıktı formatı
   */
  export() {
    try {
      const puzzles = this.parsedGames.map((game, index) => {
        // Ağaç yapısına genel bakış
        console.log("Ağaç yapısına genel bakış:", {
          düğümSayısı: game.gameTree.nodes.size,
          anaHatDüğümleri: game.gameTree.metadata.mainLineNodeIds?.length || 0,
          kökDüğümBilgisi: game.gameTree.nodes.get("root")?.metadata
        });
        
        // Ana hat düğümlerini topla
        const mainLine = [];
        const mainLineNodeIds = game.gameTree.metadata.mainLineNodeIds || [];
        
        // Root düğümü atla, sadece hamleleri içeren düğümleri işle
        for (let i = 1; i < mainLineNodeIds.length; i++) {
          const nodeId = mainLineNodeIds[i];
          const node = game.gameTree.nodes.get(nodeId);
          if (node && node.move) {
            mainLine.push(node.move.san);
          }
        }
        console.log("Ana hat hamleleri:", mainLine);
        
        // Varyant başlangıç düğümlerini bul
        const variantStarterNodes = [];
        
        // Ana hat düğümlerinin tüm çocuklarını kontrol et
        for (let i = 0; i < mainLineNodeIds.length; i++) {
          const nodeId = mainLineNodeIds[i];
          const node = game.gameTree.nodes.get(nodeId);
          if (!node || !node.childrenIds) continue;
          
          // Ana hat düğümünün ana hat olmayan çocuklarını bul = bunlar varyant başlangıçlarıdır
          for (const childId of node.childrenIds) {
            const childNode = game.gameTree.nodes.get(childId);
            if (childNode && childNode.metadata.isMainLine === false) {
              variantStarterNodes.push({
                nodeId: childId,
                mainLineParentId: nodeId,
                mainLineIndex: Math.max(0, i - 1) // Ana hat hamle indeksi
              });
            }
          }
        }
        console.log("Varyant başlangıç düğümleri:", variantStarterNodes);
        
        // Ana hat olmayan düğümleri kontrol et
        let nonMainLineCount = 0;
        game.gameTree.nodes.forEach((node, id) => {
          if (id !== "root" && node.metadata && node.metadata.isMainLine === false) {
            nonMainLineCount++;
          }
        });
        console.log(`Toplam ${nonMainLineCount} ana hat olmayan düğüm var`);
        
        // Varyantları topla
        const variations = [];
        
        // Her varyant başlangıç düğümü için
        for (const starter of variantStarterNodes) {
          const variantMoves = [];
          let currentId = starter.nodeId;
          
          // Varyant düğümleri boyunca ilerle
          while (currentId) {
            const node = game.gameTree.nodes.get(currentId);
            if (!node) break;
            
            // Hamleyi ekle
            if (node.move) {
              variantMoves.push(node.move.san);
            }
            
            // Varyant dalının sonuna geldik mi?
            if (!node.childrenIds || node.childrenIds.length === 0) {
              break;
            }
            
            // Bir sonraki düğüme geç (ilk çocuk)
            currentId = node.childrenIds[0];
          }
          
          // Varyant hamleleri boş değilse ekle
          if (variantMoves.length > 0) {
            variations.push({
              startMoveIndex: starter.mainLineIndex,
              moves: variantMoves
            });
            console.log(`Varyant bulundu: Ana hat indeksi ${starter.mainLineIndex}, Hamleler: ${variantMoves.join(', ')}`);
          }
        }
        console.log("Tespit edilen varyantlar:", variations);
        
        // Puzzle nesnesi oluştur
        return {
          id: `puzzle-${index + 1}`,
          title: game.tags?.White || `Puzzle ${index + 1}`,
          difficulty: parseInt(game.tags?.White?.match(/\d+/) || "1"),
          fen: game.fen,
          mainLine,
          variations
        };
      });
      
      // Standart JSON çıktısı
      const result = {
        metadata: {
          title: "Chess Puzzle Set",
          source: "ChessBase",
          count: puzzles.length
        },
        puzzles
      };
      
      console.log("Export sonuç varyantları:", 
        result.puzzles.map(p => ({id: p.id, variantCount: p.variations.length, variants: p.variations}))
      );
      
      return result;
    } catch (error) {
      console.error("Export hatası:", error);
      return { metadata: {}, puzzles: [] };
    }
  }
  
  /**
   * Ağaçtan hamleleri ve varyantları çıkar - İyileştirilmiş metot
   * @param {Object} tree - Oyun ağacı
   * @returns {Object} - Ana hat hamleleri ve varyantlar
   */
  extractMovesFromTree(tree) {
    const mainLine = [];
    const variations = [];
    
    // 1. Ana hat düğümlerini ve hamlelerini topla
    const mainLineNodeIds = tree.metadata.mainLineNodeIds || [];
    
    // Ana hat hamlelerini topla (root düğümünü atla)
    for (let i = 1; i < mainLineNodeIds.length; i++) {
      const nodeId = mainLineNodeIds[i];
      const node = tree.nodes.get(nodeId);
      if (node && node.move) {
        mainLine.push(node.move.san);
      }
    }
    console.log("Ana hat hamleleri toplandı:", mainLine);
    
    // 2. Varyant başlangıç düğümlerini bul
    // Bunlar, ana hat düğümlerinin ana hat olmayan çocuklarıdır
    const variantStarterNodes = [];
    for (let i = 0; i < mainLineNodeIds.length; i++) {
      const nodeId = mainLineNodeIds[i];
      const node = tree.nodes.get(nodeId);
      if (!node || !node.childrenIds) continue;
      
      // Ana hat düğümünün tüm çocuklarını kontrol et
      for (const childId of node.childrenIds) {
        const childNode = tree.nodes.get(childId);
        
        // Ana hat olmayan bir çocuk = varyant başlangıcı
        if (childNode && !childNode.metadata?.isMainLine) {
          variantStarterNodes.push({
            nodeId: childId,
            mainLineParentId: nodeId,
            mainLineIndex: i > 0 ? i - 1 : 0 // Ana hat hamle indeksi
          });
        }
      }
    }
    console.log("Varyant başlangıç düğümleri:", variantStarterNodes);
    
    // 3. Her varyant için hamleleri topla
    for (const starter of variantStarterNodes) {
      const variantMoves = [];
      let currentId = starter.nodeId;
      
      // Varyant düğümleri boyunca ilerle
      while (currentId) {
        const node = tree.nodes.get(currentId);
        if (!node) break;
        
        // Hamleyi ekle
        if (node.move) {
          variantMoves.push(node.move.san);
        }
        
        // Varyant dalının sonuna geldik mi?
        if (!node.childrenIds || node.childrenIds.length === 0) {
          break;
        }
        
        // Bir sonraki düğüme geç (ilk çocuk)
        currentId = node.childrenIds[0];
      }
      
      // Varyant hamleleri boş değilse ekle
      if (variantMoves.length > 0) {
        variations.push({
          startMoveIndex: starter.mainLineIndex,
          moves: variantMoves
        });
        console.log(`Varyant bulundu: Ana hat indeksi ${starter.mainLineIndex}, Hamleler: ${variantMoves.join(', ')}`);
      }
    }
    
    console.log("Sonuçta ana hat:", mainLine);
    console.log("Sonuçta varyantlar:", variations);
    
    // extractMovesFromTree metoduna eklenecek
    // Başlangıçta ağaç yapısını kontrol et
    console.log("Ağaç yapısına genel bakış:", {
      düğümSayısı: tree.nodes.size,
      anaHatDüğümleri: tree.metadata.mainLineNodeIds?.length || 0,
      kökDüğümBilgisi: tree.nodes.get("root")?.metadata
    });
    
    // Varyant başlangıç düğümlerini aradıktan sonra
    if (variantStarterNodes.length === 0) {
      console.log("UYARI: Hiç varyant başlangıç düğümü bulunamadı!");
      // Ana hat olmayan tüm düğümleri say
      let nonMainLineCount = 0;
      tree.nodes.forEach((node, id) => {
        if (id !== "root" && node.metadata && node.metadata.isMainLine === false) {
          nonMainLineCount++;
          console.log("Ana hat olmayan düğüm:", {
            id,
            parentId: node.parentId,
            hamle: node.move?.san
          });
        }
      });
      console.log(`Toplamda ${nonMainLineCount} ana hat olmayan düğüm bulundu ama varyant başlangıcı tespit edilemedi.`);
    }
    
    return { mainLine, variations };
  }
  
  /**
   * Mevcut FEN'i al
   * @returns {string} - FEN pozisyonu
   */
  getCurrentFen() {
    const currentNodeId = this.tree.metadata.currentNodeId;
    return this.tree.nodes.get(currentNodeId)?.fen || this.chess.fen();
  }
}

export default ChessContentManager;