import React from 'react';

/**
 * WorkflowExplanation component displays an explanation of the workflow between 
 * PDF Generator and Worksheet pages with a visual indicator of the current step.
 */
const WorkflowExplanation = ({ currentStep = 1 }) => {  // Steps in the workflow
  const steps = [
    { id: 1, name: 'Pozisyonları Oluştur', description: '6 adet satranç pozisyonu oluştur' },
    { id: 2, name: 'Düzeni Kontrol Et', description: 'Pozisyonların düzenini kontrol et' },
    { id: 3, name: 'Çalışma Sayfası', description: 'Yazdırılabilir sayfa görünümü' },
    { id: 4, name: 'PDF Oluştur', description: 'PDF olarak yazdır veya kaydet' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Worksheet Creation Workflow</h3>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div className="flex flex-col items-center relative">              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step.id 
                    ? 'bg-blue-600 text-white' 
                    : currentStep > step.id 
                      ? 'bg-green-100 text-green-800 border border-green-500' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                role="img"
                aria-label={`Step ${step.id}: ${step.name} - ${currentStep === step.id ? 'Current step' : currentStep > step.id ? 'Completed' : 'Upcoming'}`}
              >
                {currentStep > step.id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${currentStep === step.id ? 'text-blue-800' : 'text-gray-600'}`}>
                {step.name}
              </span>
              <span className="text-xs text-gray-500 max-w-[100px] text-center mt-1">
                {step.description}
              </span>
            </div>
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-full max-w-[60px] flex-grow mx-1 
                ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
        <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
        <p><strong>Şu Anki Adım:</strong> {steps.find(step => step.id === currentStep)?.description}</p>
        <p className="mt-1">
          Bu iş akışı, 6 satranç diyagramını içeren bir PDF çalışma sayfası oluşturmanıza yardımcı olur.
        </p>
        <p className="mt-1 font-medium">
          PDF oluşturmak için son adımda tarayıcı yazdırma ekranında "PDF olarak kaydet" seçeneğini kullanın.
        </p>
      </div>
    </div>
  );
};

export default WorkflowExplanation;
