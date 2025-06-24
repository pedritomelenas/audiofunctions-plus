/**
 * Utility functions for working with functionDefinitions and graphSettings
 */

// =============================
// Function Definitions Utilities
// =============================

/**
 * Get the function string of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {string|null} Function string or null if not found
 */
export function getFunctionStringN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.functionString ?? null;
}

/**
 * Get the function name of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {string|null} Function name or null if not found
 */
export function getFunctionNameN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.functionName ?? null;
}

/**
 * Get the function type of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {string|null} Function type or null if not found
 */
export function getFunctionTypeN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.type ?? null;
}

/**
 * Get the color of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {string|null} Function color or null if not found
 */
export function getFunctionColorN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.color ?? null;
}

/**
 * Get the instrument of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {string|null} Function instrument or null if not found
 */
export function getFunctionInstrumentN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.instrument ?? null;
}

/**
 * Check if the nth function is active
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {boolean} True if function is active, false otherwise
 */
export function isFunctionActiveN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.isActive ?? false;
}

/**
 * Get all active functions
 * @param {Array} functionDefinitions - Array of function definitions
 * @returns {Array} Array of active functions
 */
export function getActiveFunctions(functionDefinitions) {
  return functionDefinitions?.filter(func => func.isActive) ?? [];
}

/**
 * Get all inactive functions
 * @param {Array} functionDefinitions - Array of function definitions
 * @returns {Array} Array of inactive functions
 */
export function getInactiveFunctions(functionDefinitions) {
  return functionDefinitions?.filter(func => !func.isActive) ?? [];
}

/**
 * Find function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID to search for
 * @returns {Object|null} Function object or null if not found
 */
export function getFunctionById(functionDefinitions, id) {
  return functionDefinitions?.find(func => func.id === id) ?? null;
}

/**
 * Get the total count of functions
 * @param {Array} functionDefinitions - Array of function definitions
 * @returns {number} Number of functions
 */
export function getFunctionCount(functionDefinitions) {
  return functionDefinitions?.length ?? 0;
}

/**
 * Get points of interest for the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {Array} Array of points of interest or empty array
 */
export function getPointsOfInterestN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.pointOfInterests ?? [];
}

/**
 * Get landmarks for the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {Array} Array of landmarks or empty array
 */
export function getLandmarksN(functionDefinitions, n) {
  return functionDefinitions?.[n]?.landmarks ?? [];
}

/**
 * Get functions filtered by type
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} type - Function type to filter by
 * @returns {Array} Array of functions with the specified type
 */
export function getFunctionsByType(functionDefinitions, type) {
  return functionDefinitions?.filter(func => func.type === type) ?? [];
}

/**
 * Get functions filtered by instrument
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} instrument - Instrument to filter by
 * @returns {Array} Array of functions with the specified instrument
 */
export function getFunctionsByInstrument(functionDefinitions, instrument) {
  return functionDefinitions?.filter(func => func.instrument === instrument) ?? [];
}

// =============================
// Graph Settings Utilities
// =============================

/**
 * Get the default view bounds
 * @param {Object} graphSettings - Graph settings object
 * @returns {Array|null} Default view array [xMin, xMax, yMax, yMin] or null if not found
 */
export function getDefaultView(graphSettings) {
  return graphSettings?.defaultView ?? null;
}

/**
 * Get the minimum bound difference
 * @param {Object} graphSettings - Graph settings object
 * @returns {number|null} Minimum bound difference or null if not found
 */
export function getMinBoundDifference(graphSettings) {
  return graphSettings?.minBoundDifference ?? null;
}

/**
 * Get the maximum bound difference
 * @param {Object} graphSettings - Graph settings object
 * @returns {number|null} Maximum bound difference or null if not found
 */
export function getMaxBoundDifference(graphSettings) {
  return graphSettings?.maxBoundDifference ?? null;
}

/**
 * Check if grid is visible
 * @param {Object} graphSettings - Graph settings object
 * @returns {boolean} True if grid is visible, false otherwise
 */
