# Store Yönetimi Karmaşası Analizi

**Güncellenme Tarihi:** 6 Mayıs 2025

## İçindekiler
1. [Benzer İsimli Store Dosyaları](#1-benzer-i̇simli-store-dosyaları)
2. [Sorumluluk Sınırları Belirsiz Utility'ler](#2-sorumluluk-sınırları-belirsiz-utilityler)
3. [ChessVariantManager ve PuzzleVariantManager Çakışmaları](#3-chessvariantmanager-ve-puzzlevariantmanager-çakışmaları)
4. [Çözüm Önerileri](#4-çözüm-önerileri)
5. [Uygulama Planı](#5-uygulama-planı)

## 1. Benzer İsimli Store Dosyaları

Projemizde benzer isimli store dosyaları, geliştirme ve bakım süreçlerinde karışıklık yaratmaktadır. Bu sorunun detayları aşağıda verilmiştir:

### 1.1. Mevcut Durum

Projede birden fazla store dosyası benzer isimlendirme yapıları kullanmaktadır:

```javascript
// örnek: store.js
import { create } from 'zustand';

export const useStore = create((set) => ({
  currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  setCurrentFen: (fen) => set({ currentFen: fen }),
  // ...diğer state ve fonksiyonlar
}));

// örnek: boardEditorStore.js
import { create } from 'zustand';

const useBoardEditorStore = create((set) => ({
  currentFen: '8/8/8/8/8/8/8/8 w - - 0 1',
  setCurrentFen: (fen) => set({ currentFen: fen }),
  // ...benzer state ve fonksiyonlar
}));

// örnek: puzzleStore.js (benzer fonksiyonlara sahip üçüncü bir store)
```

### 1.2. Tespit Edilen Sorunlar

- **Tutarsız İsimlendirme**: Store dosyalarında camelCase, PascalCase ve kebab-case karışık olarak kullanılmaktadır
- **Farklı Dosya Uzantıları**: Bazı store dosyaları .js olarak oluşturulmuş
- **Benzer İsimlendirme, Farklı İçerik**: `useStore`, `useBoardEditorStore` gibi isimler içerikleri hakkında yeterli bilgi vermiyor
- **Belirsiz Kapsam Sınırları**: Hangi store'un hangi veriyi yönetmesi gerektiği konusunda belirsizlikler var

Bu durum şu sorunlara yol açmaktadır:

1. Geliştiriciler doğru store'u bulmakta zorlanıyor
2. Aynı işlevsellik farklı store'larda tekrarlanıyor
3. İsim çakışmalarından dolayı yanlış import'lar yapılabiliyor
4. Kodun bakımı ve güncellenmesi zorlaşıyor

## 2. Sorumluluk Sınırları Belirsiz Utility'ler

Utility fonksiyonları ve store'lar arasındaki sorumluluk sınırları net değil. Birçok işlev hem utility hem de store içinde tekrarlanıyor.

### 2.1. Mevcut Durum

```javascript
// src/utils/chessUtils.js
export function createChessInstance(fen) {/* ... */}

// src/utils/boardEditorStore.js
const useBoardEditorStore = create((set) => ({
  // ...
  initializeChess: (fen) => set(state => ({
    chess: createChessInstance(fen), // Utility fonksiyon çağrılıyor
    currentFen: fen
  })),
  // ...
}));

// Bir bileşende
const Component = () => {
  // Bazen doğrudan utility kullanılıyor
  const chessInstance = createChessInstance(fen);
  
  // Bazen store üzerinden aynı işlem yapılıyor
  const { initializeChess } = useBoardEditorStore();
  initializeChess(fen);
};
```

### 2.2. Tespit Edilen Sorunlar

- **Sorumluluk Dağılımı**: İş mantığı bazen utility'lerde, bazen store'larda, bazen bileşenlerde yer alıyor
- **Tutarsız Erişim Modelleri**: Bazı durumlar utility fonksiyonları doğrudan çağrılırken, benzer işlevsellik için bazen store'lar kullanılıyor
- **Belirsiz Yetki Sınırları**: Hangi işlevin nerede olması gerektiği konusunda bir standart yok
- **Kod Tekrarı**: Benzer işlevsellik farklı yerlerde yeniden uygulanıyor

Bu durum şu sorunlara yol açmaktadır:

1. Gereksiz kod tekrarı ve bakım zorluğu
2. Tutarsız API desenleri
3. Bileşenler ve store'lar arasında karmaşık bağımlılıklar
4. İşlevsellik değişikliklerinin birden çok yerde güncelleme gerektirmesi

## 3. ChessVariantManager ve PuzzleVariantManager Çakışmaları

Projede iki farklı varyant yöneticisi bulunmaktadır ve bunlar benzer ancak tam olarak aynı olmayan API'lere sahiptir:

### 3.1. Mevcut Durum

```javascript
// src/utils/ChessVariantManager.js
class ChessVariantManager {
  constructor(initialFen) {/* ... */}
  setup(fen) {/* ... */}
  recordMove(from, to, promotion) {/* ... */}
  // ...diğer metotlar
}

// src/utils/PuzzleVariantManager.js
class PuzzleVariantManager {
  constructor(initialFen) {/* ... */}
  setup(fen) {/* ... */}
  recordMove(from, to, promotion) {/* ... */} // Benzer isim ama farklı implementasyon
  // ...diğer metotlar
}
```

### 3.2. Tespit Edilen Sorunlar

- **Duplicate Kod**: İki sınıf da benzer işlevselliği farklı şekillerde uyguluyor
- **Farklı API'ler**: Benzer isimdeki metodlar farklı davranabilir, bu karışıklık yaratır
- **Tutarsız Hata İşleme**: Her sınıf farklı hata işleme stratejileri kullanıyor
- **Ortak Temel Sınıf Eksikliği**: Ortak işlevsellik bir temel sınıfta toplanmamış

Bu durum şu sorunlara yol açmaktadır:

1. Kod tekrarı ve bakım zorluğu  
2. Tutarsız davranış modelleri
3. Hataların takibi ve çözümünün zorlaşması
4. Yeni özellik eklerken her iki sınıfı da güncelleme gerekliliği

## 4. Çözüm Önerileri

### 4.1. Store Mimarisi Yeniden Yapılandırması

#### A. Domain-Driven Store Ayrımı

Store'ları işlevsel alanlara göre ayırmak ve net isimlendirme kuralları getirmek:

```javascript
// /src/stores/puzzle/puzzleStateStore.js - Puzzle veri durumu
// /src/stores/puzzle/puzzleUIStore.js - Puzzle UI durumu
// /src/stores/editor/editorStateStore.js - Editor veri durumu
// /src/stores/editor/editorUIStore.js - Editor UI durumu
// /src/stores/app/appSettingsStore.js - Uygulama ayarları
```

#### B. Store Etki Alanları İçin Belgeleme

Her store dosyasının başına, o store'un sorumlu olduğu ve olmadığı alanları belirten bir belgeleme eklemek:

```javascript
/**
 * @file puzzleStateStore.js
 * @description Bu store, puzzle verilerinin durumunu yönetir.
 * 
 * Sorumlu olduğu alanlar:
 * - Aktif puzzle ve puzzle set verileri
 * - Puzzle yükleme ve kaydetme işlemleri
 * - Puzzle ilerleme durumu
 * 
 * Sorumlu olmadığı alanlar:
 * - UI durum yönetimi (bkz. puzzleUIStore.js)
 * - Tahta manipülasyonu (bkz. ChessEngine.js)
 */
```

### 4.2. Utility ve Service Katmanı Oluşturma

#### A. Service Katmanı Ekleme

İş mantığını store'lardan ayırıp service katmanına taşıyarak, sorumlulukları netleştirmek:

```javascript
// /src/services/chess/ChessEngineService.js
export class ChessEngineService {
  createInstance(fen) {/* ... */}
  validateMove(from, to) {/* ... */}
  // ...diğer metotlar
}

// /src/services/puzzle/PuzzleService.js
export class PuzzleService {
  loadPuzzle(id) {/* ... */}
  checkSolution(moves) {/* ... */}
  // ...diğer metotlar
}
```

#### B. Utility Fonksiyonlar için Kategori Ayrımı

Utility fonksiyonları açık kategorilere ayırmak:

```javascript
// /src/utils/chess/fenUtils.js - FEN işlemleri
// /src/utils/chess/moveUtils.js - Hamle işlemleri
// /src/utils/common/arrayUtils.js - Dizi işlemleri
// /src/utils/common/stringUtils.js - Metin işlemleri
```

### 4.3. Variant Manager Birleştirmesi

#### A. Ortak Temel Sınıf Oluşturma

ChessVariantManager ve PuzzleVariantManager için ortak bir temel sınıf oluşturmak:

```javascript
// /src/core/AbstractVariantManager.js
export class AbstractVariantManager {
  constructor(initialFen) {/* ... */}
  
  // Ortak temel metodlar
  setup(fen) {/* ... */}
  getBoardPosition() {/* ... */}
  getCurrentLine() {/* ... */}
  
  // Alt sınıfların implement etmesi gereken metodlar
  recordMove(from, to, promotion) {
    throw new Error('Bu metod alt sınıflarda implement edilmelidir');
  }
}

// /src/core/ChessVariantManager.js
import { AbstractVariantManager } from './AbstractVariantManager';

export class ChessVariantManager extends AbstractVariantManager {
  recordMove(from, to, promotion) {
    // ChessVariantManager'a özel implementasyon
  }
  // ...diğer özelleştirilmiş metotlar
}

// /src/core/PuzzleVariantManager.js
import { AbstractVariantManager } from './AbstractVariantManager';

export class PuzzleVariantManager extends AbstractVariantManager {
  recordMove(from, to, promotion) {
    // PuzzleVariantManager'a özel implementasyon
  }
  checkSolution() {
    // Sadece PuzzleVariantManager'a özel metod
  }
  // ...diğer özelleştirilmiş metotlar
}
```

#### B. Adapter Deseni Kullanımı

Farklı API'lere sahip olması gereken durumlarda adapter deseni kullanmak:

```javascript
// /src/adapters/PuzzleManagerAdapter.js
export class PuzzleManagerAdapter {
  constructor(variantManager) {
    this.manager = variantManager;
  }
  
  // PuzzleVariantManager API'si
  checkMove(from, to) {
    // ChessVariantManager metodlarını kullanarak implementation
    return this.manager.isMoveLegal(from, to);
  }
}
```

## 5. Uygulama Planı

### 5.1. Kısa Vadeli Değişiklikler (1-2 Hafta)

1. Store dosyalarının kapsamlarını netleştiren dokümantasyon eklemek
2. Store dosyalarını anlamlı şekilde yeniden adlandırmak
3. Store'ların sorumluluk alanlarını belirlemek ve readme dosyalarına eklemek

### 5.2. Orta Vadeli Değişiklikler (2-4 Hafta)

1. Domain-driven store organizasyonu için dosya yapısını refactor etmek
2. Utility fonksiyonları kategorilere ayırmak
3. Service katmanı oluşturmak ve iş mantığını buraya taşımak

### 5.3. Uzun Vadeli Değişiklikler (1-2 Ay)

1. AbstractVariantManager temel sınıfını oluşturmak
2. ChessVariantManager ve PuzzleVariantManager'ı bu temel sınıftan türetmek
3. Gerekli adapter'ları eklemek
4. API dokümantasyonunu güncellemek

## 6. Sonuç

Store yönetimi karmaşası, ChessMino projesinde teknik borç oluşturan önemli sorunlardan biridir. Bu sorunların çözülmesi, kodun bakımını kolaylaştıracak, geliştirme hızını artıracak ve yeni özelliklerin eklenmesini daha güvenli hale getirecektir.

Önerilen çözümler, SOLID prensiplerini dikkate alarak, sorumlulukların netleştirilmesini ve kodun daha modüler hale getirilmesini amaçlamaktadır. Bu değişikliklerin uygulanması, projenin uzun vadeli sürdürülebilirliğini önemli ölçüde artıracaktır.