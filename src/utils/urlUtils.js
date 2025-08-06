/**
 * Decode base64 URL parameter from import hash to function definitions and graph settings
 * @param {string} base64String - Base64 encoded string
 * @returns {Object|null} Decoded data or null if invalid
 */
export function decodeFromImportLink(base64String) {
  if (!base64String) return null;
  
  try {
    const jsonString = atob(base64String);
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.functions)) return null;
    if (!data.graphSettings || typeof data.graphSettings !== 'object') return null;
    
    // Validate defaultView if present
    if (data.graphSettings.defaultView) {
      if (!Array.isArray(data.graphSettings.defaultView) || 
          data.graphSettings.defaultView.length !== 4) {
        console.warn('Invalid defaultView format, using defaults');
        data.graphSettings.defaultView = [-10, 10, 10, -10];
      }
      
      // Ensure all values are finite numbers
      const [xMin, xMax, yMax, yMin] = data.graphSettings.defaultView;
      if (!isFinite(xMin) || !isFinite(xMax) || !isFinite(yMin) || !isFinite(yMax)) {
        console.warn('Invalid defaultView values, using defaults');
        data.graphSettings.defaultView = [-10, 10, 10, -10];
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error decoding import link:', error);
    return null;
  }
}

/**
 * Get URL hash parameter value (after #)
 * @param {string} paramName - Parameter name
 * @returns {string|null} Parameter value or null
 */
export function getHashParameter(paramName) {
  const hash = window.location.hash.substring(1); // Remove #
  const params = new URLSearchParams(hash);
  return params.get(paramName);
}

/**
 * Clear hash parameter after loading
 */
export function clearHashParameter() {
  const url = new URL(window.location);
  url.hash = '';
  window.history.replaceState({}, '', url);
}