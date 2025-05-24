import { Chessboard } from "react-chessboard";
import useChessStore from "../store/useChessStore";

function SavedPositionsList() {
  const savedPositions = useChessStore((state) => state.savedPositions);
  const clearPositions = useChessStore((state) => state.clearPositions);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Kaydedilen Pozisyonlar ({savedPositions.length}/6)
        </h2>
        {savedPositions.length > 0 && (
          <button
            onClick={clearPositions}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Tümünü Temizle
          </button>
        )}
      </div>

      {savedPositions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Henüz kaydedilmiş pozisyon bulunmuyor</p>
          <p className="text-sm text-gray-400 mt-2">
            Pozisyonları kaydetmek için satranç tahtasında bir düzen oluşturun
            ve "Bu Pozisyonu Kaydet" butonuna tıklayın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPositions.map((fen, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">
                Pozisyon {index + 1}
              </h3>
              <div className="w-full aspect-square max-w-[200px] mx-auto">
                <Chessboard
                  position={fen}
                  boardWidth={200}
                  arePiecesDraggable={false}
                  customDarkSquareStyle={{ backgroundColor: "#b58863" }}
                  customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
                />
              </div>
              <p className="mt-2 text-xs font-mono truncate hover:text-clip hover:overflow-visible">
                {fen}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedPositionsList;