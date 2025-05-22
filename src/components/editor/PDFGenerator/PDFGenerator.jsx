import React, { useState } from 'react';
import PDFPositionEditor from './components/PDFPositionEditor';
import PDFSettings from './components/PDFSettings';
import PDFPositionList from './components/PDFPositionList';
import PDFGeneratorMain from './components/PDFGeneratorMain';
import WorkflowExplanation from './components/WorkflowExplanation';

const PDFGeneratorPage = () => {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' veya 'preview'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-slate-900">ChessMino PDF Generator</h1>
          <p className="text-sm text-slate-500">Yeni PDF oluşturma modülü (v2) - @react-pdf/renderer ve html-to-image tabanlı</p>
        </div>
      </header>      {/* Workflow Guide */}
      <div className="container mx-auto px-4 pt-4">
        <WorkflowExplanation currentStep={activeTab === 'editor' ? 1 : 2} />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'editor' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Pozisyon Düzenle
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'preview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            PDF Oluşturma
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Settings and Position List */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Settings Component */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <PDFSettings />
              </div>
              
              {/* Position List Component */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <PDFPositionList />
              </div>
            </div>
          </div>          {/* Right Column - Position Editor or Preview */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {activeTab === 'editor' ? (
                <PDFPositionEditor />
              ) : (
                <PDFGeneratorMain />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFGeneratorPage;