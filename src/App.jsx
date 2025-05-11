import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PuzzlePage from './components/puzzle/PuzzlePage';
import BoardPage from './components/chess/BoardPage';
import LessonPage from './components/lessons/LessonPage';
import BoardEditor from './components/editor/BoardEditor';
import PgnJsonConverter from './components/editor/PgnJsonConverter';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/lessons" element={<LessonPage />} />
        <Route path="/editor" element={<BoardEditor />} />
        <Route path="/pgn-converter" element={<PgnJsonConverter />} />
        {/* Test route kaldırıldı */}
      </Routes>
    </Router>
  );
}

export default App;