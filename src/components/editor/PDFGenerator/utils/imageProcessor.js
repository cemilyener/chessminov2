export const cleanBase64Image = async (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return null;
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Canvas error:', error);
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = base64String;
  });
};

// Add the missing createPlaceholderImage function
export const createPlaceholderImage = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border and "X" pattern
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Draw X
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    
    // Add text
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Image not available', canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating placeholder image:', error);
    // Return minimal valid data URL if even canvas fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJDuZzMnQAAAABJRU5ErkJggg==';
  }
};

// Also add these functions that might be used elsewhere in the application
export const processChessboardImage = async (dataUrl) => {
  try {
    return await cleanBase64Image(dataUrl);
  } catch (error) {
    console.error('Failed to process chessboard image:', error);
    return createPlaceholderImage();
  }
};

export const batchProcessImages = async (dataUrls) => {
  try {
    const results = await Promise.all(
      dataUrls.map(url => cleanBase64Image(url))
    );
    return results.map(result => result || createPlaceholderImage());
  } catch (error) {
    console.error('Failed to batch process images:', error);
    return dataUrls.map(() => createPlaceholderImage());
  }
};
