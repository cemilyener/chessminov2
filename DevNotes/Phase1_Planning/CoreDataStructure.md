# ChessMino Projesi - Çekirdek Veri Yapısı Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinin temel veri yapısını, özellikle satranç içeriği (puzzle, ders, editör pozisyonları) için kullanılacak modeli tanımlar.

---

## 1. Sorun: Farklı İhtiyaçlar İçin Ortak Yapı Gereksinimi

Proje, puzzle varyantları, adım adım ders anlatımları, tahta düzenleme ve raporlama gibi farklı işlevler için satranç pozisyonlarını ve hamle dizilerini saklama ihtiyacı duyar. Bu ihtiyaçlar başlangıçta farklı veri formatlarına yol açabilir (Bkz: Veri Yapısı Tutarsızlıkları Sorunları). Ancak, kodlama kolaylığı, tutarlılık ve bakım için bu farklı ihtiyaçları karşılayabilecek **ortak, esnek bir çekirdek veri yapısı** gereklidir.

## 2. Çözüm: Düğüm Tabanlı Esnek Ağaç Yapısı

Bu ihtiyaçları karşılamak için, daha önce tartıştığımız **düğüm (node) tabanlı bir ağaç yapısı** benimsenecektir. Bu yapı, hamle dizilerini ve varyant dallanmalarını temsil etmek için kullanılır. Yapının esnekliği, her düğüme (yani her pozisyona/hamleye) farklı bağlamlara özel (puzzle, ders, editör) metadata (ek bilgi) ekleyebilme yeteneğinden gelir.

### 2.1. Ağaç Yapısının Genel Modeli

Ağaç, birbiriyle parent-child ilişkisi olan düğümlerden oluşur. Tüm düğümler, benzersiz ID'leri anahtar olmak üzere bir JavaScript `Map` nesnesinde saklanır.

