// ChessMino Puzzle Set Schema - Merkezi Tanımlar

export const PIECE_TYPES = {
  'k': { name: 'Kale', englishName: 'Rook' },
  'f': { name: 'Fil', englishName: 'Bishop' },
  'v': { name: 'Vezir', englishName: 'Queen' },
  's': { name: 'Şah', englishName: 'King' },
  'p': { name: 'Piyon', englishName: 'Pawn' },
  'a': { name: 'At', englishName: 'Knight' },
  'm': { name: 'Mat', englishName: 'Checkmate' },
  't': { name: 'Pat', englishName: 'Stalemate' },
  'r': { name: 'Rok', englishName: 'Castling' },
  'g': { name: 'Geçerken Alma', englishName: 'En Passant' },
  'h': { name: 'Şah Çekme', englishName: 'Check' },
  'b': { name: 'Board', englishName: 'Board' }
};

export const EXERCISE_TYPES = {
  'a': { name: 'Alma', description: 'Taş alma egzersizleri' },
  'i': { name: 'İsteme', description: 'Taş isteme egzersizleri' },
  'b': { name: 'Bedava', description: 'Bedava taş egzersizleri' },
  'c': { name: 'Canavar', description: 'Canavar (tehdit) egzersizleri' },
  's': { name: 'Serbest', description: 'Serbest stil egzersizleri' }
};

export const DIFFICULTY_LEVELS = {
  '1': { name: 'Kolay', color: 'green', description: 'Yeni başlayanlar için' },
  '2': { name: 'Orta', color: 'yellow', description: 'Orta seviye oyuncular için' },
  '3': { name: 'Zor', color: 'red', description: 'İleri seviye oyuncular için' }
};

export const PIECE_SETS = {
  'merida': { name: 'Merida', isDefault: true },
  'classic': { name: 'Classic', isDefault: false },
  'modern': { name: 'Modern', isDefault: false },
  'wooden': { name: 'Wooden', isDefault: false },
  'marble': { name: 'Marble', isDefault: false }
};

/**
 * Standart puzzle set formatı oluşturur
 */
export const createStandardPuzzleSet = (setId, puzzles) => ({
  id: setId,
  title: generateTitle(setId),
  pieceSet: "merida",
  difficulty: parseInt(setId.charAt(5)),
  puzzleCount: puzzles.length,
  nextSetId: generateNextSetId(setId),
  puzzles: puzzles
});

export function generateTitle(setId) {
  const pieceType = PIECE_TYPES[setId.charAt(3)]?.name || 'Bilinmeyen';
  const exerciseType = EXERCISE_TYPES[setId.charAt(4)]?.name || 'Egzersiz';
  const difficulty = DIFFICULTY_LEVELS[setId.charAt(5)]?.name || 'Normal';
  
  return `${pieceType} ${exerciseType} Alıştırmaları - ${difficulty}`;
}

export function generateNextSetId(currentId) {
  const setNumber = parseInt(currentId.substring(0, 3));
  const nextNumber = String(setNumber + 1).padStart(3, '0');
  return nextNumber + currentId.substring(3);
}

export const validateSetId = (setId) => {
  if (setId.length !== 6) return false;
  if (!/^\d{3}[kfvsapmtrgb][aibcs][123]$/.test(setId)) return false;
  return true;
};