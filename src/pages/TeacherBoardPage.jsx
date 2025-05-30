import React from 'react';
import FreeAnalysisEditor from '@/components/editor/FreeAnalysisEditor';

/**
 * Öğretmen Tahtası Sayfası
 * Öğretmenlerin satranç pozisyonları oluşturması ve analiz etmesi için
 */
const TeacherBoardPage = () => {
  return (
    <div>
      <div className="bg-white border-b border-gray-200 mb-4">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-indigo-700">👩‍🏫 Öğretmen Tahtası</h1>
          <p className="text-gray-600 text-sm mt-1">
            Satranç pozisyonları oluşturun, düzenleyin ve analiz edin
          </p>
        </div>
      </div>
      <FreeAnalysisEditor />
    </div>
  );
};

export default TeacherBoardPage;