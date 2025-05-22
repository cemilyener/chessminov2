import { useCallback, useState } from 'react';
import { toPng } from 'html-to-image';

/**
 * Chess board capture hook using html-to-image
 * Ensures squares are perfectly square (1:1 aspect ratio)
 */
export const usePositionCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  const captureBoard = useCallback(async (elementRef) => {
    if (!elementRef.current) {
      setError('Capture element reference not found');
      return null;
    }

    setIsCapturing(true);
    setError(null);

    try {
      // Set fixed dimensions for consistent capture
      const captureOptions = {
        quality: 1.0,
        pixelRatio: 2, // Higher resolution
        width: 400,
        height: 400, // Force 1:1 aspect ratio
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        style: {
          // Override any transforms or styles that might distort the ratio
          transform: 'none',
          boxShadow: 'none',
          border: '1px solid #ccc'
        }
      };

      // Use toPng instead of html2canvas
      const screenshot = await toPng(elementRef.current, captureOptions);
      return screenshot;
    } catch (err) {
      console.error('Board capture error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { captureBoard, isCapturing, error };
};

export default usePositionCapture;
