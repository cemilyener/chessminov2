// src/utils/puzzle/PuzzleLoader.js
class PuzzleLoader {
  static cache = new Map();
  
  static async loadPuzzleSet(setId) {
    // Cache kontrolü
    if (this.cache.has(setId)) {
      return this.cache.get(setId);
    }
    
    try {
      // JSON yükle
      const response = await fetch(`/DevNotes/chessmino-${setId}.json`);
      if (!response.ok) throw new Error('Puzzle set not found');
      
      const data = await response.json();
      
      // Validate structure
      if (!data.puzzles || !Array.isArray(data.puzzles)) {
        throw new Error('Invalid puzzle format');
      }
      
      // Cache'e kaydet
      this.cache.set(setId, data);
      
      return data;
    } catch (error) {
      console.error('PuzzleLoader error:', error);
      throw error;
    }
  }
  
  static clearCache() {
    this.cache.clear();
  }
}

export default PuzzleLoader;