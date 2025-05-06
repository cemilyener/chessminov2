# ChessMino Projesi - Belgeleme Yaklaşımı Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinde benimsenecek temel belgeleme yaklaşımını tanımlar.

---

## 1. Belirlenen Yaklaşımlar

Projenin anlaşılırlığını, bakımını ve sürdürülebilirliğini sağlamak amacıyla aşağıdaki belgeleme stratejileri benimsenecektir:

*   **DEV_NOTES.md:** Projenin kök dizininde veya `/DevNotes` klasöründe tutulan, yaşayan bir geliştirme günlüğü olarak kullanılacaktır. Proje ilerlemesi, karşılaşılan sorunlar, çözümleri, alınan kararlar ve sonraki adımlar buraya kaydedilecektir. AI sohbetleri arasında bağlam aktarımı için ana kaynak olacaktır.
*   **TECHNICAL_CONSTRAINTS.md:** Kullanılan kütüphanelerin (özellikle Chess.js) bilinen teknik sınırlılıkları, workaround'lar ve özel implementasyon detayları bu dosyada belgelenecektir. AI ile çalışırken tutarsız önerileri önlemeye yardımcı olacaktır.
*   **Modül/Klasör README'leri:** `/src` altındaki ana modül veya klasörler (örn. `/components/editor`, `/store/`, `/core/`) içine, o bölümün amacını ve içeriğini özetleyen kısa `README.md` dosyaları eklenecektir.
*   **Kod İçi Yorumlar:** Karmaşık mantık içeren kod blokları, fonksiyonlar ve sınıflar için açıklayıcı yorumlar kullanılacaktır.
*   **Karar Kayıtları:** Önemli mimari veya teknik kararların nedenleri ve alternatifleri DEV_NOTES.md içinde veya ayrı bir formatta kaydedilecektir.

## 2. Karar Gerekçesi

Bu belgeleme yaklaşımı, projenin farklı seviyelerindeki bilgiyi (genel durum, teknik detaylar, anlık ilerleme) düzenli bir şekilde kaydetmeyi amaçlar. Etkili belgeleme, hem geliştiricilerin (veya tek geliştiricinin) projeyi daha iyi anlamasını sağlar hem de AI araçlarıyla daha verimli ve tutarlı bir etkileşim kurulmasına olanak tanır. Detaylı bilgi için [ChessMino Projesi - Belgeleme Eksiklikleri Sorunları ve Çözümleri](ChessMino-Belgeleme-Eksiklikleri-Sorunlari.md) belgesine başvurulabilir.

---

Bu belge, projenin belgeleme yaklaşımını netleştirir.