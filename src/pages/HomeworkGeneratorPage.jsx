import { useState, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import ChessboardComponent from "../components/ChessboardComponent";
import useChessStore from "../store/useChessStore";
import { generatePDF } from "../utils/pdfGenerator";

function HomeworkGeneratorPage() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const savedPositions = useChessStore((state) => state.savedPositions);
  const savePosition = useChessStore((state) => state.savePosition);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [resetBoardFn, setResetBoardFn] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("Satranç Ödev Sayfası");

  const handleSavePosition = () => {
    if (currentPosition) {
      savePosition(currentPosition, isWhiteTurn);
    }
  };

  const toggleTurn = () => {
    setIsWhiteTurn(!isWhiteTurn);
  };

  const handlePrint = () => {
    const contentElement = document.getElementById("satranc-diyagramlari");
    if (contentElement) {
      generatePDF(contentElement);
    }
  };

  const handleResetBoard = useCallback((type) => {
    if (resetBoardFn) {
      resetBoardFn(type);
    }
  }, [resetBoardFn]);

  const handlePositionChange = useCallback((fen) => {
    setCurrentPosition(fen);
  }, []);

  const handleResetCallback = useCallback((resetFunction) => {
    setResetBoardFn(() => resetFunction);
  }, []);

  return (
    <div className="h-full bg-amber-50 flex flex-col overflow-hidden">
      {/* Sayfa Header'ı ekle */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-amber-800">📝 Homework Generator</h1>
        <p className="text-gray-600 text-sm mt-1">
          Create custom chess homework worksheets for students
        </p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-2 p-2">
        <div className="col-span-12 sm:col-span-8 md:col-span-9 bg-white rounded-md shadow-md flex flex-col overflow-hidden">
          <div className="flex justify-start items-center p-2 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResetBoard("standard")}
                className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md shadow-sm"
              >
                Standart Konum
              </button>
              
              <button
                onClick={() => handleResetBoard("empty")}
                className="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-md shadow-sm"
              >
                Tahtayı Temizle
              </button>
              
              <button
                onClick={toggleTurn}
                className={`px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center gap-1.5 ${
                  isWhiteTurn ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-white"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isWhiteTurn ? "bg-white border border-gray-300" : "bg-black"}`}></div>
                <span className="whitespace-nowrap">{isWhiteTurn ? "Beyaz" : "Siyah"}</span>
              </button>
              
              <button
                onClick={handleSavePosition}
                disabled={!currentPosition}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-2 py-1 rounded-md shadow-sm text-xs flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Kaydet</span>
              </button>
              
              <div className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded-md">
                {savedPositions.length}/6
              </div>
              
              <button 
                onClick={handlePrint}
                disabled={savedPositions.length === 0}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white px-2 py-1 rounded-md shadow-sm text-xs flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                <span>Yazdır</span>
              </button>
            </div>
          </div>
          
          <div className="px-2 py-2 border-b border-amber-100">
            <input
              type="text"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              placeholder="PDF Başlığı"
              className="w-full p-1 text-sm border border-amber-200 rounded"
            />
          </div>
          <div className="flex-1 flex items-center justify-center p-2">
            <div className="w-full max-w-md">
              <ChessboardComponent
                onChange={handlePositionChange}
                orientation={isWhiteTurn ? "white" : "black"}
                onReset={handleResetCallback}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4 md:col-span-3 bg-white rounded-md shadow-md p-1.5 overflow-hidden">
          <div className="flex justify-between items-center border-b border-amber-50 pb-1 mb-1">
            <h2 className="text-xs font-bold text-amber-800">Kaydedilen Pozisyonlar</h2>
            {savedPositions.length > 0 && (
              <button 
                onClick={() => useChessStore.getState().clearPositions()}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Temizle
              </button>
            )}
          </div>
          
          {savedPositions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400 text-xs p-2 h-[calc(100%-1.5rem)]">
              <p>Konum kaydedin</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 h-[calc(100%-1.75rem)] overflow-hidden">
              {savedPositions.slice(0, 6).map((position, index) => (
                <div key={index} className="p-0.5 border rounded bg-amber-50 flex flex-col items-center">
                  <div className="flex justify-between w-full">
                    <p className="text-xs font-medium text-amber-700 -mt-0.5">Soru {index + 1}</p>
                    <p className="text-xs font-medium text-amber-700 -mt-0.5">
                      {position.isWhiteTurn ? "Beyaz" : "Siyah"}
                    </p>
                  </div>
                  <div className="w-full aspect-square">
                    <Chessboard
                      position={position.fen}
                      boardWidth={75}
                      arePiecesDraggable={false}
                      customDarkSquareStyle={{ backgroundColor: "#b58863" }}
                      customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        id="satranc-diyagramlari"
        className="fixed -left-[9999px]"
        style={{ width: "210mm", padding: "10mm", backgroundColor: "white" }}
      >
        <h2 className="text-xl font-bold text-center mb-6">{pdfTitle}</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12">
          {savedPositions.map((position, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="mb-2 text-center">
                <h3 className="text-md font-bold">Soru {index + 1}</h3>
                <p className="text-sm">Hamle {position.isWhiteTurn ? "beyazda" : "siyahta"}</p>
              </div>
              <div className="chess-diagram" style={{ width: "65mm", height: "65mm", marginBottom: "5mm" }}>
                <Chessboard
                  position={position.fen}
                  boardWidth={260}
                  arePiecesDraggable={false}
                  customDarkSquareStyle={{ backgroundColor: "#b58863" }}
                  customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
                  orientation={position.isWhiteTurn ? "white" : "black"}
                />
              </div>
            </div>
          ))}        
        </div>
      </div>
    </div>
  );
}

export default HomeworkGeneratorPage;
