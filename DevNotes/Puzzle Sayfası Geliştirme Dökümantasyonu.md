# Puzzle Sayfası Geliştirme Dökümantasyonu
**Oluşturma Tarihi:** [1 haziran 2025]  
**Proje:** ChessMino v2  
**Hedef:** Claude Opus ile Puzzle Sayfası Geliştirme

---

## 📋 Bölüm 1: Opus'un Görmesi Gereken Mevcut Sayfalar

### 1.1 Kritik Referans Sayfalar
- [ ] `src/pages/PuzzlePage.jsx` (mevcut basit versiyon)
- [ ] `src/components/puzzle/PuzzlePage.jsx` (alternatif versiyon)
- [ ] `src/pages/SimplePuzzleCreator.jsx` (puzzle formatı referansı)
- [ ] `src/pages/HomePage.jsx` (navigasyon yapısı)

### 1.2 Veri Yapısı Referansları
- [ ] `src/data/puzzles/001ka1.json` (puzzle formatı örneği)
- [ ] `src/data/puzzles/003ka3.json` (alternatif format örneği)
- [ ] `DevNotes/Phase1_Planning/CoreDataStructure.md` (veri yapısı kararları)

### 1.3 Store ve State Yönetimi
- [ ] `src/store/useChessStore.js` (ana chess store)
- [ ] `src/store/usePuzzleStore.js` (puzzle store - varsa)
- [ ] `src/utils/chess/ChessContentManager.js` (veri işleme)
- [ ] `DevNotes/MimariDeğişiklikler.md` (store değişiklikleri)