```javascript
// Ağaç yapısının genel görünümü
const chessContentTree = {
  nodes: new Map(), // Tüm düğümler burada saklanır (ID -> Düğüm Objesi)
  metadata: {
    rootId: "root", // Ağacın başlangıç düğümünün ID'si
    // ... Ağacın tamamına ait genel metadata (örn. puzzle başlığı, ders konusu)
  }
};

2.2. Düğüm (Node) Yapısı
Ağaçtaki her düğüm, belirli bir pozisyonu ve o pozisyona ulaşmak için yapılan hamleyi temsil eder. Her düğüm aşağıdaki bilgilere sahiptir:

// Bir düğüm (node) objesinin yapısı
const node = {
  id: "benzersiz_dugum_id", // Örn: "node_e2e4_1678888888"
  fen: "rnbqkbnr/...", // Bu düğümdeki pozisyonun FEN'i
  parentId: "ebeveyn_dugum_id", // Bir önceki pozisyonun düğüm ID'si (root için null)
  childrenIds: ["cocuk_dugum_id_1", "cocuk_dugum_id_2"], // Bu pozisyondan sonraki hamlelerin düğüm ID'leri
  depth: 0, // Ağaçtaki derinlik (root: 0, ilk hamle: 1 vb.)
  move: { // Bu düğüme ulaşmak için yapılan hamle (root için null)
    from: "e2",
    to: "e4",
    san: "e4", // Standart Satranç Notasyonu
    promotion: "q" // Varsa terfi taşı
  },
  metadata: { // Esnek alan! Buraya farklı ihtiyaçlara özel bilgiler eklenir.
    // Genel Metadata:
    comment: "Bu pozisyon hakkında yorum", // Ders veya puzzle açıklaması
    isMainLine: true, // Ana varyant hattı mı?
    // Puzzle'a Özel Metadata:
    isCorrectMove: true, // Puzzle çözümünde bu hamle doğru mu?
    isLast: false, // Puzzle çözümünün son hamlesi mi?
    evaluation: 0.2, // Pozisyon değerlendirmesi (editör/analiz için)
    // Derse Özel Metadata:
    teachingPoints: ["Piyonlar ileri gider", "Başlangıç hamlesi"], // Öğretim noktaları
    highlightedSquares: [{ square: 'e4', color: 'yellow' }, { square: 'e5', color: 'yellow' }], // Renklendirilecek kareler
    // ... Diğer ihtiyaçlara özel alanlar eklenebilir
  }
};

2.3. Yapıyı Yöneten Sınıf (ChessTreeManager)
Bu ağaç yapısını doğrudan manipüle etmek yerine, bu işlevleri yerine getiren bir yönetici sınıf (ChessTreeManager) kullanılacaktır. Bu sınıf, ağaç üzerinde gezinme, düğüm ekleme/silme, metadata güncelleme gibi işlemleri kolaylaştırır.

// src/core/ChessTreeManager.js (Örnek Metotlar)
class ChessTreeManager {
  constructor(initialFen) { /* ... ağacı başlatır ... */ }
  addNode(parentId, move, fen, metadata = {}) { /* ... yeni düğüm ekler ... */ }
  goToNode(nodeId) { /* ... ağaçta belirli bir düğüme gider ... */ }
  getCurrentFen() { /* ... mevcut düğümün FEN'ini döner ... */ }
  updateNodeMetadata(nodeId, newMetadata) { /* ... düğümün metadata'sını günceller ... */ }
  // ... Diğer metotlar (silme, kopyalama, PGN'den yükleme vb.)
}

3. Bu Yapı Neden İhtiyaçları Karşılıyor?
Bu düğüm tabanlı esnek ağaç yapısı, projenin farklı ihtiyaçlarını aşağıdaki şekillerde karşılar:
Puzzle Oynatma:
Ağaç yapısı, ana hat ve alternatif varyantları doğal olarak temsil eder.
metadata.isCorrectMove ve metadata.isLast alanları, kullanıcının hamlelerinin doğruluğunu ve puzzle'ın bitip bitmediğini kontrol etmek için kullanılır.
ChessTreeManager ile ağaçta gezinerek (kullanıcının hamlelerine göre doğru çocuk düğüme giderek) puzzle ilerlemesi takip edilir.
Puzzle Oluşturma (Board Editor):
ChessTreeManager'ın addNode, updateNodeMetadata gibi metotları, editörde hamle ekleme (yeni düğüm), pozisyon değiştirme (FEN güncelleme), yorum veya doğru hamle bilgisini ekleme işlemlerini yönetir.
Ağaç yapısı, editörde oluşturulan varyantları saklamak için kullanılır.
Ders Sayfası:
Ders içeriği, genellikle doğrusal bir hamle dizisi (ana hat) olarak ağaçta saklanır.
metadata.comment, metadata.teachingPoints, metadata.highlightedSquares gibi alanlar, her adımda gösterilecek açıklamaları ve görsel vurguları tutar.
ChessTreeManager'ın goToNode veya goForward/goBack metotları, derste "İleri" / "Geri" butonlarının işlevselliğini sağlar.
PDF Çıktısı:
Ağaç yapısı üzerinde gezinerek (hem ana hat hem de varyantlar), her düğümün FEN'i (diyagram için) ve hamle bilgisi (move.san) alınarak PGN formatı veya özel bir rapor formatı oluşturulabilir.
metadata.comment gibi bilgiler rapora dahil edilebilir.
Soru Bankası:
Her puzzle veya ders, bu ağaç yapısı formatında saklanır (veritabanında veya JSON dosyasında).
Ağacın metadata alanına (veya ağacın kendisini saran bir objeye) puzzle/dersin genel bilgileri (başlık, zorluk, konu, yazar, yorumlar) eklenebilir.
Kodlama Kolaylığı:
Tek bir standart yapı kullanmak, farklı modüllerde (puzzle, ders, editör) veri işleme mantığını basitleştirir.
ChessTreeManager gibi bir sınıf, karmaşık ağaç işlemlerini soyutlayarak bileşen kodunu temiz tutar.
Map kullanımı, düğümlere ID ile hızlı erişim sağlar.
4. Karar Gerekçesi
Bu düğüm tabanlı esnek ağaç yapısı, projenin temel ihtiyaçlarını tutarlı, yönetilebilir ve genişletilebilir bir şekilde karşılar. Farklı bağlamlara özel bilgileri (metadata) aynı yapı içinde saklayabilmesi, kod tekrarını azaltır ve projenin büyümesine olanak tanır. Bu yapı, hem puzzle varyantları gibi karmaşık senaryoları hem de doğrusal ders akışları gibi daha basit senaryoları modellemek için uygundur.
Bu belge, projenin çekirdek veri yapısı kararını netleştirir.


---

Temel veri yapısı kararı netleştiğine göre, listedeki bir sonraki maddeye geçebiliriz:

**7. Kritik Kütüphane Yaklaşımları:**

*   **Soru:** Chess.js gibi kütüphanelerin sınırlamalarına (şahsız konum gibi) nasıl workaround uygulanacağı belirlenmeliydi. Daha önceki sohbetlerde bu konuda detaylı bir MD belgesi hazırlamıştık (`ChessMino-Chess-js-Sinirlamalari.md`). Bu belgedeki yaklaşımlar (manuel FEN işleme, `validate: false` kullanımı, `useRef` ile instance yönetimi) hala geçerli mi? Eklemek veya değiştirmek istediğiniz bir şey var mı?

Bu karar, Chess.js ile çalışırken karşılaşılacak spesifik teknik zorlukları ve çözümlerini belirler.
