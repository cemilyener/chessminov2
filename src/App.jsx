import React from 'react';
// Remove these imports as they're no longer needed at this level
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PuzzlePage from './components/puzzle/PuzzlePage';
import BoardPage from './components/chess/BoardPage';
import LessonPage from './components/lessons/LessonPage';
import BoardEditor from './components/editor/BoardEditor';
import PgnJsonConverter from './components/editor/PgnJsonConverter';
import BasicBoardPage from './components/board/BasicBoardPage';
import './App.css';

function App() {
  return (
    // Remove the DndProvider wrapper
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/lessons" element={<LessonPage />} />
        <Route path="/editor" element={<BoardEditor />} />
        <Route path="/pgn-converter" element={<PgnJsonConverter />} />
        <Route path="/basic-board" element={<BasicBoardPage />} />
      </Routes>
    </Router>
  );
}

export default App;