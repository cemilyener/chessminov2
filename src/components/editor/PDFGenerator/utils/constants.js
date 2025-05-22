/**
 * PDF Generator constants
 */

// Question counts supported by the grid layout
export const QUESTION_COUNTS = [1, 2, 4, 6, 8];

// Defaults for PDF generation
export const DEFAULT_SETTINGS = {
  title: "Satranç Çalışma Sayfası",
  ogretmen: "Cemil Yener",
  okul: "ChessMino",
  orientation: "portrait",
  pageSize: "a4"
};

// PDF document metadata
export const PDF_METADATA = {
  title: "ChessMino Satranç Çalışma Sayfası",
  author: "ChessMino Platform",
  creator: "ChessMino PDF Generator",
  producer: "@react-pdf/renderer"
};

// Chess board dimensions for export (px)
export const BOARD_DIMENSIONS = {
  width: 400,
  height: 400
};

// Grid layouts based on question count
export const GRID_LAYOUTS = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
  8: { cols: 2, rows: 4 }
};

// Default chess position (starting position)
export const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Satranç tahtası renkleri
export const BOARD_COLORS = {
  light: "#f0d9b5",
  dark: "#b58863",
  border: "#ccc"
};
