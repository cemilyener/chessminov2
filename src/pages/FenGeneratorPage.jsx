import React from 'react';
import FenGenerator from '../components/chess/FenGenerator';

/**
 * FenGeneratorPage - 6 pozisyonlu satranç çalışma sayfası oluşturma sayfası
 * Daha önce karmaşık olan PDFGenerator yerine basitleştirilmiş bir sayfa
 */
const FenGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <FenGenerator />
    </div>
  );
};

export default FenGeneratorPage;
