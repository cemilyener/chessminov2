/**
 * localStorage'a erişilebilirliği kontrol eder
 * @returns {boolean} localStorage erişilebilir mi?
 */
const isLocalStorageAvailable = () => {
    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn("localStorage erişilemez:", e);
      return false;
    }
  };
  
const LESSON_PROGRESS_KEY_PREFIX = 'chess_lesson_progress_';
const RECENT_LESSONS_KEY = 'chess_recent_lessons';
const MAX_RECENT_LESSONS = 5;

/**
 * Saves the user's progress in a lesson
 * @param {string} lessonId - The ID of the lesson
 * @param {string} currentNodeId - The current node ID in the lesson
 * @param {Object} progressData - Additional progress data to save
 */
export const saveLessonProgress = (lessonId, currentNodeId, progressData = {}) => {
  try {
    const key = `${LESSON_PROGRESS_KEY_PREFIX}${lessonId}`;
    const data = {
      lessonId,
      currentNodeId,
      timestamp: new Date().toISOString(),
      ...progressData
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    return false;
  }
};

/**
 * Loads saved progress for a lesson
 * @param {string} lessonId - The ID of the lesson
 * @returns {Object|null} The saved progress data or null if none exists
 */
export const loadLessonProgress = (lessonId) => {
  try {
    const key = `${LESSON_PROGRESS_KEY_PREFIX}${lessonId}`;
    const savedData = localStorage.getItem(key);
    
    if (!savedData) return null;
    
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Error loading lesson progress:', error);
    return null;
  }
};

/**
 * Clears saved progress for a lesson
 * @param {string} lessonId - The ID of the lesson
 * @returns {boolean} Whether the operation was successful
 */
export const clearLessonProgress = (lessonId) => {
  try {
    const key = `${LESSON_PROGRESS_KEY_PREFIX}${lessonId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing lesson progress:', error);
    return false;
  }
};

/**
 * Adds a lesson to the recent lessons list
 * @param {string} lessonId - The ID of the lesson
 * @param {string} title - The title of the lesson
 */
export const addToRecentLessons = (lessonId, title) => {
  try {
    // Get existing recent lessons
    const recentLessonsStr = localStorage.getItem(RECENT_LESSONS_KEY);
    let recentLessons = recentLessonsStr ? JSON.parse(recentLessonsStr) : [];
    
    // Remove this lesson if it already exists in the list
    recentLessons = recentLessons.filter(lesson => lesson.id !== lessonId);
    
    // Add this lesson to the front of the list
    recentLessons.unshift({
      id: lessonId,
      title,
      lastVisited: new Date().toISOString()
    });
    
    // Limit the number of recent lessons
    if (recentLessons.length > MAX_RECENT_LESSONS) {
      recentLessons = recentLessons.slice(0, MAX_RECENT_LESSONS);
    }
    
    // Save the updated list
    localStorage.setItem(RECENT_LESSONS_KEY, JSON.stringify(recentLessons));
    return true;
  } catch (error) {
    console.error('Error adding to recent lessons:', error);
    return false;
  }
};

/**
 * Gets the list of recently visited lessons
 * @returns {Array} The list of recent lessons
 */
export const getRecentLessons = () => {
  try {
    const recentLessonsStr = localStorage.getItem(RECENT_LESSONS_KEY);
    return recentLessonsStr ? JSON.parse(recentLessonsStr) : [];
  } catch (error) {
    console.error('Error getting recent lessons:', error);
    return [];
  }
};

// Varsayılan export'a yeni fonksiyonları ekleyin
export default {
  saveLessonProgress,
  loadLessonProgress,
  clearLessonProgress,
  addToRecentLessons,
  getRecentLessons
};
