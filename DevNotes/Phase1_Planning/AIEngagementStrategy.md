# ChessMino Projesi - AI Etkileşim Stratejisi Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinin geliştirilmesinde yapay zeka (AI) araçlarıyla (Claude, GitHub Copilot vb.) nasıl etkileşim kurulacağını tanımlar.

---

## 1. Belirlenen Stratejiler

AI araçlarını verimli kullanmak ve bağlam kaybı, token sınırlamaları gibi sorunları aşmak için aşağıdaki stratejiler benimsenecektir:

*   **DEV_NOTES.md Merkezi Yönetimi:** Proje durumu, alınan kararlar, çözülen sorunlar ve sonraki adımlar `DEV_NOTES.md` dosyasında düzenli olarak kaydedilecektir. Bu dosya, AI sohbetleri arasında bağlam aktarımının ana aracı olacaktır.
*   **Yapılandırılmış Sohbet Başlatma:** Her yeni AI sohbetine başlarken, projenin genel bağlamını, mevcut durumu (DEV_NOTES.md'den ilgili kısımlar) ve spesifik isteği içeren standart bir şablon kullanılacaktır.
*   **Görevlerin Parçalara Bölünmesi:** AI'dan yardım istenirken, büyük görevler küçük, yönetilebilir alt görevlere bölünecek ve adım adım ilerlenecektir.
*   **Teknik Kısıtlamaların Belgelenmesi:** Chess.js gibi kütüphanelerin bilinen teknik sınırlılıkları ve workaround'ları `TECHNICAL_CONSTRAINTS.md` dosyasında belgelenecek ve AI ile paylaşılacaktır.
*   **AI Çıktılarının Eleştirel Değerlendirilmesi:** AI tarafından üretilen kod ve öneriler, projenin kısıtlamaları ve genel mimari prensipleri açısından dikkatlice gözden geçirilecektir.
*   **AI Sohbet Sonlandırma Şablonu:** Sohbet bitirilirken, bir sonraki sefere hazırlık amacıyla AI'dan kısa bir özet istenecektir.

## 2. Karar Gerekçesi

Bu stratejiler, AI araçlarının güçlü yönlerinden (hızlı kod üretimi, bilgi sağlama) faydalanırken, zayıf yönlerini (bağlam kaybı, tutarsızlık) yönetmeyi amaçlar. Düzenli belgeleme ve yapılandırılmış etkileşim, geliştirme sürecinin daha kontrollü, verimli ve az sorunlu olmasını sağlar. Detaylı bilgi için [ChessMino Projesi - AI Etkileşim Sorunları ve Çözümleri](ChessMino-AI-Etkilesim-Sorunlari.md) belgesine başvurulabilir.

---

Bu belge, AI araçlarıyla çalışırken izlenecek temel stratejileri netleştirir.