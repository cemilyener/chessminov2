/**
 * Debugging utilities for ChessMino PDF Generator
 */

/**
 * Check if the Buffer polyfill is correctly installed
 * @returns {boolean} true if Buffer is available and properly polyfilled
 */
export const checkBufferPolyfill = () => {
  try {
    console.debug('Checking Buffer polyfill...');
    
    // Check if Buffer exists
    if (typeof window.Buffer === 'undefined') {
      console.error('Buffer is not defined in the window object');
      return false;
    }
    
    // Check critical methods
    if (typeof window.Buffer.isBuffer !== 'function') {
      console.error('Buffer.isBuffer is not a function');
      return false;
    }
    
    if (typeof window.Buffer.from !== 'function') {
      console.error('Buffer.from is not a function');
      return false;
    }
    
    // Test with a simple string
    try {
      const testBuffer = window.Buffer.from('test');
      const isBuffer = window.Buffer.isBuffer(testBuffer);
      console.debug('Buffer.isBuffer test result:', isBuffer);
      
      if (!isBuffer) {
        console.warn('Buffer.isBuffer returned false for a Buffer object');
      }
    } catch (e) {
      console.error('Error testing Buffer functions:', e);
      return false;
    }
    
    console.debug('Buffer polyfill check passed');
    return true;
  } catch (e) {
    console.error('Error checking Buffer polyfill:', e);
    return false;
  }
};

/**
 * Log component rendering process for debugging
 */
export const logComponentRendering = (componentName, props) => {
  console.debug(`[Render] ${componentName}`, {
    timestamp: new Date().toISOString(),
    props: props ? JSON.stringify(props) : 'No props',
  });
};

/**
 * Log detailed error information
 */
export const logDetailedError = (error, context) => {
  console.error('===== DETAILED ERROR =====');
  console.error(`Context: ${context}`);
  console.error(`Error: ${error?.message || 'Unknown error'}`);
  console.error(`Stack: ${error?.stack || 'No stack trace'}`);
  
  // Extra Buffer-specific info
  if (error?.message?.includes('Buffer')) {
    console.error('This appears to be a Buffer-related error');
    console.error('Buffer polyfill status:', checkBufferPolyfill());
  }
  
  console.error('=========================');
};

/**
 * Extract the relevant part of an error message
 */
export const getErrorSummary = (error) => {
  if (!error) return 'Unknown error';
  
  // If it's a string, return it directly
  if (typeof error === 'string') return error;
  
  // If it's an error object with a message
  if (error.message) return error.message;
  
  // Try to convert to string
  try {
    return String(error);
  } catch (e) {
    return 'Error cannot be displayed';
  }
};
