# ChessMino Projesi - İsimlendirme Standartları Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinde kullanılacak isimlendirme standartlarını tanımlar. Kodun okunabilirliğini ve tutarlılığını sağlamayı amaçlar.

---

## 1. Belirlenen İsimlendirme Kuralları

Proje genelinde aşağıdaki isimlendirme standartları benimsenecektir:

*   **React Bileşenleri ve Sayfalar:** `PascalCase`
    *   Örnek: `PuzzleBoard.jsx`, `HomePage.jsx`, `Button.jsx`
    *   Gerekçe: React ekosisteminde standarttır ve bileşenleri diğer JavaScript öğelerinden ayırır.
*   **JavaScript Fonksiyonları ve Değişkenler:** `camelCase`
    *   Örnek: `handlePieceDrop`, `currentPuzzleIndex`, `loadPuzzleData`
    *   Gerekçe: Genel JavaScript pratiğiyle uyumludur ve okunaklıdır.
*   **Dosya İsimleri (Bileşenler Hariç):** `camelCase`
    *   Örnek: `fenUtils.js`, `puzzleStore.js`, `chessTreeManager.js`
    *   Gerekçe: Klasör yapısı ve modül isimlendirmesiyle uyumludur.
*   **Klasör İsimleri:** `camelCase`
    *   Örnek: `components/editor`, `utils/chess`, `store/puzzle`
    *   Gerekçe: Proje organizasyon yapısıyla uyumludur.
*   **Sabit Değerler (Constants):** `UPPER_CASE_WITH_UNDERSCORES`
    *   Örnek: `DEFAULT_FEN`, `API_ENDPOINT`, `MAX_PUZZLE_COUNT`
    *   Gerekçe: Değeri değişmeyecek sabitleri net bir şekilde belirtir.

## 2. Karar Gerekçesi

Tutarlı isimlendirme, kodun kendi kendini belgelemesine yardımcı olur, okunabilirliği artırır ve farklı geliştiricilerin (veya AI'nın) kod tabanını daha kolay anlamasını sağlar. Belirlenen standartlar, yaygın JavaScript/React pratikleriyle uyumludur.

---

Bu belge, projenin isimlendirme standartlarını netleştirir.