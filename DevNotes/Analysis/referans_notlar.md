# Board Editor İçin Referans Notlar

⚠️ **UYARI: Bu dosya sadece REFERANS içindir. Kod değişikliği yapmadan önce mevcut durumu kontrol edin!**

## 🚨 CLAUDE OPUS MESAJ GÜVENLİK PROTOKOLÜ

### ❌ ASLA YAPMAYIN:
- Claude Opus'un uzun mesajını direkt agent moda kopyalama
- "Bunu uygula" deyip tüm mesajı gönderme
- Anlamadığınız kodu doğrudan çalıştırma

### ✅ DOĞRU YAKLAŞIM:
1. **PARÇALARA AYIRIN:** Opus'un mesajını küçük parçalara bölün
2. **TEK TEK SORUN:** "Bu kısım ne yapıyor?"
3. **MEVCUT DURUMU KONTROL:** "Şu anda hangi dosyada neyim var?"
4. **KÜÇÜK ADIMLAR:** Her seferde 1 dosya, 1 değişiklik

## 🛡️ AGENT MODU GÜVENLİK KALIBI

**Doğru Agent Kullanımı:**
```
"X dosyasının Y satırına şu kodu ekle:
[sadece eklenecek kod]

Mevcut kodu silme, sadece ekle."
```

**Yanlış Agent Kullanımı:**
```
"Claude Opus şunu söyledi: [500 satır mesaj]
Bunu uygula."
```

## JSON Format (Board Editor Çıktısı)
18 soruluk puzzle setleri için:
```json
{
  "metadata": { "title": "...", "source": "...", "count": 18 },
  "puzzles": [...]
}
```

## ❌ AGENT MODU YASAK BÖLGELER
- Store yapısı değişikliği
- Dosya taşıma/silme
- Klasör yeniden organizasyonu
- useChessStore.js düzenlemesi
- BoardEditor.jsx büyük değişiklikleri

## ✅ Güvenli Agent Kullanım Alanları
- Yeni CSS class ekleme
- Yeni component oluşturma
- Küçük UI düzenlemeleri
- Console.log ekleme/çıkarma

## 🔴 KRİTİK: Claude Opus Mesajı Aldığınızda
1. **DUR!** Hemen agent moda gönderme
2. **BÖLE:** Mesajı anlayabileceğiniz parçalara ayır
3. **SORUN:** "Bu ne demek?" "Hangi dosyayı etkiler?"
4. **KONTROL:** Mevcut dosya durumunu göster
5. **TEST:** Küçük bir değişiklik yap, test et

---
**Son Güncelleme:** Board Editor geliştirme aşaması
**Durum:** Claude Opus düzenlemeleri kısmen yanlış - dikkatli olun!
**ANTİ-PATTERN:** Opus mesajını direkt agent moda kopyalama = PROJE PATLAR!

Lütfen tüm kod önerilerini şu formatta ver:

## DOSYA: [dosya_adı.jsx]
**MOD:** [ASK/EDIT/AGENT]
**TİP:** [YENİ_DOSYA/EKLEME/DEĞİŞİKLİK]

### Kod:
```javascript
// Sadece değişen/eklenen kısım
[kod burada]
```

### Açıklama:
- Bu kod ne yapıyor?
- Hangi satıra ekleniyor?
- Mevcut koddan ne değişiyor?

### Copilot Talimatı:
"[dosya_adı] dosyasının [satır_no] satırına şu kodu ekle"

// ...existing code...

## 🤖 GITHUB COPILOT MOD REHBERİ

### 💬 **ASK MODU** (En Güvenli)
- "Bu kod ne yapıyor?"
- "Hangi dosyayı değiştirmeliyim?"
- "Bu nasıl çalışır?"

### ✏️ **EDIT MODU** (Orta Risk)
- Mevcut dosyada küçük değişiklikler
- CSS eklemeleri
- Fonksiyon içi düzenlemeler

### 🤖 **AGENT MODU** (Yüksek Risk - Dikkatli Kullan)
- Sadece yeni dosya oluşturma
- Basit component ekleme
- ASLA store/routing değişikliği

## 🚨 OPUS MESAJI IŞLEME PROTOKOLÜ

1. **OPUS FORMATI KONTROL:** Standart formatta mı?
2. **MOD SEÇİMİ:** ASK → EDIT → AGENT sırası
3. **TEK SEFERDE TEK DOSYA:** Birden fazla dosya = tehlike
4. **TEST:** Her değişiklikten sonra çalıştır

// ...existing code...