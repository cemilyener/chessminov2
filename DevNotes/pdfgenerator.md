PDF Generator Modülü - Teknik Spesifikasyon
1. Genel Bakış
PDF Generator, ChessMino platformunun öğretmen araçları bütününde yer alan bir modüldür. Öğretmenlerin öğrencileri için yaş ve seviyeye uygun satranç çalışma kağıtları oluşturmasını sağlar.
2. Kullanım Senaryoları
2.1 Temel Kullanım

Öğretmenler, öğrencilerinin yaş ve seviyesine uygun çalışma kağıtları hazırlar
Soru sayısını belirler (1, 2, 4, 6, 8 soru)
Pozisyonları düzenler ve onaylar
PDF formatında çıktı alır

2.2 Dağıtım Yöntemleri

WhatsApp üzerinden paylaşım
Siyah-beyaz yazıcıdan çıktı alma
Dijital ortamda saklama ve paylaşma

3. Teknik Mimari
3.1 Çekirdek Bileşenler

Ana Bileşen: BoardEditor.jsx (mevcut bileşenin klonu)
Klasör Yapısı: /src/components/editor/PDFGenerator/ içinde tüm bileşenler
State Yönetimi: PDF Generator'a özel hook ve store'lar

3.2 Veri Yapısı
javascript{
  positions: [
    {
      id: string,
      fen: string,
      moveOrder: 'white' | 'black',
      screenshot: base64String,
      title: string,
      description: string
    }
  ],
  settings: {
    questionCount: 1 | 2 | 4 | 6 | 8,
    pageFormat: 'A4',
    studentInfo: {
      name: string,
      class: string,
      date: string
    }
  }
}
4. İş Akışı
4.1 Pozisyon Oluşturma

BoardEditor klonu üzerinde pozisyon düzenleme
Pozisyonu görüntü olarak yakalama (screenshot)
Pozisyonu listeye ekleme

4.2 PDF Oluşturma

Soru sayısını belirleme
Grid yapısında pozisyonları yerleştirme
A4 formatında PDF oluşturma
İndirme veya paylaşma

5. Tasarım Özellikleri
5.1 Sayfa Düzeni

Format: A4 (210mm x 297mm)
Yapı: Grid sistemi
Hizalama: İçerikler grid hücrelerinde ortalanmış

5.2 Görsel Standartlar

Siyah-beyaz yazıcı uyumlu
Net ve okunaklı tahta görüntüleri
Optimize edilmiş dosya boyutu

6. Teknik Gereksinimler
6.1 Kütüphaneler

React 19
@react-pdf/renderer
html2canvas (pozisyon görüntüleme)

6.2 Özellikler

Pozisyon görüntülerinin base64 formatında saklanması
Responsive grid sistemi
Otomatik sayfa düzeni hesaplaması

7. Kısıtlamalar ve Kurallar
7.1 Pozisyon Limitleri

Maksimum 8 pozisyon/soru
Belirlenen soru sayısına göre ekleme kısıtlaması

7.2 Dosya Özellikleri

WhatsApp paylaşımı için optimize edilmiş boyut
Yazıcı dostu format

8. Gelecek Geliştirmeler

Farklı sayfa formatları desteği
Özelleştirilebilir başlık ve logo alanları
Çoklu dil desteği
Otomatik zorluk seviyesi belirleme


Bu döküman, PDF Generator modülünün temel özelliklerini ve teknik gereksinimlerini tanımlar. Geliştirme sürecinde güncellenecektir.

PDF Generator - Güncellenmiş Teknik Spesifikasyon
Grid Yapısı ve Sayfa Düzeni
Soru Sayısına Göre Grid Düzeni

1 soru: 1x1 (tam sayfa)
2 soru: 1x2 (üst-alt)
4 soru: 2x2 (kare grid)
6 soru: 2x3 (yatay düzen)
8 soru: 2x4 (yatay düzen)

A4 Sayfa Düzeni
+------------------------------------------+
| Logo    BAŞLIK                      Logo |
| Açıklama: _______________               |
| Hazırlayan: _____________ Tarih: ______ |
+------------------------------------------+
|                                          |
|          GRID ALANI (Pozisyonlar)       |
|                                          |
+------------------------------------------+
| Okul Adı | Öğretmen Bilgisi | ChessMino |
+------------------------------------------+
Pozisyon Kartı İçeriği
Her grid hücresinde:

Soru numarası (sol üst köşe)
Satranç tahtası görüntüsü
"Beyaz ☐ Siyah ☐" işaretleme kutuları
Pozisyon açıklama alanı (opsiyonel)

Hata Yönetimi Stratejisi
javascript// Temel hata yakalama yapısı
try {
  // PDF oluşturma işlemleri
  console.log('PDF oluşturuluyor...');
} catch (error) {
  console.error('PDF oluşturma hatası:', error);
  // Kullanıcıya bildirim
}
Performans Optimizasyonları

Pozisyon görüntüleri base64 formatında önbelleğe alınacak
Grid hesaplamaları memo ile optimize edilecek
Büyük PDF'ler için chunk yöntemi kullanılacak

Dosya İsimlendirme Formatı
ChessMino_[Kullanıcı]_[Tarih]_[Saat].pdf
Örnek: ChessMino_AhmetHoca_20250515_1430.pdf

PDF Generator - Final Teknik Spesifikasyon
Pozisyon Görüntü Ayarları

Format: PNG
Boyut: 400x400 pixel
Kalite: 0.8 (optimize edilmiş dosya boyutu)
Arka plan: Beyaz (#FFFFFF)
Tahta renkleri: Standart (açık: #F0D9B5, koyu: #B58863)

Varsayılan Değerler
javascriptconst defaultSettings = {
  ogretmen: "Cemil Yener",
  okul: "ChessMino",
  konu: "Alıştırmalar 1",
  aciklama: "En iyi hamleyi bulun"
}
PDF Metadata
javascriptconst pdfMetadata = {
  title: "ChessMino Satranç Çalışma Sayfası",
  author: "ChessMino Platform",
  creator: "ChessMino PDF Generator",
  producer: "@react-pdf/renderer",
  creationDate: new Date()
}
İndirme İşlemi
javascript// PDF oluşturulduktan sonra otomatik indirme
const downloadPDF = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
Basitleştirilmiş UI

Pozisyon listesi: Basit liste görünümü
Sıralama: Drag & drop yok, sadece yukarı/aşağı butonları
Önizleme: Tek sayfa önizleme penceresi
İlerleme: Basit yükleniyor spinner'ı

ChessMino PDF Generator, öğretmenlerin öğrencileri için yazdırılabilir satranç çalışma sayfaları oluşturmasını sağlayan bir modüldür.
Temel Özellikler

1, 2, 4, 6, 8 soruluk çalışma sayfaları
A4 format desteği
Otomatik grid düzeni
PNG formatında pozisyon görüntüleri
Türkçe arayüz

Teknik Özellikler

React 19 + @react-pdf/renderer
html2canvas pozisyon yakalama
Base64 görüntü depolama
Responsive grid sistemi

Varsayılan Ayarlar

Öğretmen: Cemil Yener
Okul: ChessMino
Konu: Alıştırmalar 1
Açıklama: En iyi hamleyi bulun

Kullanım Akışı

BoardEditor'de pozisyon düzenleme
Pozisyonu PNG olarak yakalama
Listeye ekleme
PDF oluşturma ve indirme
PDFGenerator.md - Güncelleme
Kritik Uyarılar ve Dikkat Edilecekler
1. GitHub Copilot Riskleri

Sorun: Copilot bağlamı kaybedip dokunmaması gereken dosyaları değiştirebiliyor
Çözüm: Her işlem için açık sınırlar belirleme ve sadece belirtilen dosyalarda çalışma
Önlem: @workspace kullanmadan önce kontrol

2. BasicBoardPage.jsx Kritik Önemi

Sorun: Copilot kendi taş paleti eklemeye çalışıyor
Gerçek: BasicBoardPage'de taş paleti zaten mevcut
Yaklaşım: Bu bileşeni klonlayacağız, orijinaline dokunmayacağız

3. React Hook Optimizasyonları

Chess.js 1.2 ile useMemo, useCallback, useRef kullanımı zorunlu
Gereksiz render'ları önlemek için memo optimizasyonları

4. Aşamalı Geliştirme

Her aşamada sadece gerekli bileşenler aktif olacak
Karmaşıklığı azaltmak için adım adım ilerleme

5. Kare Tahta Sorunu

Problem: PDF'te tahta kare yerine dikdörtgen oluyor
Çözüm: Sabit boyutlu kare container kullanma