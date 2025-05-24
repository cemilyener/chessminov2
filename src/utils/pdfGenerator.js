import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (element, filename = "satranc-diyagramlari.pdf") => {
  try {
    console.log('PDF oluşturuluyor...');
    
    // Element'i canvas'a dönüştür
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // PDF oluştur
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Sayfa boyutları
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Görüntü boyutlarını hesapla
    const imgWidth = pageWidth - 20; // 10mm margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Görüntüyü PDF'e ekle
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // PDF'i indir
    pdf.save(filename);
    
    console.log('PDF başarıyla oluşturuldu!');
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    alert('PDF oluşturulurken bir hata oluştu.');
  }
};
