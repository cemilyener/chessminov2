// YENİ YÖNTEM - Zustand store kullanımı
import useChessStore from '../store/useChessStore';

function MyComponent() {
  const currentFen = useChessStore(state => state.currentFen);
  const variations = useChessStore(state => state.variations);
  // ...
}