export function isGridVisible(graphSettings) {
  return graphSettings?.showGrid ?? false;
}

/**
 * Check if axes are visible
 * @param {Object} graphSettings - Graph settings object
 * @returns {boolean} True if axes are visible, false otherwise
 */
export function areAxesVisible(graphSettings) {
  return graphSettings?.showAxes ?? false;
}

/**
 * Get the grid color
 * @param {Object} graphSettings - Graph settings object
 * @returns {string|null} Grid color or null if not found
 */
export function getGridColor(graphSettings) {
  return graphSettings?.gridColor ?? null;
}

// =============================
// Validation Utilities
// =============================

/**
 * Validate a function definition object
 * @param {Object} functionDef - Function definition to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidFunctionDefinition(functionDef) {
  if (!functionDef || typeof functionDef !== 'object') return false;
  
  const requiredFields = ['id', 'functionName', 'type', 'functionString', 'isActive'];
  return requiredFields.every(field => functionDef.hasOwnProperty(field));
}

/**
 * Validate graph settings object
 * @param {Object} graphSettings - Graph settings to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidGraphSettings(graphSettings) {
  if (!graphSettings || typeof graphSettings !== 'object') return false;
  
  const requiredFields = ['defaultView', 'minBoundDifference', 'maxBoundDifference', 'showGrid', 'showAxes'];
  return requiredFields.every(field => graphSettings.hasOwnProperty(field));
}

// =============================
// Advanced Utilities
// =============================

/**
 * Get all unique function types
 * @param {Array} functionDefinitions - Array of function definitions
 * @returns {Array} Array of unique function types
 */
export function getUniqueFunctionTypes(functionDefinitions) {
  if (!functionDefinitions) return [];
  const types = functionDefinitions.map(func => func.type);
  return [...new Set(types)];
}

/**
 * Get all unique instruments
 * @param {Array} functionDefinitions - Array of function definitions
 * @returns {Array} Array of unique instruments
 */
export function getUniqueInstruments(functionDefinitions) {
  if (!functionDefinitions) return [];
  const instruments = functionDefinitions.map(func => func.instrument);
  return [...new Set(instruments)];
}

/**
 * Get function index by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID to search for
 * @returns {number} Index of function or -1 if not found
 */
export function getFunctionIndexById(functionDefinitions, id) {
  return functionDefinitions?.findIndex(func => func.id === id) ?? -1;
}

/**
 * Check if a function has points of interest
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {boolean} True if function has points of interest
 */
export function hasFunctionPointsOfInterest(functionDefinitions, n) {
  const points = getPointsOfInterestN(functionDefinitions, n);
  return points.length > 0;
}

/**
 * Check if a function has landmarks
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {boolean} True if function has landmarks
 */
export function hasFunctionLandmarks(functionDefinitions, n) {
  const landmarks = getLandmarksN(functionDefinitions, n);
  return landmarks.length > 0;
}

// =============================
// Function Management
// =============================

/**
 * Add a new function to the function definitions
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {Object} functionDef - Function definition object to add
 * @returns {Array} New array with the added function
 */
export function addFunction(functionDefinitions, functionDef) {
  if (!functionDefinitions) return [functionDef];
  return [...functionDefinitions, functionDef];
}

/**
 * Remove a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID to remove
 * @returns {Array} New array without the specified function
 */
export function removeFunction(functionDefinitions, id) {
  if (!functionDefinitions) return [];
  return functionDefinitions.filter(func => func.id !== id);
}

/**
 * Remove the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based) to remove
 * @returns {Array} New array without the nth function
 */
export function removeFunctionN(functionDefinitions, n) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  return functionDefinitions.filter((_, index) => index !== n);
}

/**
 * Update a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID to update
 * @param {Object} updates - Object containing the updates
 * @returns {Array} New array with the updated function
 */
