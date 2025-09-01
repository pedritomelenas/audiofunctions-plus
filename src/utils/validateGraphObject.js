/**
 * Validates a single function definition
 * @param {Object} func - Function definition object
 * @param {number} index - Index in array for error messages
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunction(func, index = 0) {
  if (!func || typeof func !== 'object') {
    return [false, 'Function must be an object'];
  }

  // Check for required fields that must exist
  if (!func.hasOwnProperty('id')) {
    return [false, 'Function must have an "id" field'];
  }

  if (!func.hasOwnProperty('functionName')) {
    return [false, 'Function must have a "functionName" field'];
  }

  if (!func.hasOwnProperty('type')) {
    return [false, 'Function must have a "type" field'];
  }

  if (!func.hasOwnProperty('functionDef')) {
    return [false, 'Function must have a "functionDef" field'];
  }

  if (!func.hasOwnProperty('isActive')) {
    return [false, 'Function must have an "isActive" field'];
  }

  if (!func.hasOwnProperty('instrument')) {
    return [false, 'Function must have an "instrument" field'];
  }

  if (!func.hasOwnProperty('pointOfInterests')) {
    return [false, 'Function must have a "pointOfInterests" field'];
  }

  if (!func.hasOwnProperty('landmarks')) {
    return [false, 'Function must have a "landmarks" field'];
  }

  // Validate required fields
  const [isValidId, idError] = validateFunctionId(func.id);
  if (!isValidId) return [false, idError];

  const [isValidName, nameError] = validateFunctionName(func.functionName);
  if (!isValidName) return [false, nameError];

  const [isValidType, typeError] = validateFunctionType(func.type);
  if (!isValidType) return [false, typeError];

  const [isValidDef, defError] = validateFunctionDef(func.functionDef, func.type);
  if (!isValidDef) return [false, defError];

  const [isValidActive, activeError] = validateFunctionActive(func.isActive);
  if (!isValidActive) return [false, activeError];

  const [isValidInstrument, instrumentError] = validateFunctionInstrument(func.instrument);
  if (!isValidInstrument) return [false, instrumentError];

  // Validate optional color field only if present
  if (func.color !== undefined) {
    const [isValidColor, colorError] = validateFunctionColor(func.color);
    if (!isValidColor) return [false, colorError];
  }

  const [isValidPoints, pointsError] = validatePointsOfInterest(func.pointOfInterests);
  if (!isValidPoints) return [false, pointsError];

  const [isValidLandmarks, landmarksError] = validateLandmarks(func.landmarks);
  if (!isValidLandmarks) return [false, landmarksError];

  return [true, ''];
}

/**
 * Validates JSON data for compatibility with the application
 * @param {Object} data - The parsed JSON data to validate
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateJsonData(data) {
  try {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return [false, 'Data must be an object'];
    }
    
    // Check for required top-level structure
    if (!data.functions && !data.graphSettings) {
      return [false, 'Data must contain either "functions" or "graphSettings"'];
    }

    // Check that functions exists and is present
    if (data.functions && !data.hasOwnProperty('functions')) {
      return [false, 'Data must have a "functions" field'];
    }

    // Check that graphSettings exists and is present
    if (data.graphSettings && !data.hasOwnProperty('graphSettings')) {
      return [false, 'Data must have a "graphSettings" field'];
    }
    
    // Prevent circular references and deep nesting
    const maxDepth = 10;
    if (!isValidObjectDepth(data, maxDepth)) {
      return [false, 'Object structure is too deeply nested'];
    }

    // Validate functions array
    if (data.functions) {
      const [isValidFunctions, functionsError] = validateFunctions(data.functions);
      if (!isValidFunctions) {
        return [false, functionsError];
      }
    }

    // Validate graph settings
    if (data.graphSettings) {
      const [isValidSettings, settingsError] = validateGraphSettings(data.graphSettings);
      if (!isValidSettings) {
        return [false, settingsError];
      }
    }
    
    // Check for unexpected properties at root level
    const allowedRootProps = ['functions', 'graphSettings'];
    const unexpectedProps = Object.keys(data).filter(key => !allowedRootProps.includes(key));
    if (unexpectedProps.length > 0) {
      console.warn(`Unexpected properties in JSON: ${unexpectedProps.join(', ')}`);
    }

    return [true, ''];
  } catch (error) {
    return [false, `Validation error: ${error.message}`];
  }
}

/**
 * Validates object depth to prevent circular references and excessive nesting
 * @param {*} obj - Object to validate
 * @param {number} maxDepth - Maximum allowed depth
 * @param {number} currentDepth - Current depth (internal use)
 * @returns {boolean} - True if depth is valid
 */
