# ChessMino Projesi - Hedef ve Kapsam (MVP)

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinin hedef kitlesini ve Minimum Uygulanabilir Ürün (MVP) kapsamını tanımlar.

---

## 1. Hedef Kitle

*   **Yaş Aralığı:** 3-8 yaş arası çocuklar.
*   **Satranç Bilgi Seviyesi:** Satranç hakkında **hiç bilgisi olmayan** başlangıç seviyesindeki kullanıcılar.

Uygulamanın arayüzü, içeriği ve etkileşimleri bu yaş grubunun ve bilgi seviyesinin ihtiyaçlarına uygun olarak basitleştirilmiş, eğlenceli ve yönlendirici olacaktır.

---

## 2. Minimum Uygulanabilir Ürün (MVP) Kapsamı

MVP, projenin temel değerini sunan, en az özellik setine sahip ilk çalışan versiyonudur. Bu versiyon, projenin ana modüllerinin (Puzzle, Ders, Editör) temel işlevlerini içerecektir.

MVP'ye Dahil Edilecek Özellikler:

*   **Puzzle Sayfası:**
    *   Alternatif hamle yollarını okuyabilen (veri yapısı desteği ile) **sadece 2 adet** puzzle oynatma.
    *   Kullanıcının yaptığı hamlelerin tahtanın yanında metin olarak gösterilmesi.
    *   *(Tam varyant ağacı navigasyonu veya kapsamlı puzzle seti desteği MVP sonrası aşamalara bırakılmıştır.)*
*   **Ders Sayfası:**
    *   Basit bir tahta görseli, yanında açıklama metni alanı ve ilerleme butonu (slayt benzeri yapı).
    *   İçerik başlangıçta dummy data (örnek metinler ve pozisyonlar) ile doldurulacaktır.
    *   *(Detaylı ders içeriği veya interaktif egzersizler MVP sonrası aşamalara bırakılmıştır.)*
*   **Board Editor:**
    *   Tahtaya yandan seçilen taşları sürükleyip bırakarak dizebilme/yerleştirebilme.
    *   Tahtada yapılan hamlelerin (taş taşıma) yanda metin olarak gösterilmesi.
    *   Dummy (işlevsiz) CRUD (Oluştur/Oku/Güncelle/Sil) butonları (veri kaydetme/yükleme işlevselliği olmadan).
    *   Dummy (işlevsiz) PGN yükleme butonu.
    *   *(Tam PGN parse etme, varyant düzenleme veya pozisyon kaydetme işlevselliği MVP sonrası aşamalara bırakılmıştır.)*
*   **Veri Yönetimi (Lokal):**
    *   Puzzle, ders ve soru bankası için lokal JSON dummy data kullanımı.
    *   Soru bankası için dummy filtreleme arayüzü (işlevsiz).
    *   *(API entegrasyonu, veritabanı (MongoDB) veya tam veri işleme MVP sonrası aşamalara bırakılmıştır.)*
*   **AI Bot (Basit):**
    *   `chess.moves()` metodunu kullanarak rastgele hamle yapan basit bir AI botu (kodları hazır).
    *   *(Gelişmiş AI seviyeleri veya analiz yetenekleri MVP sonrası aşamalara bırakılmıştır.)*
*   **Ana Sayfa:**
    *   Basit bir login özelliği.
    *   *(Kullanıcı yönetimi, profil vb. MVP sonrası aşamalara bırakılmıştır.)*
*   **Puzzle Menü Sayfası:**
    *   Yapısı hazır (tasarımı önceden yapılmış).
    *   *(Tam set listeleme veya navigasyon işlevselliği MVP sonrası aşamalara bırakılmıştır.)*
*   **Video Sayfası:**
    *   Tasarımı hazır.
    *   *(Video oynatma veya içerik yönetimi MVP sonrası aşamalara bırakılmıştır.)*

---

## 3. MVP Sonrası Odak Alanları

MVP tamamlandıktan ve lokal JSON verisi ile çalıştığı doğrulandıktan sonra, aşağıdaki alanlara odaklanılacaktır:

*   Kapsamlı varyant ağacı implementasyonu ve yönetimi.
*   Board Editor'ün tam işlevselliği (PGN, kaydetme/yükleme, varyant düzenleme).
*   API ve veritabanı entegrasyonu.
*   Detaylı ders içeriği ve interaktif egzersizler.
*   Öğretmen araçları ve raporlama.
*   Gelişmiş AI özellikleri.
*   Kullanıcı deneyimi ve motivasyon sistemlerinin detaylandırılması.

---

Bu belge, ChessMino projesinin ilk somut hedefini belirler ve geliştirme sürecinde odaklanılacak temel özellikleri netleştirir.