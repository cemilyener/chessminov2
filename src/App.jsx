import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import PuzzlePage from "@/pages/PuzzlePage";
import LessonPage from "@/pages/LessonPage";
import BoardEditorSetupPage from "@/pages/BoardEditorSetupPage";
import BoardEditorDemoPage from "@/pages/BoardEditorDemoPage";
import PgnConverterToolPage from "@/pages/PgnConverterToolPage";
import PuzzleEditorPage from "@/pages/PuzzleEditorPage";
import BasicBoardPage from "@/components/board/BasicBoardPage";
// PDF Generator import
import PawnlessArrangementPage from "@/pages/PawnlessArrangementPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/lessons" element={<LessonPage />} />
        <Route path="/editor" element={<BoardEditorSetupPage />} />
        <Route path="/puzzle-editor" element={<PuzzleEditorPage />} />
        <Route path="/pgn-converter" element={<PgnConverterToolPage />} />
        <Route path="/board-editor-demo" element={<BoardEditorDemoPage />} />
        <Route path="/basic-board" element={<BasicBoardPage />} />
        <Route path="/pdf-generator" element={<PawnlessArrangementPage />} />
        <Route path="/pawnless" element={<PawnlessArrangementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