### 1.4 Bileşen Örnekleri
- [ ] `src/components/puzzleCreator/PuzzleCreationStep.jsx` (chessboard kullanımı)
- [ ] `src/components/puzzleCreator/MetadataStep.jsx` (UI pattern'leri)

---

## 🔧 Bölüm 2: Netleştirilmesi Gereken Konular

### 2.1 Puzzle Veri Formatı Kararları
- [ ] **Standart Format Seçimi**
  - Mevcut puzzle dosyalarındaki format farklılıkları
  - JSON şema standardizasyonu
  - FEN pozisyon işleme

- [ ] **Varyant Yapısı**
  - Ana hat vs alternatif hamle yapısı
  - Düğüm tabanlı ağaç yapısı implementasyonu
  - Move navigation sistemi

### 2.2 UI/UX Kararları
- [ ] **Sayfa Layout'u**
  - Chessboard boyutu ve konumu
  - Yan panel içeriği (hamle listesi, ipuçları)
  - Responsive tasarım yaklaşımı

- [ ] **Etkileşim Modeli**
  - Hamle yapma yöntemi (drag&drop vs click)
  - Geri alma/ileri alma navigasyonu
  - Ipucu gösterme mekanizması

### 2.3 State Management Yaklaşımı
- [ ] **Store Organizasyonu**
  - Zustand vs React state kullanımı
  - Chess.js instance yönetimi
  - Puzzle progress tracking

- [ ] **Veri Akışı**
  - Puzzle yükleme süreci
  - Move validation akışı
  - Success/failure state yönetimi

---

## 🎯 Bölüm 3: Geliştirme Aşamaları

### 3.1 Aşama 1: Temel Yapı (Opus Görev 1)
- [ ] Puzzle sayfası boilerplate
- [ ] Route yapılandırması
- [ ] Temel layout ve navigation
- [ ] Chessboard entegrasyonu

**Çıktı:** Çalışan temel sayfa yapısı

### 3.2 Aşama 2: Veri Entegrasyonu (Opus Görev 2)
- [ ] Puzzle JSON dosyalarından veri okuma
- [ ] ChessContentManager entegrasyonu
- [ ] FEN pozisyon yükleme
- [ ] Başlangıç pozisyonu gösterimi

**Çıktı:** Puzzle verilerini okuyan ve gösteren sayfa

### 3.3 Aşama 3: Hamle Sistemi (Opus Görev 3)
- [ ] Chess.js move validation
- [ ] Drag&drop hamle implementasyonu
- [ ] Doğru/yanlış hamle feedback'i
- [ ] Move history tracking

**Çıktı:** Kullanıcının hamle yapabildiği interaktif sayfa

### 3.4 Aşama 4: Puzzle Mantığı (Opus Görev 4)
- [ ] Ana hat vs varyant logic
- [ ] Puzzle completion detection
- [ ] Success/failure state'leri
- [ ] Next puzzle navigation

**Çıktı:** Tam puzzle çözme deneyimi

### 3.5 Aşama 5: Gelişmiş Özellikler (Opus Görev 5)
- [ ] Ipucu sistemi
- [ ] Pozisyon navigasyonu
- [ ] Progress saving
- [ ] Performance optimizasyonları

**Çıktı:** Production-ready puzzle sayfası

---

## 📝 Bölüm 4: Her Aşama İçin Karar Gereken Detaylar

### 4.1 Aşama 1 Kararları
- [ ] **Route yapısı:** `/puzzle/:puzzleId` vs `/puzzle/:setId/:puzzleIndex`
- [ ] **Layout tercih:** Single column vs two column
- [ ] **Navigation:** Header menü vs breadcrumb
- [ ] **Theme:** HomePage ile tutarlılık

### 4.2 Aşama 2 Kararları
- [ ] **Veri kaynağı:** Static JSON vs dynamic loading
- [ ] **Error handling:** Puzzle bulunamazsa ne olacak
- [ ] **Loading states:** Skeleton vs spinner
- [ ] **Caching strategy:** Memory vs localStorage

### 4.3 Aşama 3 Kararları
- [ ] **Move input:** Touch support gerekli mi
- [ ] **Validation timing:** Real-time vs on complete
- [ ] **Feedback style:** Modal vs inline messages
- [ ] **Sound effects:** Ses dosyaları var mı

### 4.4 Aşama 4 Kararları
- [ ] **Puzzle completion:** Auto-advance vs manual next
- [ ] **Progress tracking:** Local vs global state
- [ ] **Variant handling:** Show alternatives automatically mi
- [ ] **Scoring system:** Puan sistemi var mı

### 4.5 Aşama 5 Kararları
- [ ] **Hint system:** Visual hints vs move suggestions
- [ ] **Analytics:** User behavior tracking gerekli mi
- [ ] **Accessibility:** Keyboard navigation support
- [ ] **Performance:** Virtual scrolling vs pagination

---

## 🔗 Bölüm 5: Opus için Hazır Olması Gereken Bilgiler

### 5.1 Teknik Şartnameler
- **React Version:** 18+
- **Chess Library:** chess.js
- **Chessboard:** react-chessboard
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

### 5.2 Proje Context
- **Target Users:** 3-8 yaş çocuklar + öğretmenler
- **Platform:** Web (responsive)
- **Browser Support:** Modern browsers
- **Performance Target:** <3s page load

### 5.3 Mevcut Codebase Patterns
- **Component Structure:** Functional components + hooks
- **State Pattern:** Zustand stores
- **Styling Pattern:** Tailwind utility classes
- **File Organization:** Feature-based folders

---

## ✅ Opus Görevi Checklist

### Başlamadan Önce Kontrol
- [ ] Tüm referans dosyalar yüklendi
- [ ] Karar gereken konular netleştirildi
- [ ] Hangi aşamada kalacağımız belirlendi
- [ ] Performance ve accessibility gereksinimleri açık

### Her Aşama Sonrası
- [ ] Kod review yapıldı
- [ ] Test edildi (manuel)
- [ ] DevNotes güncellendi
- [ ] Sonraki aşama için karar verildi

---

## 📚 Ek Referanslar

### İlgili DevNotes Dosyaları
- `DevNotes/Phase1_Planning/GoalAndScope.md`
- `DevNotes/Analysis/1.ChessMino-Veri-Yapisi-Sorunlari.md`
- `DevNotes/klasör düzenleme.md`

### Diğer Implementasyonlar
- TeacherBoardPage.jsx (chessboard patterns)
- HomeworkGeneratorPage.jsx (layout patterns)

---

**Not:** Bu döküman, Claude Opus ile efficient çalışma için hazırlanmıştır. Her aşama için spesifik, actionable görevler içerir.