export function updateFunction(functionDefinitions, id, updates) {
  if (!functionDefinitions) return [];
  return functionDefinitions.map(func => 
    func.id === id ? { ...func, ...updates } : func
  );
}

/**
 * Update the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based) to update
 * @param {Object} updates - Object containing the updates
 * @returns {Array} New array with the updated function
 */
export function updateFunctionN(functionDefinitions, n, updates) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  return functionDefinitions.map((func, index) => 
    index === n ? { ...func, ...updates } : func
  );
}

/**
 * Duplicate a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID to duplicate
 * @returns {Array} New array with the duplicated function
 */
export function duplicateFunction(functionDefinitions, id) {
  const func = getFunctionById(functionDefinitions, id);
  if (!func) return functionDefinitions ?? [];
  
  const newId = generateUniqueId(functionDefinitions, func.id);
  const duplicatedFunc = { 
    ...func, 
    id: newId, 
    functionName: `${func.functionName} (Copy)`,
    isActive: false
  };
  
  return addFunction(functionDefinitions, duplicatedFunc);
}

/**
 * Duplicate the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based) to duplicate
 * @returns {Array} New array with the duplicated function
 */
export function duplicateFunctionN(functionDefinitions, n) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  const newId = generateUniqueId(functionDefinitions, func.id);
  const duplicatedFunc = { 
    ...func, 
    id: newId, 
    functionName: `${func.functionName} (Copy)`,
    isActive: false
  };
  
  return addFunction(functionDefinitions, duplicatedFunc);
}

// =============================
// Function Properties
// =============================

/**
 * Set the active status of a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID
 * @param {boolean} isActive - New active status
 * @returns {Array} New array with updated function
 */
export function setFunctionActive(functionDefinitions, id, isActive) {
  return updateFunction(functionDefinitions, id, { isActive });
}

/**
 * Set the active status of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {boolean} isActive - New active status
 * @returns {Array} New array with updated function
 */
export function setFunctionActiveN(functionDefinitions, n, isActive) {
  return updateFunctionN(functionDefinitions, n, { isActive });
}

/**
 * Toggle the active status of a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID
 * @returns {Array} New array with updated function
 */
export function toggleFunctionActive(functionDefinitions, id) {
  const func = getFunctionById(functionDefinitions, id);
  if (!func) return functionDefinitions ?? [];
  return setFunctionActive(functionDefinitions, id, !func.isActive);
}

/**
 * Toggle the active status of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @returns {Array} New array with updated function
 */
export function toggleFunctionActiveN(functionDefinitions, n) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  const func = functionDefinitions[n];
  return setFunctionActiveN(functionDefinitions, n, !func.isActive);
}

/**
 * Set the function string of a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID
 * @param {string} functionString - New function string
 * @returns {Array} New array with updated function
 */
export function setFunctionString(functionDefinitions, id, functionString) {
  return updateFunction(functionDefinitions, id, { functionString });
}

/**
 * Set the function string of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {string} functionString - New function string
 * @returns {Array} New array with updated function
 */
export function setFunctionStringN(functionDefinitions, n, functionString) {
  return updateFunctionN(functionDefinitions, n, { functionString });
}

/**
 * Set the name of a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID
 * @param {string} name - New function name
 * @returns {Array} New array with updated function
 */
export function setFunctionName(functionDefinitions, id, name) {
  return updateFunction(functionDefinitions, id, { functionName: name });
}

/**
 * Set the name of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {string} name - New function name
 * @returns {Array} New array with updated function
 */
export function setFunctionNameN(functionDefinitions, n, name) {
  return updateFunctionN(functionDefinitions, n, { functionName: name });
}

/**
 * Set the color of a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID
 * @param {string} color - New color
 * @returns {Array} New array with updated function
 */
export function setFunctionColor(functionDefinitions, id, color) {
  return updateFunction(functionDefinitions, id, { color });
}

/**
 * Set the color of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {string} color - New color
 * @returns {Array} New array with updated function
 */
