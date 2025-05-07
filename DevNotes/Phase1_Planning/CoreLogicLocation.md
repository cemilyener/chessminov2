# ChessMino Projesi - Çekirdek Mantık Konumu Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinin temel iş mantığını içeren sınıfların kaynak kodundaki konumunu tanımlar.

---

## 1. Belirlenen Konum

Projenin çekirdek iş mantığını yöneten ana sınıflar (manager'lar) `src/core/` klasöründe yer alacaktır.

*   Örnek: `ChessTreeManager.js` gibi sınıflar bu klasörde bulunacaktır.

## 2. Karar Gerekçesi

Bu yaklaşım, uygulamanın temel, işlevsel mantığını UI bileşenlerinden, state yönetiminden ve yardımcı fonksiyonlardan net bir şekilde ayırmayı amaçlar. `core/` klasörü, projenin kalbindeki ana işlevselliği merkezi bir yerde toplar, bu da kodun anlaşılırlığını ve bakımını kolaylaştırır.

---

Bu belge, projenin temel iş mantığının konumunu netleştirir.