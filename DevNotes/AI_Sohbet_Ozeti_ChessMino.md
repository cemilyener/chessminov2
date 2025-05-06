# ChessMino Projesi - AI Sohbet Özeti ve Geliştirme Kılavuzu

**Bu belge, [Tarih: 6 Mayıs 2025] tarihinde AI (GitHub Copilot / Claude) ile yapılan kapsamlı sohbetin özetidir. Projenin temel kararlarını, karşılaşılan sorunlara yönelik yaklaşımları, AI etkileşim stratejilerini ve yol haritasının ana hatlarını içerir. Yeni AI sohbetlerine başlarken bağlam aktarımı için kullanılır.**

---

## 1. Proje Tanımı ve Temel Kararlar

*   **Proje Amacı:** 3-8 yaş arası, satranç bilmeyen çocuklara yönelik etkileşimli satranç öğrenme ve puzzle platformu.
*   **MVP (Minimum Uygulanabilir Ürün) Kapsamı:** (Detaylar için bkz: DevNotes/Phase1_Planning/GoalAndScope.md)
    *   Puzzle Sayfası (Alternatif hamle okuyabilen 2 basit puzzle, hamle listesi).
    *   Ders Sayfası (Tahta, açıklama, ilerleme butonu, dummy içerik).
    *   Board Editor (Taş dizebilme, hamle listesi, dummy CRUD/PGN butonları).
    *   Lokal Dummy Veri Yönetimi (JSON).
    *   Basit Rastgele Hamle Yapan AI Botu.
    *   Basit Login, Hazır Puzzle Menü ve Video Sayfası Tasarımları.
*   **Teknoloji Yığını:** React 19, Zustand, Chess.js 1.2, React-chessboard, Tailwind CSS 4, Vite. (Detaylar için bkz: DevNotes/Phase1_Planning/TechnologyStack.md)
*   **Kodlama ve Dokümantasyon Dili:** Kodlar JavaScript, yorumlar ve dokümantasyon ağırlıklı olarak Türkçe. (Detaylar için bkz: DevNotes/Phase1_Planning/CodingLanguage.md)
*   **Klasör Yapısı:** Modüler, domain-driven yapı (`src/components/{common,chess,puzzle,editor}`, `src/store`, `src/utils/{chess,puzzle,editor}`, `src/core`, `src/data` vb.). (Detaylar için bkz: DevNotes/Phase1_Planning/FolderStructure.md)
*   **İsimlendirme Standartları:** Bileşenler/Sayfalar `PascalCase`, fonksiyonlar/değişkenler/dosyalar/klasörler `camelCase`, sabitler `UPPER_CASE_WITH_UNDERSCORES`. (Detaylar için bkz: DevNotes/Phase1_Planning/NamingStandards.md)
*   **Temel Veri Yapısı:** Satranç içeriği (puzzle, ders, editör) için düğüm (node) tabanlı, Map kullanan esnek ağaç yapısı. (Detaylar için bkz: DevNotes/Phase1_Planning/CoreDataStructure.md)
*   **Çekirdek Mantık Konumu:** `ChessTreeManager` gibi ana yönetim sınıfları `src/core/` klasöründe yer alacak. (Detaylar için bkz: DevNotes/Phase1_Planning/CoreLogicLocation.md)

---

## 2. Karşılaşılan Sorunlar ve Çözüm Yaklaşımları

Sohbet boyunca tespit edilen ana sorun alanları ve bunlara yönelik benimsenecek temel yaklaşımlar: (Detaylar için ilgili belgelere başvurunuz)