export function setFunctionColorN(functionDefinitions, n, color) {
  return updateFunctionN(functionDefinitions, n, { color });
}

/**
 * Set the instrument of a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} id - Function ID
 * @param {string} instrument - New instrument
 * @returns {Array} New array with updated function
 */
export function setFunctionInstrument(functionDefinitions, id, instrument) {
  return updateFunction(functionDefinitions, id, { instrument });
}

/**
 * Set the instrument of the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {string} instrument - New instrument
 * @returns {Array} New array with updated function
 */
export function setFunctionInstrumentN(functionDefinitions, n, instrument) {
  return updateFunctionN(functionDefinitions, n, { instrument });
}

// =============================
// Points of Interest Management
// =============================

/**
 * Add a point of interest to a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} functionId - Function ID
 * @param {Object} point - Point of interest object
 * @returns {Array} New array with updated function
 */
export function addPointOfInterest(functionDefinitions, functionId, point) {
  const func = getFunctionById(functionDefinitions, functionId);
  if (!func) return functionDefinitions ?? [];
  
  const updatedPoints = [...(func.pointOfInterests || []), point];
  return updateFunction(functionDefinitions, functionId, { pointOfInterests: updatedPoints });
}

/**
 * Add a point of interest to the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {Object} point - Point of interest object
 * @returns {Array} New array with updated function
 */
export function addPointOfInterestN(functionDefinitions, n, point) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  const updatedPoints = [...(func.pointOfInterests || []), point];
  return updateFunctionN(functionDefinitions, n, { pointOfInterests: updatedPoints });
}

/**
 * Remove a point of interest from a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} functionId - Function ID
 * @param {number} pointIndex - Index of point to remove
 * @returns {Array} New array with updated function
 */
export function removePointOfInterest(functionDefinitions, functionId, pointIndex) {
  const func = getFunctionById(functionDefinitions, functionId);
  if (!func || !func.pointOfInterests) return functionDefinitions ?? [];
  
  const updatedPoints = func.pointOfInterests.filter((_, index) => index !== pointIndex);
  return updateFunction(functionDefinitions, functionId, { pointOfInterests: updatedPoints });
}

/**
 * Remove a point of interest from the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {number} pointIndex - Index of point to remove
 * @returns {Array} New array with updated function
 */
export function removePointOfInterestN(functionDefinitions, n, pointIndex) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  if (!func.pointOfInterests) return functionDefinitions;
  
  const updatedPoints = func.pointOfInterests.filter((_, index) => index !== pointIndex);
  return updateFunctionN(functionDefinitions, n, { pointOfInterests: updatedPoints });
}

/**
 * Update a point of interest in a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} functionId - Function ID
 * @param {number} pointIndex - Index of point to update
 * @param {Object} updates - Updates to apply
 * @returns {Array} New array with updated function
 */
export function updatePointOfInterest(functionDefinitions, functionId, pointIndex, updates) {
  const func = getFunctionById(functionDefinitions, functionId);
  if (!func || !func.pointOfInterests || pointIndex < 0 || pointIndex >= func.pointOfInterests.length) {
    return functionDefinitions ?? [];
  }
  
  const updatedPoints = func.pointOfInterests.map((point, index) => 
    index === pointIndex ? { ...point, ...updates } : point
  );
  return updateFunction(functionDefinitions, functionId, { pointOfInterests: updatedPoints });
}

/**
 * Update a point of interest in the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {number} pointIndex - Index of point to update
 * @param {Object} updates - Updates to apply
 * @returns {Array} New array with updated function
 */
export function updatePointOfInterestN(functionDefinitions, n, pointIndex, updates) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  if (!func.pointOfInterests || pointIndex < 0 || pointIndex >= func.pointOfInterests.length) {
    return functionDefinitions;
  }
  
  const updatedPoints = func.pointOfInterests.map((point, index) => 
    index === pointIndex ? { ...point, ...updates } : point
  );
  return updateFunctionN(functionDefinitions, n, { pointOfInterests: updatedPoints });
}

