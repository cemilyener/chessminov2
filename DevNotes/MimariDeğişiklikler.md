# Mimari Değişiklikler

## useChessContent Hook'undan Zustand Store'a Geçiş

**Değişiklik Tarihi:** 10 Mayıs 2025

### Yapılan Değişiklikler
- `useChessContent.jsx` hook'u kaldırıldı ve tüm satranç içeriği yönetimi Zustand store'a (`useChessStore.js`) taşındı.
- Tüm bileşenler artık doğrudan Zustand store'dan veri alacak şekilde güncellendi.
- ChessContentManager sınıfı Zustand store tarafından merkezi olarak yönetiliyor.

### Değişikliğin Nedeni
- Satranç içeriği yönetimini merkezi ve daha tutarlı hale getirmek
- Varyantların işlenmesi ve dışa aktarılması sürecinde durum yönetimini basitleştirmek
- Kodun bakımını kolaylaştırmak ve değişiklikleri tek bir noktada yönetmek

### Etkilenen Bileşenler
- BoardEditor
- BoardPage
- VariantSelector
ve diğer satranç içeriğiyle etkileşimde bulunan tüm bileşenler

### Kullanım Örneği (Önceki):
```jsx
// ARTIK KULLANILMIYOR - Eski yöntem
import useChessContent from '../utils/chess/useChessContent';

function MyComponent() {
  const { currentFen, variations } = useChessContent();
  // ...
}