*   **Veri Yapısı Tutarsızlıkları:** Standart bir düğüm tabanlı Map yapısı kullanılacak. (Bkz: ChessMino-Veri-Yapisi-Sorunlari.md)
*   **Chess.js Kütüphanesi Sınırlamaları:** Şahsız konum gibi özel durumlar için workaround'lar kullanılacak, `TECHNICAL_CONSTRAINTS.md` belgelenecek. (Bkz: ChessMino-Chess-js-Sinirlamalari.md)
*   **Store Yönetimi Karmaşası:** Domain-driven ayrım yapılacak, sorumluluklar netleştirilecek. (Bkz: Store-Yonetimi-Karmasa.md)
*   **Dosya Organizasyonu:** Belirlenen modüler klasör yapısı uygulanacak. (Bkz: ChessMino-Kod-Buyume-Yonetimi-Sorunlari.md)
*   **AI Etkileşim Sorunları:** `DEV_NOTES.md` ile bağlam yönetilecek, yapılandırılmış şablonlar kullanılacak. (Bkz: ChessMino-AI-Etkilesim-Sorunlari.md)
*   **Kod Büyüme Yönetimi:** Modülerlik, bileşen ayrımı, utility/hook kullanımı ile yönetilecek. (Bkz: ChessMino-Kod-Buyume-Yonetimi-Sorunlari.md)
*   **Belgeleme Eksiklikleri:** Çeşitli seviyelerde belgeleme yapılacak. (Bkz: ChessMino-Belgeleme-Eksiklikleri-Sorunlari.md)
*   **Test ve Hata Yakalama:** Birim ve bileşen testleri yazılacak, hata yönetilecek. (Bkz: ChessMino-Test-Hata-Yakalama-Sorunlari.md)
*   **Performans Sorunları:** Gereksiz render'lar, veri yönetimi odak alanları olacak. (Bkz: ChessMino-Performans-Sorunlari.md)
*   **Git Yönetimi:** Net branch stratejisi, anlamlı/sık commit mesajları kullanılacak. (Bkz: ChessMino-Git-Yonetimi-Sorunlari.md)
*   **Puzzle Set ID Yapısı:** `001ka1` formatındaki akıllı isimlendirme sistemi benimsenecek. (Bkz: akilli_isimlendirme_sistemi.md)

---

## 3. Geliştirme Süreci ve AI İş Akışı

*   **Aşamalı Gelişim:** Proje, yol haritasındaki aşamalara ve alt görevlere bölünerek ilerleyecek. Odak noktası şu an MVP (Aşama I'in ilk kısmı).
*   **DEV_NOTES.md Kullanımı:** Her çalışma seansı veya AI sohbeti sonunda, yapılanlar, sorunlar, çözümler, kararlar ve sonraki adımlar DEV_NOTES.md dosyasına kaydedilecek.
*   **AI Sohbet Başlatma:** Yeni sohbete başlarken, bu özet belge (veya DEV_NOTES.md'nin ilgili kısımları) ve üzerinde çalışılacak spesifik kod dosyaları/blokları AI'ya sunulacak.
*   **AI Sohbet Sonlandırma:** Sohbet bitirilirken, bir sonraki sefere hazırlık için AI'dan kısa bir özet istenecektir.
*   **AI Rolü:** Planlama, mimari taslakları, kod iskeletleri, sorun analizi ve çözüm önerileri sunma.
*   **Geliştirici Rolü:** Karar verme, AI çıktılarını entegre etme, kendi notlarını tutma, ilerlemeyi yönetme.

---

## 4. Proje Yol Haritası (Ana Hatlarıyla)

Bu bölüm, projenin uzun vadeli yol haritasının ana aşamalarını özetler. Detayları, ilgili aşamalara gelindiğinde planlanacaktır. (Detaylar için bkz: project_roadmap.md)

### I. Aşama 1: Temel Eğitim Platformu (Odak Noktası)

*   A. Temel Yapı (Tamamlandı)
*   B. BoardEditor Geliştirme
*   C. Veri Yönetimi ve API
*   D. Öğretmen Araçları
*   E. Ek Eğitim Modülleri
*   F. Kullanıcı Deneyimi ve Motivasyon

### II. Aşama 2: Mat ve Taktik Geliştirme

*   A. Modül Yeniden Kullanımı
*   B. İçerik Geliştirme

### III. Sonraki Aşamalar (3-5)

*   Teknik Oyun Sonu Konumları
*   Analiz ve Planlama Becerileri
*   Açılış ve Körleme Çalışmaları

### IV. Pazarlama, Marka ve Büyüme

*   Marka Kimliği, UI/UX Tasarımı
*   Kullanım Kılavuzu, Çoklu Dil Desteği
*   Pazarlama, Test Yayını, Şirketleşme, Yatırım

---

**Bu belge, ChessMino projesinin temelini ve gelişim yönünü özetler. Yeni AI sohbetlerine başlarken bu belgeyi sunarak projenin bağlamını hızlıca aktarabilirsiniz.**