// =============================
// Landmarks Management
// =============================

/**
 * Add a landmark to a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} functionId - Function ID
 * @param {Object} landmark - Landmark object
 * @returns {Array} New array with updated function
 */
export function addLandmark(functionDefinitions, functionId, landmark) {
  const func = getFunctionById(functionDefinitions, functionId);
  if (!func) return functionDefinitions ?? [];
  
  const updatedLandmarks = [...(func.landmarks || []), landmark];
  return updateFunction(functionDefinitions, functionId, { landmarks: updatedLandmarks });
}

/**
 * Add a landmark to the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {Object} landmark - Landmark object
 * @returns {Array} New array with updated function
 */
export function addLandmarkN(functionDefinitions, n, landmark) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  const updatedLandmarks = [...(func.landmarks || []), landmark];
  return updateFunctionN(functionDefinitions, n, { landmarks: updatedLandmarks });
}

/**
 * Remove a landmark from a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} functionId - Function ID
 * @param {number} landmarkIndex - Index of landmark to remove
 * @returns {Array} New array with updated function
 */
export function removeLandmark(functionDefinitions, functionId, landmarkIndex) {
  const func = getFunctionById(functionDefinitions, functionId);
  if (!func || !func.landmarks) return functionDefinitions ?? [];
  
  const updatedLandmarks = func.landmarks.filter((_, index) => index !== landmarkIndex);
  return updateFunction(functionDefinitions, functionId, { landmarks: updatedLandmarks });
}

/**
 * Remove a landmark from the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {number} landmarkIndex - Index of landmark to remove
 * @returns {Array} New array with updated function
 */
export function removeLandmarkN(functionDefinitions, n, landmarkIndex) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  if (!func.landmarks) return functionDefinitions;
  
  const updatedLandmarks = func.landmarks.filter((_, index) => index !== landmarkIndex);
  return updateFunctionN(functionDefinitions, n, { landmarks: updatedLandmarks });
}

/**
 * Update a landmark in a function by ID
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} functionId - Function ID
 * @param {number} landmarkIndex - Index of landmark to update
 * @param {Object} updates - Updates to apply
 * @returns {Array} New array with updated function
 */
export function updateLandmark(functionDefinitions, functionId, landmarkIndex, updates) {
  const func = getFunctionById(functionDefinitions, functionId);
  if (!func || !func.landmarks || landmarkIndex < 0 || landmarkIndex >= func.landmarks.length) {
    return functionDefinitions ?? [];
  }
  
  const updatedLandmarks = func.landmarks.map((landmark, index) => 
    index === landmarkIndex ? { ...landmark, ...updates } : landmark
  );
  return updateFunction(functionDefinitions, functionId, { landmarks: updatedLandmarks });
}

/**
 * Update a landmark in the nth function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} n - Function index (0-based)
 * @param {number} landmarkIndex - Index of landmark to update
 * @param {Object} updates - Updates to apply
 * @returns {Array} New array with updated function
 */
export function updateLandmarkN(functionDefinitions, n, landmarkIndex, updates) {
  if (!functionDefinitions || n < 0 || n >= functionDefinitions.length) return functionDefinitions ?? [];
  
  const func = functionDefinitions[n];
  if (!func.landmarks || landmarkIndex < 0 || landmarkIndex >= func.landmarks.length) {
    return functionDefinitions;
  }
  
  const updatedLandmarks = func.landmarks.map((landmark, index) => 
    index === landmarkIndex ? { ...landmark, ...updates } : landmark
  );
  return updateFunctionN(functionDefinitions, n, { landmarks: updatedLandmarks });
}

// =============================
// Graph Settings Management
// =============================

/**
 * Update graph settings
 * @param {Object} graphSettings - Current graph settings
 * @param {Object} updates - Updates to apply
 * @returns {Object} New graph settings object
 */
export function updateGraphSettings(graphSettings, updates) {
  return { ...(graphSettings || {}), ...updates };
}

