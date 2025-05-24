import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDF = async (
  element,
  filename = "satranc-diyagramlari.pdf"
) => {
  try {
    // Orijinal element kopyasını oluştur
    const clonedElement = element.cloneNode(true);
    document.body.appendChild(clonedElement);
    clonedElement.style.position = "absolute";
    clonedElement.style.left = "-9999px";
    clonedElement.style.display = "block";
    clonedElement.style.width = "210mm"; // A4 genişliği
    clonedElement.style.backgroundColor = "white";
    clonedElement.style.padding = "10mm";

    // Başlık ayarla
    const titleElement = clonedElement.querySelector("h2");
    let titleText = "Satranç Ödev Sayfası";
    if (titleElement) {
      titleText = titleElement.textContent;
      titleElement.style.marginBottom = "15px"; // Başlık altında daha fazla boşluk
      titleElement.style.fontWeight = "bold";
      titleElement.style.fontSize = "24px";
    }

    // HTML içeriğini canvas'a dönüştür - scale değeri önemli
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Yüksek çözünürlük için daha yüksek scale değeri
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (_, clonedNode) => {
        // Diyagramları doğru boyutlandır
        const chessboards = clonedNode.querySelectorAll(".chess-diagram");
        chessboards.forEach((board) => {
          board.style.margin = "0 auto"; // Merkeze hizala
        });

        // Diğer düzenlemeler
        const diyagramBasliklari = clonedNode.querySelectorAll("h3");
        diyagramBasliklari.forEach((baslik) => {
          baslik.style.marginBottom = "5px";
          baslik.style.fontWeight = "bold";
        });

        // Grid düzenini optimize et
        const gridContainer = clonedNode.querySelector(".grid");
        if (gridContainer) {
          gridContainer.style.gridGap = "25px 35px";
        }
      },
    });

    // PDF oluştur ve içeriği ekle
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    // Canvas görüntüsünü PDF boyutlarına göre ayarla
    const imgWidth = pdfWidth - 10; // Kenar boşlukları için
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Görüntüyü PDF'e ekle
    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);

    // Temizlik ve kaydet
    document.body.removeChild(clonedElement);
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    return false;
  }
};
