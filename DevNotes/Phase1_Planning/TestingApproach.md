# ChessMino Projesi - Test Yaklaşımı Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinde benimsenecek yazılım test stratejisini tanımlar.

---

## 1. Belirlenen Yaklaşım

Projenin güvenilirliğini ve kalitesini sağlamak amacıyla test yazılacaktır.

*   **Test Seviyeleri:**
    *   **Birim Testleri:** Çekirdek iş mantığı (core sınıfları, utility fonksiyonları, store aksiyonları) test edilecektir.
    *   **Bileşen Entegrasyon Testleri:** React bileşenlerinin state ve kullanıcı etkileşimlerine tepkileri test edilecektir.
*   **Test Araçları:**
    *   Test çalıştırıcısı olarak **Jest** kullanılacaktır.
    *   React bileşen testleri için **React Testing Library** kullanılacaktır.

## 2. Karar Gerekçesi

Satranç mantığının karmaşıklığı ve projenin eğitim platformu olması nedeniyle güvenilirlik kritiktir. Testler, hataları erken aşamada tespit etmeyi, kodun doğru çalıştığından emin olmayı ve gelecekte güvenle refactoring yapmayı mümkün kılar. Jest ve React Testing Library, belirlenen teknoloji yığını için standart ve iyi desteklenen araçlardır. Detaylı bilgi için [ChessMino Projesi - Test ve Hata Yakalama Sorunları ve Çözümleri](ChessMino-Test-Hata-Yakalama-Sorunlari.md) belgesine başvurulabilir.

---

Bu belge, projenin test yaklaşımını netleştirir.