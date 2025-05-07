// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LessonPage from './components/lessons/LessonPage';
import TestPage from './components/TestPage';

// Ana Sayfa bileşeni (geçici olarak burada tanımlandı)
const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ChessMino Öğrenme Platformu</h1>
      <p className="mb-4">3-8 yaş arası çocuklar için satranç öğrenme platformu.</p>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {/* Örnek ders kartları */}
        <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Taşların Tanıtımı: Piyon</h2>
          <p className="text-gray-600 mb-4">Piyonların nasıl hareket ettiğini öğrenin.</p>
          <Link 
            to="/lesson/lesson-001" 
            className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
          >
            Derse Başla
          </Link>
        </div>
        
        <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Taşların Tanıtımı: At</h2>
          <p className="text-gray-600 mb-4">Atların L şeklinde nasıl hareket ettiğini öğrenin.</p>
          <Link 
            to="/lesson/lesson-002" 
            className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
          >
            Derse Başla
          </Link>
        </div>
      </div>
    </div>
  );
};

// Hakkında sayfası (geçici olarak burada tanımlandı)
const AboutPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-6">ChessMino Hakkında</h1>
    <p>ChessMino, satranç öğrenmeyi çocuklar için eğlenceli ve kolay hale getiren bir platformdur.</p>
  </div>
);

// Bulunamadı sayfası
const NotFoundPage = () => (
  <div className="container mx-auto p-4 text-center">
    <h1 className="text-3xl font-bold mb-6">404 - Sayfa Bulunamadı</h1>
    <p className="mb-4">Aradığınız sayfa mevcut değil.</p>
    <Link to="/" className="text-blue-500 hover:underline">Ana Sayfaya Dön</Link>
  </div>
);

// Ana uygulama bileşeni
function App() {
  return (
    <Router>
      {/* Navigasyon */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <Link to="/" className="text-xl font-bold">ChessMino</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-300">Ana Sayfa</Link>
            <Link to="/about" className="hover:text-blue-300">Hakkında</Link>
            <Link to="/test-pgn" className="hover:text-blue-300">PGN Test</Link>
          </div>
        </div>
      </nav>
      
      {/* Sayfa içeriği */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/test-pgn" element={<TestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} ChessMino. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </Router>
  );
}

export default App;