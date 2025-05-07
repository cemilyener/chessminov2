// src/utils/lessons/loadLessonData.js

/**
 * Loads lesson data by ID from the API or local storage
 * @param {string} lessonId - The ID of the lesson to load
 * @returns {Promise<Object>} The lesson data
 */
export const loadLessonById = async (lessonId) => {
  try {
    // Check if we're in development mode - in that case, just use mock data
    if (import.meta.env.DEV) {
      // Use mock data in development
      return getMockLessonById(lessonId);
    }
    
    // In production, try to fetch from API first
    const response = await fetch(`/api/lessons/${lessonId}`, {
      headers: {
        'Accept': 'application/json'
      }
    }).catch(error => {
      console.log('Fetch failed, using mock data instead:', error);
      return { ok: false };
    });
    
    if (response.ok) {
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        // If JSON parsing fails, use mock data
        return getMockLessonById(lessonId);
      }
    }
    
    // If API call fails, use mock data
    return getMockLessonById(lessonId);
  } catch (error) {
    console.error('Error loading lesson:', error);
    // Fallback to mock data in case of error
    return getMockLessonById(lessonId);
  }
};

/**
 * Get mock lesson data for development/testing
 * @param {string} lessonId - The ID of the lesson to mock
 * @returns {Object} Mock lesson data
 */
const getMockLessonById = (lessonId) => {
  // Sample lesson with common chess opening
  const mockLessons = {
    'lesson-001': {
      id: 'lesson-001',
      title: 'Queen\'s Gambit Açılışı',
      description: 'Bu derste Queen\'s Gambit açılışının temel prensiplerini öğreneceksiniz.',
      // Nodes is a Map but we'll convert an object to Map for the sample
      nodes: new Map([
        ['root', {
          id: 'root',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          childrenIds: ['node1'],
          parentId: null,
          metadata: {
            comment: 'Bu derste Queen\'s Gambit açılışını inceleyeceğiz. Beyaz d4 ile başlar.'
          }
        }],
        ['node1', {
          id: 'node1',
          fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
          childrenIds: ['node2'],
          parentId: 'root',
          metadata: {
            comment: 'Beyaz d4 ile merkezi kontrol etmeye başlar.'
          }
        }],
        ['node2', {
          id: 'node2',
          fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
          childrenIds: ['node3'],
          parentId: 'node1',
          metadata: {
            comment: 'Siyah da d5 ile cevap vererek merkezi paylaşır.'
          }
        }],
        ['node3', {
          id: 'node3',
          fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
          childrenIds: ['node4'],
          parentId: 'node2',
          metadata: {
            comment: 'Beyaz c4 hamlesi ile Queen\'s Gambit açılışını başlatır. Bu hamle siyahın d5 piyonunu tehdit eder.'
          }
        }],
        ['node4', {
          id: 'node4',
          fen: 'rnbqkbnr/ppp1pppp/8/8/2PPp3/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
          childrenIds: [],
          parentId: 'node3',
          metadata: {
            comment: 'Dersin sonuna geldiniz. Queen\'s Gambit açılışının temel özelliği, beyazın siyaha bir piyon gambiti sunmasıdır.'
          }
        }]
      ]),
      metadata: {
        author: 'Chess Instructor',
        difficulty: 'Başlangıç',
        mainLineNodeIds: ['root', 'node1', 'node2', 'node3', 'node4'],
        tags: ['açılış', 'gambit', 'orta oyun']
      }
    },
    'lesson-002': {
      id: 'lesson-002',
      title: 'İspanyol Açılışı (Ruy Lopez)',
      description: 'Bu derste İspanyol Açılışının (Ruy Lopez) temel prensiplerini öğreneceksiniz.',
      nodes: new Map([
        ['root', {
          id: 'root',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          childrenIds: ['node1'],
          parentId: null,
          metadata: {
            comment: 'Bu derste İspanyol Açılışını inceleyeceğiz. Beyaz e4 ile başlar.'
          }
        }],
        ['node1', {
          id: 'node1',
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          childrenIds: ['node2'],
          parentId: 'root',
          metadata: {
            comment: 'Beyaz e4 ile merkezi kontrol etmeye başlar.'
          }
        }],
        ['node2', {
          id: 'node2',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          childrenIds: ['node3'],
          parentId: 'node1',
          metadata: {
            comment: 'Siyah e5 ile cevap vererek merkezi kontrol eder.'
          }
        }],
        ['node3', {
          id: 'node3',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          childrenIds: ['node4'],
          parentId: 'node2',
          metadata: {
            comment: 'Beyaz Nf3 ile at geliştirir ve e5 piyonuna baskı yapar.'
          }
        }],
        ['node4', {
          id: 'node4',
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
          childrenIds: ['node5'],
          parentId: 'node3',
          metadata: {
            comment: 'Siyah Nc6 ile cevap vererek e5 piyonunu korur.'
          }
        }],
        ['node5', {
          id: 'node5',
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
          childrenIds: [],
          parentId: 'node4',
          metadata: {
            comment: 'İspanyol Açılışı başlamıştır. Bu açılışta beyazın stratejisi, siyahın merkezdeki e5 piyonunu zayıflatmaktır.'
          }
        }]
      ]),
      metadata: {
        author: 'Chess Instructor',
        difficulty: 'Başlangıç',
        mainLineNodeIds: ['root', 'node1', 'node2', 'node3', 'node4', 'node5'],
        tags: ['açılış', 'e4', 'klasik açılış']
      }
    }
  };
  
  // Return the requested lesson or the first one as fallback
  return mockLessons[lessonId] || mockLessons['lesson-001'];
};