/**
 * Set the default view
 * @param {Object} graphSettings - Current graph settings
 * @param {Array} view - Default view array [xMin, xMax, yMax, yMin]
 * @returns {Object} New graph settings object
 */
export function setDefaultView(graphSettings, view) {
  return updateGraphSettings(graphSettings, { defaultView: view });
}

/**
 * Set grid visibility
 * @param {Object} graphSettings - Current graph settings
 * @param {boolean} visible - Grid visibility
 * @returns {Object} New graph settings object
 */
export function setGridVisibility(graphSettings, visible) {
  return updateGraphSettings(graphSettings, { showGrid: visible });
}

/**
 * Set axes visibility
 * @param {Object} graphSettings - Current graph settings
 * @param {boolean} visible - Axes visibility
 * @returns {Object} New graph settings object
 */
export function setAxesVisibility(graphSettings, visible) {
  return updateGraphSettings(graphSettings, { showAxes: visible });
}

/**
 * Set grid color
 * @param {Object} graphSettings - Current graph settings
 * @param {string} color - Grid color
 * @returns {Object} New graph settings object
 */
export function setGridColor(graphSettings, color) {
  return updateGraphSettings(graphSettings, { gridColor: color });
}

/**
 * Set bound differences
 * @param {Object} graphSettings - Current graph settings
 * @param {number} min - Minimum bound difference
 * @param {number} max - Maximum bound difference
 * @returns {Object} New graph settings object
 */
export function setBoundDifferences(graphSettings, min, max) {
  return updateGraphSettings(graphSettings, { 
    minBoundDifference: min, 
    maxBoundDifference: max 
  });
}

// =============================
// Utility Functions
// =============================

/**
 * Create a new function definition
 * @param {string} id - Function ID
 * @param {string} name - Function name
 * @param {string} functionString - Function string
 * @param {string} type - Function type
 * @param {Object} options - Optional properties
 * @returns {Object} New function definition object
 */
export function createFunction(id, name, functionString, type = "function", options = {}) {
  return {
    id,
    functionName: name,
    type,
    functionString,
    isActive: options.isActive ?? true,
    instrument: options.instrument || "clarinet",
    color: options.color || "#0000FF",
    pointOfInterests: options.pointOfInterests || [],
    landmarks: options.landmarks || [],
    ...options
  };
}

/**
 * Create a new point of interest
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} type - Point type
 * @param {Object} options - Optional properties
 * @returns {Object} New point of interest object
 */
export function createPointOfInterest(x, y, type = "isolated", options = {}) {
  return {
    x,
    y,
    type,
    label: options.label,
    color: options.color,
    earcon: options.earcon,
    ...options
  };
}

/**
 * Create a new landmark
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} options - Optional properties
 * @returns {Object} New landmark object
 */
export function createLandmark(x, y, options = {}) {
  return {
    x,
    y,
    label: options.label,
    color: options.color,
    earcon: options.earcon,
    message: options.message,
    shortcut: options.shortcut,
    ...options
  };
}

/**
 * Generate a unique ID for a function
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateUniqueId(functionDefinitions, prefix = "f") {
  if (!functionDefinitions) return `${prefix}1`;
  
  const existingIds = functionDefinitions.map(func => func.id);
  let counter = 1;
  let newId = `${prefix}${counter}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${prefix}${counter}`;
  }
  
  return newId;
}

/**
 * Reorder functions in the array
 * @param {Array} functionDefinitions - Array of function definitions
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Target index
 * @returns {Array} New array with reordered functions
 */
export function reorderFunctions(functionDefinitions, fromIndex, toIndex) {
  if (!functionDefinitions || fromIndex < 0 || toIndex < 0 || 
      fromIndex >= functionDefinitions.length || toIndex >= functionDefinitions.length) {
    return functionDefinitions ?? [];
  }
  
  const newArray = [...functionDefinitions];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  
  return newArray;
}