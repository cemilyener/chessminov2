import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Basit Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-700">ChessMino</h1>
          </div>
        </div>
      </header>
      {/* Hero Bölümü */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6">
            Satranç Öğrenmenin Kolay Yolu
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            ChessMino, 3-8 yaş arası çocuklara satranç öğreten interaktif ve eğlenceli bir platformdur.
          </p>
        </div>
      </section>
      {/* Ana Menü Kartları */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Puzzle Kart */}
            <Link to="/puzzle" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-purple-100 inline-block p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Puzzle</h3>
              <p className="text-gray-600 mb-4">Eğlenceli satranç bulmacaları çözerek becerilerinizi geliştirin.</p>
              <span className="mt-2 inline-block text-purple-700 font-medium">Puzzle Çöz</span>
            </Link>
            {/* Tahta Kart */}
            <Link to="/board" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-blue-100 inline-block p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Tahta</h3>
              <p className="text-gray-600 mb-4">İnteraktif tahtada hamleleri ve varyantları deneyin.</p>
              <span className="mt-2 inline-block text-blue-700 font-medium">Tahtaya Git</span>
            </Link>
            {/* Dersler Kart */}
            <Link to="/lessons" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-amber-100 inline-block p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-amber-800 mb-3">Dersler</h3>
              <p className="text-gray-600 mb-4">Adım adım rehberli derslerle satranç öğrenin.</p>
              <span className="mt-2 inline-block text-amber-700 font-medium">Derslere Başla</span>
            </Link>
            {/* BoardEditor Kart */}
            <Link to="/editor" className="md:col-span-2 lg:col-span-3 bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <div className="bg-emerald-100 inline-block p-4 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-3">Tahta Editörü</h3>
                  <p className="text-gray-600 mb-4">Kendi satranç pozisyonlarınızı oluşturun, PGN dosyalarını yükleyin ve düzenleyin.</p>
                  <span className="mt-2 inline-block text-emerald-700 font-medium">Editöre Git</span>
                </div>
              </div>
            </Link>
            {/* Temel Tahta Kart */}
            <Link to="/basic-board" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-indigo-100 inline-block p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Temel Tahta</h3>
              <p className="text-gray-600">Ok çizme ve kare renklendirme özellikleriyle basit satranç tahtası</p>
            </Link>
          </div>
        </div>
      </section>
      {/* Basit Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 px-4 mt-12">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} ChessMino. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
