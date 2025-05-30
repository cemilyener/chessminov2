import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import PuzzlePage from "@/pages/PuzzlePage";
import LessonPage from "@/pages/LessonPage";
import TeacherBoardPage from "@/pages/TeacherBoardPage";
import PgnConverterToolPage from "@/pages/PgnConverterToolPage";

import BasicBoardPage from "@/components/board/BasicBoardPage";
// Homework Generator import - ✅ İsim değişti
import HomeworkGeneratorPage from "@/pages/HomeworkGeneratorPage";
import SimplePuzzleCreator from "@/pages/SimplePuzzleCreator";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/lessons" element={<LessonPage />} />
        <Route path="/pgn-converter" element={<PgnConverterToolPage />} />
        <Route path="/teacher-board" element={<TeacherBoardPage />} />
        <Route path="/basic-board" element={<BasicBoardPage />} />
        <Route path="/homework-generator" element={<HomeworkGeneratorPage />} /> {/* ✅ Route değişti */}
        <Route path="/simple-puzzle-creator" element={<SimplePuzzleCreator />}/>
      </Routes>
    </Router>
  );
}

export default App;
