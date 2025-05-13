Projenin Genel Amacı:
Kullanıcıların satranç öğrenmesini sağlayan, interaktif bir web platformu oluşturmak.
Ana Bileşenler ve Modüller:
Puzzle Sayfası: Kullanıcının belirli bir satranç pozisyonunu (puzzle) çözdüğü ana sayfa. Hızlı hamle yapma ve soru geçişleri kritiktir.
Ders Sayfası: Satranç konseptlerinin adım adım öğretildiği, muhtemelen birden fazla sahne/pozisyon içeren sayfa. Özel açıklamalar, vurgular ve multimedya (ses, video) içerebilir.
Board Editor: Öğretmen/Admin kullanıcıların yeni puzzle ve ders içeriği oluşturup düzenleyebileceği araç. PGN import yeteneği hayati önem taşır.
Soru Bankası: Oluşturulan tüm puzzle ve ders setlerinin saklandığı, kategorize edildiği ve yönetildiği sistem.
PDF Çalışma Sayfası Üretici: Belirli setlerden veya pozisyonlardan basılabilir çalışma sayfaları (örn. 6 diyagramlı) oluşturan fonksiyon/sayfa.
Veri Kaynakları ve Dönüşümü:
Temel içerik kaynağı PGN dosyalarıdır.
pgnUtils.js modülü PGN'den hamleleri (ana hat ve varyantları), FEN'leri ve metadata'yı (ID, başlık vb.) ayrıştırır.
Bu ayrıştırılan veri, projenin standart içsel ID bazlı düğüm ağacı yapısına dönüştürülür.
Veri Yapısı ve Yönetimi:
İçsel Yapı: Her hamle/pozisyonu temsil eden, ID'si olan, parentId ve childrenIds ile bağlı düğümlerden oluşan Map tabanlı bir ağaç yapısı. Varyantlar bu ağaç içinde dallanmalar olarak temsil edilir.
Dışsal/Depolama Formatı: İçsel ağaç yapısını temsil eden, JSON uyumlu (Map objeye çevrilmiş, ID'ler string) standardize edilmiş bir format.
Yönetim: ChessContentManager gibi ortak bir sınıf, içsel düğüm ağacını ve Chess.js motorunu yönetir. Modüller bu Manager üzerinden veriyle etkileşime girer.
Metadata: Set seviyesinde (Akıllı İsimlendirme ile belirlenen ID, başlık, zorluk, tür) ve düğüm seviyesinde (özellikle dersler için kullanılacak ek açıklamalar, vurgular, multimedya referansları gibi esnek bilgiler için metadata alanı) kullanılır.
Temel Teknik Kararlar ve Yaklaşımlar:
ID bazlı düğüm ağacı referansı (varyant yönetimi ve JSON uyumu için).
Lazy FEN hesaplama/cacheleme (bellek optimizasyonu için).
Akıllı State Yönetimi (Zustand) ve React optimizasyonları (Render performansı için).
Esnek metadata alanı (genişletilebilirlik ve hata toleransı için).
Veri depolama için JSON (geliştirme) ve MongoDB (ileride) kullanımı.
Eksik/bozuk verinin tolere edilmesi (akışın kesilmemesi).
Mevcut Durum (DevNotes'a göre):
Temel ders verisi yükleme ve ilerleme kaydetme fonksiyonları üzerinde çalışıldı.
PGN'den veriyi ayrıştırıp içsel/dışsal (şu anki) formatlara dönüştüren pgnUtils.js geliştirildi.
Veri yapısı standardizasyonu için temel kararlar alındı ve DevNotes'a eklendi.
Sırada, pgnUtils.js çıktısını kararlaştırılan standardize JSON formatına dönüştürme adımı var.