import React from 'react';
import ChessWorksheet from '../components/chess/ChessWorksheet';

/**
 * WorksheetPage component displays a printable chess worksheet with multiple chess positions.
 * Pozisyonlar PDF Generator'dan gelir ve yazdırılabilir bir düzende gösterilir.
 */
const WorksheetPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ChessWorksheet />
    </div>
  );
};

export default WorksheetPage;
