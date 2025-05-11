// src/components/lessons/LessonPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useParams } from 'react-router-dom';
import { loadLessonById } from '../../data/lessons/loadLessonData';
import { 
  saveLessonProgress, 
  loadLessonProgress,
  addToRecentLessons 
} from '../../utils/lessons/saveLessonProgress';

const LessonPage = () => {
  // URL'den lessonId parametresini al
  const { lessonId } = useParams();
  const currentLessonId = lessonId || 'lesson-001';

  // State tanımları
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState("root");
  const [boardPosition, setBoardPosition] = useState("");
  const [currentComment, setCurrentComment] = useState("");
  const [boardWidth, setBoardWidth] = useState(400); // Varsayılan tahta boyutu
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Chess.js instance'ını useRef ile saklıyoruz (her render'da yeniden oluşturmamak için)
  const chessRef = useRef(null);
  
  /**
   * İlerleme yüzdesini hesaplama (mainLineNodeIds kullanarak)
   * @param {Object} lessonData - Ders verisi
   * @param {string} nodeId - Mevcut düğüm ID'si
   * @returns {number} İlerleme yüzdesi (0-100)
   */
  const calculateProgressPercentage = (lessonData, nodeId) => {
    if (!lessonData?.metadata?.mainLineNodeIds || !nodeId) return 0;
    
    const mainLine = lessonData.metadata.mainLineNodeIds;
    const currentIndex = mainLine.indexOf(nodeId);
    
    if (currentIndex === -1) return 0;
    // Ana hat uzunluğu 1'den fazla olmalı, aksi takdirde NaN veya Infinity döner
    return mainLine.length <= 1 ? 0 : Math.round((currentIndex / (mainLine.length - 1)) * 100);
  };
  
  // Ekran boyutuna göre tahta boyutunu ayarlama
  useEffect(() => {
    const handleResize = () => {
      // Ekran genişliğine göre tahta boyutunu ayarla (minimum 300px, maksimum 600px)
      const width = Math.min(Math.max(window.innerWidth * 0.8, 300), 600);
      setBoardWidth(width);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // İlk yükleme için çağır
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Ders verisini yükle
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await loadLessonById(currentLessonId);
        setLessonData(data);
        
        // Son ziyaret edilen derslere ekle
        if (data && data.title) {
          addToRecentLessons(currentLessonId, data.title);
        }
        
        // Kaydedilmiş ilerlemeyi kontrol et
        const savedProgress = loadLessonProgress(currentLessonId);
        if (savedProgress && savedProgress.currentNodeId) {
          // Kullanıcıya ilerlemeyi yükleme seçeneği sun
          const confirmLoad = window.confirm(
            "Bu derste önceki bir ilerlemeniz bulundu. Kaldığınız yerden devam etmek ister misiniz?"
          );
          
          if (confirmLoad) {
            setCurrentNodeId(savedProgress.currentNodeId);
          } else {
            // Baştan başla
            setCurrentNodeId("root");
          }
        } else {
          // İlerleme yoksa baştan başla
          setCurrentNodeId("root");
        }
        
        setError(null);
      } catch (err) {
        console.error('Ders yüklenirken hata:', err);
        setError('Ders yükleme başarısız. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [currentLessonId]);
  
  // Mevcut düğümü yükleme/güncelleme
  useEffect(() => {
    if (!lessonData || !lessonData.nodes) return;
    
    const currentNode = lessonData.nodes.get(currentNodeId);
    if (currentNode) {
      // Eğer FEN değiştiyse, satranç motorunu ve tahtayı güncelle
      if (boardPosition !== currentNode.fen) {
        try {
          // Chess.js sınırlamaları için dikkat: FEN değişimi
          chessRef.current = new Chess(currentNode.fen);
          setBoardPosition(currentNode.fen);
        } catch (error) {
          console.error("FEN yükleme hatası:", error);
        }
      }
      
      // Düğüme ait açıklamayı güncelle
      setCurrentComment(currentNode.metadata?.comment || "");
      
      // İlerleme yüzdesini hesapla
      const progress = calculateProgressPercentage(lessonData, currentNodeId);
      setProgressPercentage(progress);
      
      // Tamamlanma durumunu kontrol et
      checkLessonCompletion(currentNodeId);
      
      // İlerlemeyi kaydet (eğer root değilse)
      if (currentNodeId !== "root") {
        saveLessonProgress(currentLessonId, currentNodeId, {
          lastPosition: currentNode.fen,
          progressPercentage: progress
        });
      }
    }
  }, [currentNodeId, lessonData, currentLessonId]);
  
  // Ders tamamlandığında yapılacak işlemler
  const checkLessonCompletion = (nodeId) => {
    if (!lessonData?.metadata?.mainLineNodeIds) return false;
    
    // Son düğüme ulaşılıp ulaşılmadığını kontrol et
    const mainLineNodeIds = lessonData.metadata.mainLineNodeIds;
    const isLastNode = mainLineNodeIds[mainLineNodeIds.length - 1] === nodeId;
    
    if (isLastNode) {
      // İlerleme bilgisini hazırla
      const progressData = {
        completed: true,
        completedAt: new Date().toISOString(),
        progressPercentage: 100
      };
      
      // İlerlemeyi bir sonraki mikro görev döngüsünde kaydet
      // UI'ı engellemeden localStorage işleminin tamamlanmasını sağlar
      queueMicrotask(() => {
        saveLessonProgress(currentLessonId, nodeId, progressData);
      });
      
      // Mesajı göstermek için uygun bir zamanlayıcı kullan
      // window.alert UI thread'i blokladığı için hafif bir delay koy
      setTimeout(() => {
        // Basit bir mesaj kutusu göster
        alert("Tebrikler! Bu dersi tamamladınız.");
      }, 50);
      
      return true;
    }
    
    return false;
  };
  
  // Bir sonraki hamleye geçiş
  const goToNextMove = () => {
    if (!lessonData || !lessonData.nodes) return;
    
    const currentNode = lessonData.nodes.get(currentNodeId);
    if (currentNode && currentNode.childrenIds.length > 0) {
      // Ana hat üzerindeki ilk çocuk düğüme git
      setCurrentNodeId(currentNode.childrenIds[0]);
    }
  };
  
  // Bir önceki hamleye dönüş
  const goToPreviousMove = () => {
    if (!lessonData || !lessonData.nodes) return;
    
    const currentNode = lessonData.nodes.get(currentNodeId);
    if (currentNode && currentNode.parentId) {
      setCurrentNodeId(currentNode.parentId);
    }
  };
  
  // Taş hareket ettirildiğinde (kullanıcı etkileşimi)
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!chessRef.current) return false;
    
    // Bu bir ders olduğundan, kullanıcının taşları hareket ettirmesi opsiyonel olabilir
    // Şimdilik sadece yasal hamle kontrolü yapalım
    try {
      const move = chessRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() === 'p' ? 'q' : undefined // Otomatik vezir terfi
      });
      
      if (move) {
        // Hamle geçerliyse, tahtayı güncelle
        setBoardPosition(chessRef.current.fen());
        return true;
      }
      
      return false; // Geçersiz hamle
    } catch (e) {
      console.error('Hamle hatası:', e);
      return false;
    }
  };
  
  // Yükleme durumu kontrolü
  if (loading) return <div className="flex justify-center items-center h-screen">Ders yükleniyor...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">Hata: {error}</div>;
  if (!lessonData) return <div className="flex justify-center items-center h-screen">Ders bulunamadı</div>;
  
  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{lessonData.title}</h1>
      <div className="flex flex-col md:flex-row w-full gap-6">
        {/* Sol taraf: Satranç tahtası */}
        <div className="flex-1 flex justify-center">
          <Chessboard 
            position={boardPosition} 
            boardWidth={boardWidth}
            onPieceDrop={handlePieceDrop}
            id="lessonBoard"
          />
        </div>
        
        {/* Sağ taraf: Açıklama ve kontroller */}
        <div className="flex-1 flex flex-col">
          {/* Açıklama kutusu */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4 min-h-[150px]">
            <p>{currentComment}</p>
          </div>
          
          {/* İlerleme durumu */}
          <div className="mb-4 text-sm text-gray-600">
            İlerleme: {progressPercentage}%
          </div>
          
          {/* Kontrol butonları */}
          <div className="flex justify-between mt-auto">
            <button 
              onClick={goToPreviousMove}
              disabled={!lessonData.nodes.get(currentNodeId)?.parentId}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              ← Önceki
            </button>
            
            <button 
              onClick={goToNextMove}
              disabled={!lessonData.nodes.get(currentNodeId)?.childrenIds.length}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              Sonraki →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;