function isValidObjectDepth(obj, maxDepth, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    return false;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    for (const value of Object.values(obj)) {
      if (!isValidObjectDepth(value, maxDepth, currentDepth + 1)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validates the functions array
 * @param {Array} functions - Array of function definitions
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctions(functions) {
  if (!Array.isArray(functions)) {
    return [false, 'Functions must be an array'];
  }
  
  // Limit number of functions to prevent performance issues
  const MAX_FUNCTIONS = 50;
  if (functions.length > MAX_FUNCTIONS) {
    return [false, `Too many functions (maximum ${MAX_FUNCTIONS} allowed)`];
  }

  for (let i = 0; i < functions.length; i++) {
    const [isValid, error] = validateFunction(functions[i], i);
    if (!isValid) {
      return [false, `Function ${i + 1}: ${error}`];
    }
  }

  // Check for duplicate IDs
  const ids = functions.map(f => f.id).filter(id => id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    return [false, 'Duplicate function IDs found'];
  }

  return [true, ''];
}

/**
 * Validates strings with additional safety checks
 * @param {string} value - String value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {Object} options - Validation options
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
function validateSafeString(value, fieldName, options = {}) {
  const { 
    maxLength = 1000, 
    minLength = 0, 
    allowEmpty = false,
    pattern = null 
  } = options;
  
  if (typeof value !== 'string') {
    return [false, `${fieldName} must be a string`];
  }
  
  if (!allowEmpty && value.trim().length === 0) {
    return [false, `${fieldName} cannot be empty`];
  }
  
  if (value.length > maxLength) {
    return [false, `${fieldName} is too long (maximum ${maxLength} characters)`];
  }
  
  if (value.length < minLength) {
    return [false, `${fieldName} is too short (minimum ${minLength} characters)`];
  }
  
  if (pattern && !pattern.test(value)) {
    return [false, `${fieldName} contains invalid characters`];
  }
  
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i
  ];
  
  for (const dangerousPattern of dangerousPatterns) {
    if (dangerousPattern.test(value)) {
      return [false, `${fieldName} contains potentially unsafe content`];
    }
  }
  
  return [true, ''];
}

/**
 * Enhanced coordinate validation with reasonable bounds
 * @param {number} value - Coordinate value
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
function validateCoordinate(value, fieldName) {
  if (typeof value !== 'number') {
    return [false, `${fieldName} must be a number`];
  }
  
  if (!isFinite(value)) {
    return [false, `${fieldName} must be a finite number`];
  }
  
  // Add reasonable bounds to prevent extreme values
  const MAX_COORDINATE = 1000000;
  const MIN_COORDINATE = -1000000;
  
  if (value > MAX_COORDINATE || value < MIN_COORDINATE) {
    return [false, `${fieldName} must be between ${MIN_COORDINATE} and ${MAX_COORDINATE}`];
  }
  
  return [true, ''];
}

/**
 * Validates function ID
 * @param {string} id - Function ID
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionId(id) {
  return validateSafeString(id, 'Function ID', {
    maxLength: 50,
    minLength: 1,
    pattern: /^[a-zA-Z0-9_-]+$/
  });
}

/**
 * Validates function name
 * @param {string} functionName - Function name
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionName(functionName) {
  return validateSafeString(functionName, 'Function name', {
    maxLength: 100,
    minLength: 1,
    pattern: /^[a-zA-Z0-9\s\-_()[\]]+$/
  });
}

/**
 * Validates function type
 * @param {string} type - Function type
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionType(type) {
  const validTypes = ['function', 'piecewise_function'];
  if (typeof type !== 'string') {
    return [false, 'Function type must be a string'];
  }
  if (!validTypes.includes(type)) {
    return [false, `Function type must be one of: ${validTypes.join(', ')}`];
  }
  return [true, ''];
}

/**
 * Validates function definition structure only (no mathematical validation)
 * @param {string|Array} functionDef - Function definition
 * @param {string} type - Function type
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionDef(functionDef, type) {
  if (type === 'function') {
    if (typeof functionDef !== 'string') {
      return [false, 'Function definition must be a string for regular functions'];
    }
    
    if (functionDef.trim() === '') {
      return [false, 'Function definition cannot be empty'];
    }
    
    if (functionDef.length > 1000) {
      return [false, 'Function definition is too long (maximum 1000 characters)'];
    }
    
    return [true, ''];
  } else if (type === 'piecewise_function') {
    if (!Array.isArray(functionDef)) {
      return [false, 'Function definition must be an array for piecewise functions'];
    }
    
    if (functionDef.length === 0) {
      return [false, 'Piecewise function must have at least one piece'];
    }
    
    if (functionDef.length > 20) {
      return [false, 'Too many piecewise function pieces (maximum 20 allowed)'];
    }
    
    for (let i = 0; i < functionDef.length; i++) {
      const piece = functionDef[i];
      if (!Array.isArray(piece) || piece.length !== 2) {
        return [false, `Piecewise function piece ${i + 1} must be an array with exactly 2 elements`];
      }
      if (typeof piece[0] !== 'string' || typeof piece[1] !== 'string') {
        return [false, `Piecewise function piece ${i + 1} must contain two strings`];
      }
      
      if (piece[0].trim() === '' || piece[1].trim() === '') {
        return [false, `Piecewise function piece ${i + 1} cannot have empty expressions`];
      }
      
      if (piece[0].length > 500 || piece[1].length > 500) {
        return [false, `Piecewise function piece ${i + 1} expressions are too long (maximum 500 characters each)`];
      }
    }
    return [true, ''];
  }
  return [false, 'Invalid function type for validation'];
}

/**
 * Validates function active status
 * @param {boolean} isActive - Active status
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionActive(isActive) {
  if (typeof isActive !== 'boolean') {
    return [false, 'Function isActive must be a boolean'];
  }
  return [true, ''];
}

/**
 * Validates function instrument
 * @param {string} instrument - Instrument name
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionInstrument(instrument) {
  return validateSafeString(instrument, 'Function instrument', {
    maxLength: 50,
    minLength: 1
  });
}

/**
 * Validates function color
 * @param {string} color - Color value
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateFunctionColor(color) {
  if (typeof color !== 'string') {
    return [false, 'Function color must be a string'];
  }
  // Basic hex color validation
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return [false, 'Function color must be a valid hex color (e.g., #FF0000)'];
  }
  return [true, ''];
}

/**
 * Validates points of interest array
 * @param {Array} points - Points of interest
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validatePointsOfInterest(points) {
  if (!Array.isArray(points)) {
    return [false, 'Points of interest must be an array'];
  }
  
  const MAX_POINTS = 100;
  if (points.length > MAX_POINTS) {
    return [false, `Too many points of interest (maximum ${MAX_POINTS} allowed)`];
  }

  for (let i = 0; i < points.length; i++) {
    const [isValid, error] = validatePointOfInterest(points[i], i);
    if (!isValid) {
      return [false, `Point of interest ${i + 1}: ${error}`];
    }
  }

  return [true, ''];
}

/**
 * Validates a single point of interest
 * @param {Object} point - Point of interest object
 * @param {number} index - Index for error messages
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validatePointOfInterest(point, index = 0) {
  if (!point || typeof point !== 'object') {
    return [false, 'Point of interest must be an object'];
  }

  // Check for required fields
  if (!point.hasOwnProperty('x')) {
    return [false, 'Point of interest must have an "x" field'];
  }

  if (!point.hasOwnProperty('y')) {
    return [false, 'Point of interest must have a "y" field'];
  }

  if (!point.hasOwnProperty('type')) {
    return [false, 'Point of interest must have a "type" field'];
  }

  // Enhanced coordinate validation
  const [isValidX, xError] = validateCoordinate(point.x, 'Point x coordinate');
  if (!isValidX) return [false, xError];

  if (point.y !== undefined) {
    // Allow NaN for discontinuities, but validate finite numbers
    if (!isNaN(point.y)) {
      const [isValidY, yError] = validateCoordinate(point.y, 'Point y coordinate');
      if (!isValidY) return [false, yError];
    }
  }

  const validTypes = ['isolated', 'unequal', 'maximum', 'minimum', 'discontinuity'];
  if (typeof point.type !== 'string' || !validTypes.includes(point.type)) {
    return [false, `Point type must be one of: ${validTypes.join(', ')}`];
  }

  // Validate optional fields only if present
  if (point.label !== undefined) {
    const [isValidLabel, labelError] = validateSafeString(point.label, 'Point label', {
      maxLength: 100,
      allowEmpty: true
    });
    if (!isValidLabel) return [false, labelError];
  }

  if (point.color !== undefined) {
    const [isValidColor, colorError] = validateFunctionColor(point.color);
    if (!isValidColor) return [false, colorError];
  }

  if (point.earcon !== undefined) {
    const [isValidEarcon, earconError] = validateSafeString(point.earcon, 'Point earcon', {
      maxLength: 100,
      allowEmpty: true
    });
    if (!isValidEarcon) return [false, earconError];
  }

  return [true, ''];
}

/**
 * Validates landmarks array
 * @param {Array} landmarks - Landmarks array
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateLandmarks(landmarks) {
  if (!Array.isArray(landmarks)) {
    return [false, 'Landmarks must be an array'];
  }
  
  const MAX_LANDMARKS = 50;
  if (landmarks.length > MAX_LANDMARKS) {
    return [false, `Too many landmarks (maximum ${MAX_LANDMARKS} allowed)`];
  }

  for (let i = 0; i < landmarks.length; i++) {
    const [isValid, error] = validateLandmark(landmarks[i], i);
    if (!isValid) {
      return [false, `Landmark ${i + 1}: ${error}`];
    }
  }

  return [true, ''];
}

/**
 * Validates a single landmark
 * @param {Object} landmark - Landmark object
 * @param {number} index - Index for error messages
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateLandmark(landmark, index = 0) {
  if (!landmark || typeof landmark !== 'object') {
    return [false, 'Landmark must be an object'];
  }

  // Check for required fields
  if (!landmark.hasOwnProperty('x')) {
    return [false, 'Landmark must have an "x" field'];
  }

  if (!landmark.hasOwnProperty('y')) {
    return [false, 'Landmark must have a "y" field'];
  }

  if (!landmark.hasOwnProperty('earcon')) {
    return [false, 'Landmark must have an "earcon" field'];
  }

  if (!landmark.hasOwnProperty('shortcut')) {
    return [false, 'Landmark must have a "shortcut" field'];
  }

  // Enhanced coordinate validation
  const [isValidX, xError] = validateCoordinate(landmark.x, 'Landmark x coordinate');
  if (!isValidX) return [false, xError];

  const [isValidY, yError] = validateCoordinate(landmark.y, 'Landmark y coordinate');
  if (!isValidY) return [false, yError];

  const [isValidEarcon, earconError] = validateSafeString(landmark.earcon, 'Landmark earcon', {
    maxLength: 100,
    allowEmpty: true
  });
  if (!isValidEarcon) return [false, earconError];

  const [isValidShortcut, shortcutError] = validateSafeString(landmark.shortcut, 'Landmark shortcut', {
    maxLength: 20,
    allowEmpty: true
  });
  if (!isValidShortcut) return [false, shortcutError];

  // Validate optional fields only if present
  if (landmark.label !== undefined) {
    const [isValidLabel, labelError] = validateSafeString(landmark.label, 'Landmark label', {
      maxLength: 100,
      allowEmpty: true
    });
    if (!isValidLabel) return [false, labelError];
  }

  if (landmark.color !== undefined) {
    const [isValidColor, colorError] = validateFunctionColor(landmark.color);
    if (!isValidColor) return [false, colorError];
  }

  if (landmark.message !== undefined) {
    const [isValidMessage, messageError] = validateSafeString(landmark.message, 'Landmark message', {
      maxLength: 500,
      allowEmpty: true
    });
    if (!isValidMessage) return [false, messageError];
  }

  return [true, ''];
}

/**
 * Validates graph settings object
 * @param {Object} settings - Graph settings object
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateGraphSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return [false, 'Graph settings must be an object'];
  }

  // Validate optional fields
  if (settings.defaultView !== undefined) {
    const [isValidView, viewError] = validateDefaultView(settings.defaultView);
    if (!isValidView) return [false, viewError];
  }

  if (settings.minBoundDifference !== undefined) {
    const [isValidMin, minError] = validateMinBoundDifference(settings.minBoundDifference);
    if (!isValidMin) return [false, minError];
  }

  if (settings.maxBoundDifference !== undefined) {
    const [isValidMax, maxError] = validateMaxBoundDifference(settings.maxBoundDifference);
    if (!isValidMax) return [false, maxError];
  }

  if (settings.showGrid !== undefined) {
    const [isValidGrid, gridError] = validateShowGrid(settings.showGrid);
    if (!isValidGrid) return [false, gridError];
  }

  if (settings.showAxes !== undefined) {
    const [isValidAxes, axesError] = validateShowAxes(settings.showAxes);
    if (!isValidAxes) return [false, axesError];
  }

  if (settings.gridColor !== undefined) {
    const [isValidColor, colorError] = validateGridColor(settings.gridColor);
    if (!isValidColor) return [false, colorError];
  }

  if (settings.restrictionMode !== undefined) {
    const [isValidMode, modeError] = validateRestrictionMode(settings.restrictionMode);
    if (!isValidMode) return [false, modeError];
  }

  return [true, ''];
}

/**
 * Validates default view array
 * @param {Array} defaultView - Default view bounds [xMin, xMax, yMax, yMin]
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateDefaultView(defaultView) {
  if (!Array.isArray(defaultView)) {
    return [false, 'Default view must be an array'];
  }
  if (defaultView.length !== 4) {
    return [false, 'Default view must contain exactly 4 elements [xMin, xMax, yMax, yMin]'];
  }
  for (let i = 0; i < 4; i++) {
    if (typeof defaultView[i] !== 'number' || !isFinite(defaultView[i])) {
      return [false, `Default view element ${i} must be a finite number`];
    }
  }
  
  const [xMin, xMax, yMax, yMin] = defaultView;
  if (xMin >= xMax) {
    return [false, 'Default view: xMin must be less than xMax'];
  }
  if (yMin >= yMax) {
    return [false, 'Default view: yMin must be less than yMax'];
  }
  
  return [true, ''];
}

/**
 * Validates minimum bound difference
 * @param {number} minBoundDifference - Minimum bound difference
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateMinBoundDifference(minBoundDifference) {
  if (typeof minBoundDifference !== 'number' || !isFinite(minBoundDifference)) {
    return [false, 'Minimum bound difference must be a finite number'];
  }
  if (minBoundDifference <= 0) {
    return [false, 'Minimum bound difference must be positive'];
  }
  return [true, ''];
}

/**
 * Validates maximum bound difference
 * @param {number} maxBoundDifference - Maximum bound difference
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateMaxBoundDifference(maxBoundDifference) {
  if (typeof maxBoundDifference !== 'number' || !isFinite(maxBoundDifference)) {
    return [false, 'Maximum bound difference must be a finite number'];
  }
  if (maxBoundDifference <= 0) {
    return [false, 'Maximum bound difference must be positive'];
  }
  return [true, ''];
}

/**
 * Validates show grid setting
 * @param {boolean} showGrid - Show grid setting
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateShowGrid(showGrid) {
  if (typeof showGrid !== 'boolean') {
    return [false, 'Show grid setting must be a boolean'];
  }
  return [true, ''];
}

/**
 * Validates show axes setting
 * @param {boolean} showAxes - Show axes setting
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateShowAxes(showAxes) {
  if (typeof showAxes !== 'boolean') {
    return [false, 'Show axes setting must be a boolean'];
  }
  return [true, ''];
}

/**
 * Validates grid color
 * @param {string} gridColor - Grid color
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateGridColor(gridColor) {
  if (typeof gridColor !== 'string') {
    return [false, 'Grid color must be a string'];
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(gridColor)) {
    return [false, 'Grid color must be a valid hex color (e.g., #CCCCCC)'];
  }
  return [true, ''];
}

/**
 * Validates restriction mode
 * @param {string} restrictionMode - Restriction mode
 * @returns {Array} - [isValid: boolean, errorMessage: string]
 */
export function validateRestrictionMode(restrictionMode) {
  const validModes = ['none', 'read-only'];
  if (typeof restrictionMode !== 'string') {
    return [false, 'Restriction mode must be a string'];
  }
  if (!validModes.includes(restrictionMode)) {
    return [false, `Restriction mode must be one of: ${validModes.join(', ')}`];
  }
  return [true, ''];
}