import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePDF = async (element) => {
  const pdf = new jsPDF();
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");
  
  const imgWidth = 190; // Width of the image in mm
  const pageHeight = pdf.internal.pageSize.height;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  // Add the image to the PDF
  pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add new pages if the image height exceeds the page height
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Save the PDF
  pdf.save("chess_positions.pdf");
};