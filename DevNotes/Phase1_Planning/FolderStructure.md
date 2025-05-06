# ChessMino Projesi - Klasör Yapısı Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinin kaynak kodunun (`src/` dizini altında) organizasyon yapısını tanımlar.

---

## 1. Belirlenen Klasör Yapısı

Proje için aşağıdaki modüler ve alan odaklı (domain-driven) klasör yapısı benimsenecektir:
src/
├── assets/ # Statik dosyalar (resimler, sesler, ikonlar)
├── components/ # Yeniden kullanılabilir React bileşenleri
│ ├── common/ # Genel amaçlı UI elemanları (Button, Modal, Navbar)
│ ├── chess/ # Satranç tahtası, taşlar gibi temel görsel bileşenler
│ ├── puzzle/ # Puzzle modülüne özel bileşenler (PuzzleBoard, MoveList)
│ └── editor/ # BoardEditor modülüne özel bileşenler (VariantEditor, BoardControls)
├── pages/ # Uygulamanın ana rotalarına karşılık gelen sayfalar
├── store/ # Zustand state yönetimi dosyaları (domain bazlı gruplanabilir)
├── utils/ # Saf yardımcı fonksiyonlar (kategori bazlı gruplanır)
│ ├── chess/ # Chess.js ile ilgili yardımcılar (FEN, hamle)
│ ├── puzzle/ # Puzzle verisi/mantığı ile ilgili yardımcılar
│ └── editor/ # Editor ile ilgili yardımcılar
├── services/ # API çağrıları, harici servisler
├── hooks/ # Özel React hook'ları
├── core/ # Uygulamanın çekirdek mantığı, yöneticiler (ChessTreeManager gibi)
├── data/ # Lokal JSON verileri (puzzles, lessons vb.)
├── App.jsx # Ana uygulama bileşeni
└── main.jsx # Uygulama başlangıç noktası

## 2. Karar Gerekçesi

Bu yapı, kodun okunabilirliğini, bakımını ve ölçeklenebilirliğini artırmayı amaçlar. Dosyalar sorumluluklarına ve ait oldukları işlevsel alanlara göre net bir şekilde gruplandırılmıştır. Bu organizasyon, hem geliştiricilerin hem de AI araçlarının kod tabanını daha kolay anlamasına yardımcı olacaktır.

---

Bu belge, projenin fiziksel organizasyonunu netleştirir.