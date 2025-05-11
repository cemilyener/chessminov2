import React, { useEffect, useRef } from 'react';
import ChessContentManager from '../utils/chess/ChessContentManager';

function TestVariantNavigation() {
  const managerRef = useRef(new ChessContentManager());

  useEffect(() => {
    const loadAndTest = async () => {
      try {
        const response = await fetch('/fc3.pgn');
        const pgnData = await response.text();

        console.log("PGN dosyası yükleniyor...");
        const loadSuccess = managerRef.current.loadFromPgn(pgnData);
        console.log("PGN yükleme başarılı:", loadSuccess);

        if (loadSuccess) {
          // 1. Tüm varyantları listele
          const variants = managerRef.current.getAllVariants();
          console.log("Tüm varyantlar:", variants);

          // 2. Alternatif hamleleri kontrol et
          const alternatives = managerRef.current.getAlternativesAt();
          console.log("Mevcut pozisyondaki alternatifler:", alternatives);

          // 3. Ana hat düğümlerini listele
          console.log("Ana hat düğümleri:", managerRef.current.tree.metadata.mainLineNodeIds);

          // 4. Varyant düğümlerini bul (varsa)
          if (variants.length > 1) {
            const variantNodes = managerRef.current.findVariantNodes(variants[1].id);
            console.log(`"${variants[1].name}" varyantının düğümleri:`, variantNodes);
          }
        }
      } catch (error) {
        console.error("Test sırasında hata:", error);
      }
    };

    loadAndTest();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Varyant Navigasyonu Testi</h2>
      <p>Konsolu kontrol edin (F12 ile açabilirsiniz)</p>
    </div>
  );
}

export default TestVariantNavigation;