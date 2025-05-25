# ChessMino Projesi - Akıllı İsimlendirme Sistemi Notları

## Puzzle Set ID Yapısı

ChessMino projesinde puzzle setleri için kullanılan ID formatı:

- **İlk 3 karakter:** Set numarası (001, 002, vb.)
- **4. karakter:** Taş/konu türü
- **5. karakter:** Egzersiz tipi
- **6. karakter:** Zorluk seviyesi (1, 2, 3)

**Örneğin:** `001ka1` = 1. set, kale, alma, zorluk 1

---

## Taş/Konu Türleri

| Kod | Anlamı                |
|-----|-----------------------|
| k   | Kale (rook)           |
| f   | Fil (bishop)          |
| v   | Vezir (queen)         |
| s   | Şah (king)            |
| p   | Piyon (pawn)          |
| a   | At (knight)           |
| m   | Mat (checkmate)       |
| t   | Pat (stalemate)       |
| r   | Rok (castling)        |
| g   | Geçerken Alma (en-passant) |
| h   | Şah Çekme (check)     |
| b   | Board (board)         |

---

## Egzersiz Tipleri

| Kod | Anlamı      |
|-----|-------------|
| a   | Alma (capture) |
| i   | İsteme (request) |
| b   | Bedava (free) |
| c   | Canavar (monster) |
| s   | Serbest (free) |

---

## Zorluk Seviyeleri

| Kod | Anlamı |
|-----|--------|
| 1   | Kolay  |
| 2   | Orta   |
| 3   | Zor    |

---

## Öğretim Sırası

1. Tahta
2. Kale
3. Fil
4. Vezir
5. Şah
6. Piyon
7. Şah Çekme
8. Mat
9. Pat
10. Geçerken Alma
11. Terfi
12. Rok
13. Teknik
14. Turnuva Kuralları

---

## Notlar

- PuzzleSetEditor bileşeni ID girildiğinde diğer alanları otomatik doldurur
- Sonraki set ID'si otomatik hesaplanır
- Puzzle set ID'den başlık ve açıklama otomatik oluşturulur
- Puzzle set ID, puzzle'lar için temel ID formatını belirler (örn: `001ka1_01`)
- ID yapısı, eğitim materyallerinin mantıklı organizasyonunu sağlar
- Varyant sisteminde alternatif çözüm yolları desteklenir

Bu notlar, gelecekteki geliştirmelerde projenin isimlendirme ve yapı kurallarını hatırlamak için referans olarak kullanılmalıdır.
