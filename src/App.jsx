import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import PuzzlePage from '@/pages/PuzzlePage';
import LessonPage from '@/pages/LessonPage';
import BoardEditorSetupPage from '@/pages/BoardEditorSetupPage';
import BoardEditorDemoPage from '@/pages/BoardEditorDemoPage';
import PgnConverterToolPage from '@/pages/PgnConverterToolPage';
import PDFGenerator from '@/components/editor/PDFGenerator';
import BasicBoardPage from '@/components/board/BasicBoardPage';
import WorksheetPage from '@/pages/WorksheetPage';
import FenGeneratorPage from '@/pages/FenGeneratorPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/lessons" element={<LessonPage />} />
        <Route path="/editor" element={<BoardEditorSetupPage />} />
        <Route path="/pgn-converter" element={<PgnConverterToolPage />} />
        <Route path="/board-editor-demo" element={<BoardEditorDemoPage />} />
        <Route path="/pdf-generator" element={<PDFGenerator />} />
        <Route path="/fen-generator" element={<FenGeneratorPage />} />
        <Route path="/basic-board" element={<BasicBoardPage />} />
        <Route path="/worksheet" element={<WorksheetPage />} />
      </Routes>
    </Router>
  );
}

export default App;