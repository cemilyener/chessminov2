/**
 * Complete Buffer polyfill for @react-pdf/renderer in browser environments
 * Enhanced version to fix "Buffer is not defined" errors
 */
export const initBufferPolyfill = () => {
  if (typeof window !== 'undefined') {
    // Only create the polyfill in browser environments
    if (!window.Buffer) {
      // Create a more complete Buffer implementation
      const BufferPolyfill = function(arg) {
        // Handle different constructor patterns
        if (typeof arg === 'number') {
          this.length = arg;
          this._isBuffer = true;
          this._value = new Uint8Array(arg);
        } else if (typeof arg === 'string') {
          this.length = arg.length;
          this._isBuffer = true;
          this._value = arg;
        } else if (Array.isArray(arg) || arg instanceof Uint8Array) {
          this.length = arg.length;
          this._isBuffer = true;
          this._value = arg;
        } else {
          this.length = 0;
          this._isBuffer = true;
          this._value = '';
        }
      };
      
      // Setup Buffer prototype methods
      BufferPolyfill.prototype = {
        toString: function() {
          if (typeof this._value === 'string') {
            return this._value;
          } else if (Array.isArray(this._value) || this._value instanceof Uint8Array) {
            try {
              return String.fromCharCode.apply(null, this._value);
            } catch (err) {
              console.warn("Buffer toString conversion failed:", err);
              return '';
            }
          }
          return '';
        },
        slice: function(start, end) {
          if (Array.isArray(this._value) || this._value instanceof Uint8Array) {
            const sliced = this._value.slice(start, end);
            const newBuf = new BufferPolyfill(sliced);
            return newBuf;
          }
          return new BufferPolyfill(0);
        }
      };
      
      // Setup Buffer static methods
      BufferPolyfill.from = function(value) {
        return new BufferPolyfill(value);
      };
      
      BufferPolyfill.isBuffer = function(obj) {
        return obj && obj._isBuffer === true;
      };
      
      BufferPolyfill.alloc = function(size, fill) {
        // Safety limit to prevent browser crashes
        if (size > 1000000) {
          console.warn('Buffer.alloc: Limiting large allocation:', size);
          size = 1000000;
        }
        
        const buf = new BufferPolyfill(size);
        if (fill !== undefined) {
          // Simple implementation for filling
          if (typeof buf._value.fill === 'function') {
            buf._value.fill(fill);
          }
        }
        return buf;
      };
      
      // Assign to window
      window.Buffer = BufferPolyfill;
      
      console.log('Enhanced Buffer polyfill initialized for @react-pdf/renderer');
    }
  }
};