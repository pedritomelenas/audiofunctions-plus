import * as ops from '../src/utils/graphObjectOperations.js';

// Extended test data - covering more edge cases
const sampleFunctionDefinitions = [
  {
    id: 'f1',
    functionName: 'Linear Function',
    type: 'linear',
    functionString: 'x + 2',
    isActive: true,
    instrument: 'guitar',
    color: '#FF0000',
    pointOfInterests: [{ x: 0, y: 2, type: 'isolated' }],
    landmarks: [{ x: 1, y: 3, label: 'Point A' }]
  },
  {
    id: 'f2',
    functionName: 'Quadratic Function',
    type: 'quadratic',
    functionString: 'x^2',
    isActive: false,
    instrument: 'piano',
    color: '#00FF00',
    pointOfInterests: [],
    landmarks: []
  },
  {
    id: 'f3',
    functionName: 'Sine Wave',
    type: 'trigonometric',
    functionString: 'sin(x)',
    isActive: true,
    instrument: 'violin',
    color: '#0000FF',
    pointOfInterests: [
      { x: 0, y: 0, type: 'root' },
      { x: Math.PI/2, y: 1, type: 'maximum' },
      { x: Math.PI, y: 0, type: 'root' }
    ],
    landmarks: [
      { x: 0, y: 0, label: 'Origin' },
      { x: Math.PI, y: 0, label: 'Pi Point' }
    ]
  },
  {
    id: 'f4',
    functionName: 'Empty Function',
    type: 'custom',
    functionString: '',
    isActive: false,
    instrument: 'guitar',
    color: '#FFFF00',
    pointOfInterests: null,
    landmarks: undefined
  },
  {
    id: 'f5',
    functionName: 'Complex Function',
    type: 'polynomial',
    functionString: 'x^3 - 2x^2 + x - 1',
    isActive: true,
    instrument: 'drums',
    color: '#FF00FF',
    pointOfInterests: [
      { x: -1, y: -5, type: 'minimum' },
      { x: 0, y: -1, type: 'isolated' },
      { x: 1, y: -1, type: 'inflection' },
      { x: 2, y: 1, type: 'maximum' }
    ],
    landmarks: [
      { x: 0, y: -1, label: 'Y-Intercept' },
      { x: 1, y: -1, label: 'Critical Point' },
      { x: 2, y: 1, label: 'Local Max' }
    ]
  }
];

// Additional test data for falsy value edge cases
const falsyValueFunctions = [
  {
    id: 'falsy1',
    functionName: '', // VALID - empty string allowed for functionName
    type: 'linear', // NOT empty - type must have value
    functionString: '', // VALID - empty string allowed for functionString
    isActive: true,
    instrument: 'guitar', // NOT empty - instrument must have value
    color: '', // VALID - empty string allowed for color
    pointOfInterests: [
      { 
        x: 0, 
        y: 0, 
        type: 'root', // NOT empty - type must have value
        label: '', // VALID - empty string allowed for label
        color: '', // VALID - empty string allowed for color
        earcon: '' // VALID - empty string allowed for earcon
      }
    ],
    landmarks: [
      {
        x: 0,
        y: 0,
        label: '', // VALID - empty string allowed for label
        color: '', // VALID - empty string allowed for color
        message: '' // VALID - empty string allowed for message
      }
    ]
  },
  {
    id: 'falsy2',
    functionName: 'Valid Function',
    type: 'quadratic',
    functionString: '0', // VALID - zero as string for functionString
    isActive: false, // boolean false is valid
    instrument: 'piano',
    color: '#000000', // black color (not empty)
    pointOfInterests: [
      { 
        x: 0, 
        y: 0, 
        type: 'minimum'
      }
    ],
    landmarks: []
  },
  {
    id: 'falsy3',
    functionName: 'Zero Function',
    type: 'constant',
    functionString: 'x', 
    isActive: true,
    instrument: 'violin',
    color: '',
    pointOfInterests: [],
    landmarks: []
  }
];

// Additional test data matching initGraphObject structure
const initGraphObjectFunctions = [
  {
    "id": "f1",
    "functionName": "Function 1",
    "type": "function",
    "functionString": "sin(x)",
    "isActive": true,
    "instrument": "guitar",
    "color": "#0000FF",
    "pointOfInterests": [
      {
        "x": 10,
        "y": 10,
        "type": "isolated",
        "label": "iso 1",
        "color": "#FF0000",
        "earcon": "earcon 1"
      }
    ],
    "landmarks": [
      {
        "x": 0,
        "y": 0,
        "label": "landmark",
        "color": "#FF0000",
        "earcon": "earcon2",
        "message": "user defined message",
        "shortcut": "a"
      }
    ]
  },
  {
    "id": "f2",
    "functionName": "Pieces",
    "type": "piecewise_function",
    "functionString": "[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]",
    "isActive": false,
    "instrument": "clarinet",
    "color": "#FF0000",
    "pointOfInterests": [],
    "landmarks": []
  }
];

// Test data with missing optional fields (not just empty)
const functionsWithMissingOptionalFields = [
  {
    "id": "missing1",
    "functionName": "Minimal Function",
    "type": "function",
    "functionString": "x^2",
    "isActive": true,
    "instrument": "guitar"
    // Missing: color, pointOfInterests, landmarks
  },
  {
    "id": "missing2",
    "functionName": "Another Function",
    "type": "linear",
    "functionString": "2*x",
    "isActive": false,
    "instrument": "piano",
    "pointOfInterests": [
      {
        "x": 1,
        "y": 2,
        "type": "maximum"
        // Missing: label, color, earcon
      }
    ],
    "landmarks": [
      {
        "x": 5,
        "y": 10
        // Missing: label, color, earcon, message, shortcut
      }
    ]
  }
];

const sampleGraphSettings = {
  defaultView: [-10, 10, 10, -10],
  minBoundDifference: 0.1,
  maxBoundDifference: 100,
  showGrid: true,
  showAxes: true,
  gridColor: '#CCCCCC'
};

const emptyGraphSettings = {};
const invalidGraphSettings = {
  defaultView: [-5, 5, 5, -5],
  showGrid: false
  // missing required fields
};

// Simple test runner
let testCount = 0;
let passedTests = 0;

function test(name, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function assertEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
  }
}

function assertTrue(value, message = '') {
  if (!value) {
    throw new Error(`Expected true, got ${value}. ${message}`);
  }
}

function assertFalse(value, message = '') {
  if (value) {
    throw new Error(`Expected false, got ${value}. ${message}`);
  }
}

// =============================
// BASIC FUNCTION ACCESSOR TESTS
// =============================

// Tests für getFunctionStringN
test('getFunctionStringN - valid index', () => {
  assertEqual(ops.getFunctionStringN(sampleFunctionDefinitions, 0), 'x + 2');
  assertEqual(ops.getFunctionStringN(sampleFunctionDefinitions, 1), 'x^2');
  assertEqual(ops.getFunctionStringN(sampleFunctionDefinitions, 3), '');
});

test('getFunctionStringN - invalid index', () => {
  assertEqual(ops.getFunctionStringN(sampleFunctionDefinitions, 5), null);
  assertEqual(ops.getFunctionStringN(sampleFunctionDefinitions, -1), null);
  assertEqual(ops.getFunctionStringN(sampleFunctionDefinitions, 100), null);
});

test('getFunctionStringN - edge cases', () => {
  assertEqual(ops.getFunctionStringN(null, 0), null);
  assertEqual(ops.getFunctionStringN(undefined, 0), null);
  assertEqual(ops.getFunctionStringN([], 0), null);
});

// Tests für getFunctionNameN
test('getFunctionNameN - valid index', () => {
  assertEqual(ops.getFunctionNameN(sampleFunctionDefinitions, 0), 'Linear Function');
  assertEqual(ops.getFunctionNameN(sampleFunctionDefinitions, 2), 'Sine Wave');
  assertEqual(ops.getFunctionNameN(sampleFunctionDefinitions, 4), 'Complex Function');
});

test('getFunctionNameN - invalid index', () => {
  assertEqual(ops.getFunctionNameN(sampleFunctionDefinitions, 10), null);
  assertEqual(ops.getFunctionNameN(sampleFunctionDefinitions, -5), null);
  assertEqual(ops.getFunctionNameN(sampleFunctionDefinitions, 999), null);
});

test('getFunctionNameN - edge cases', () => {
  assertEqual(ops.getFunctionNameN(null, 0), null);
  assertEqual(ops.getFunctionNameN([], 0), null);
  assertEqual(ops.getFunctionNameN(undefined, 0), null);
});

// Tests für getFunctionTypeN
test('getFunctionTypeN - valid index', () => {
  assertEqual(ops.getFunctionTypeN(sampleFunctionDefinitions, 0), 'linear');
  assertEqual(ops.getFunctionTypeN(sampleFunctionDefinitions, 2), 'trigonometric');
  assertEqual(ops.getFunctionTypeN(sampleFunctionDefinitions, 4), 'polynomial');
});

test('getFunctionTypeN - invalid index', () => {
  assertEqual(ops.getFunctionTypeN(sampleFunctionDefinitions, 99), null);
  assertEqual(ops.getFunctionTypeN(sampleFunctionDefinitions, -10), null);
  assertEqual(ops.getFunctionTypeN(sampleFunctionDefinitions, 50), null);
});

test('getFunctionTypeN - edge cases', () => {
  assertEqual(ops.getFunctionTypeN(null, 0), null);
  assertEqual(ops.getFunctionTypeN([], 1), null);
  assertEqual(ops.getFunctionTypeN(undefined, 0), null);
});

// Tests für getFunctionColorN
test('getFunctionColorN - valid index', () => {
  assertEqual(ops.getFunctionColorN(sampleFunctionDefinitions, 0), '#FF0000');
  assertEqual(ops.getFunctionColorN(sampleFunctionDefinitions, 2), '#0000FF');
  assertEqual(ops.getFunctionColorN(sampleFunctionDefinitions, 4), '#FF00FF');
});

test('getFunctionColorN - invalid index', () => {
  assertEqual(ops.getFunctionColorN(sampleFunctionDefinitions, 100), null);
  assertEqual(ops.getFunctionColorN(sampleFunctionDefinitions, -1), null);
  assertEqual(ops.getFunctionColorN(sampleFunctionDefinitions, 20), null);
});

test('getFunctionColorN - edge cases', () => {
  assertEqual(ops.getFunctionColorN(null, 0), null);
  assertEqual(ops.getFunctionColorN([], 0), null);
  assertEqual(ops.getFunctionColorN(undefined, 1), null);
});

// Tests für getFunctionInstrumentN
test('getFunctionInstrumentN - valid index', () => {
  assertEqual(ops.getFunctionInstrumentN(sampleFunctionDefinitions, 0), 'guitar');
  assertEqual(ops.getFunctionInstrumentN(sampleFunctionDefinitions, 2), 'violin');
  assertEqual(ops.getFunctionInstrumentN(sampleFunctionDefinitions, 4), 'drums');
});

test('getFunctionInstrumentN - invalid index', () => {
  assertEqual(ops.getFunctionInstrumentN(sampleFunctionDefinitions, 50), null);
  assertEqual(ops.getFunctionInstrumentN(sampleFunctionDefinitions, -2), null);
  assertEqual(ops.getFunctionInstrumentN(sampleFunctionDefinitions, 15), null);
});

test('getFunctionInstrumentN - edge cases', () => {
  assertEqual(ops.getFunctionInstrumentN(null, 0), null);
  assertEqual(ops.getFunctionInstrumentN([], 0), null);
  assertEqual(ops.getFunctionInstrumentN(undefined, 0), null);
});

// Tests für isFunctionActiveN
test('isFunctionActiveN - valid index', () => {
  assertTrue(ops.isFunctionActiveN(sampleFunctionDefinitions, 0));
  assertFalse(ops.isFunctionActiveN(sampleFunctionDefinitions, 1));
  assertTrue(ops.isFunctionActiveN(sampleFunctionDefinitions, 2));
});

test('isFunctionActiveN - invalid index', () => {
  assertFalse(ops.isFunctionActiveN(sampleFunctionDefinitions, 20));
  assertFalse(ops.isFunctionActiveN(sampleFunctionDefinitions, -3));
  assertFalse(ops.isFunctionActiveN(sampleFunctionDefinitions, 100));
});

test('isFunctionActiveN - edge cases', () => {
  assertFalse(ops.isFunctionActiveN(null, 0));
  assertFalse(ops.isFunctionActiveN([], 0));
  assertFalse(ops.isFunctionActiveN(undefined, 0));
});

// =============================
// FUNCTION FILTERING AND SEARCH TESTS
// =============================

// Tests für getActiveFunctions
test('getActiveFunctions - normal case', () => {
  const active = ops.getActiveFunctions(sampleFunctionDefinitions);
  assertEqual(active.length, 3);
  assertTrue(active.every(f => f.isActive));
});

test('getActiveFunctions - no active functions', () => {
  const noActiveFunctions = sampleFunctionDefinitions.map(f => ({...f, isActive: false}));
  assertEqual(ops.getActiveFunctions(noActiveFunctions), []);
});

test('getActiveFunctions - edge cases', () => {
  assertEqual(ops.getActiveFunctions(null), []);
  assertEqual(ops.getActiveFunctions([]), []);
  assertEqual(ops.getActiveFunctions(undefined), []);
});

// Tests für getInactiveFunctions
test('getInactiveFunctions - normal case', () => {
  const inactive = ops.getInactiveFunctions(sampleFunctionDefinitions);
  assertEqual(inactive.length, 2);
  assertTrue(inactive.every(f => !f.isActive));
});

test('getInactiveFunctions - all active functions', () => {
  const allActiveFunctions = sampleFunctionDefinitions.map(f => ({...f, isActive: true}));
  assertEqual(ops.getInactiveFunctions(allActiveFunctions), []);
});

test('getInactiveFunctions - edge cases', () => {
  assertEqual(ops.getInactiveFunctions(null), []);
  assertEqual(ops.getInactiveFunctions([]), []);
  assertEqual(ops.getInactiveFunctions(undefined), []);
});

// Tests für getFunctionById
test('getFunctionById - existing ID', () => {
  const func = ops.getFunctionById(sampleFunctionDefinitions, 'f1');
  assertEqual(func.functionName, 'Linear Function');
  const func3 = ops.getFunctionById(sampleFunctionDefinitions, 'f3');
  assertEqual(func3.functionName, 'Sine Wave');
});

test('getFunctionById - non-existing ID', () => {
  assertEqual(ops.getFunctionById(sampleFunctionDefinitions, 'nonexistent'), null);
  assertEqual(ops.getFunctionById(sampleFunctionDefinitions, 'f99'), null);
  assertEqual(ops.getFunctionById(sampleFunctionDefinitions, ''), null);
});

test('getFunctionById - edge cases', () => {
  assertEqual(ops.getFunctionById(null, 'f1'), null);
  assertEqual(ops.getFunctionById([], 'f1'), null);
  assertEqual(ops.getFunctionById(undefined, 'f1'), null);
});

// Tests für getFunctionCount
test('getFunctionCount - normal case', () => {
  assertEqual(ops.getFunctionCount(sampleFunctionDefinitions), 5);
  assertEqual(ops.getFunctionCount([sampleFunctionDefinitions[0]]), 1);
});

test('getFunctionCount - empty array', () => {
  assertEqual(ops.getFunctionCount([]), 0);
});

test('getFunctionCount - edge cases', () => {
  assertEqual(ops.getFunctionCount(null), 0);
  assertEqual(ops.getFunctionCount(undefined), 0);
});

// Tests für getFunctionsByType
test('getFunctionsByType - existing type', () => {
  const linearFuncs = ops.getFunctionsByType(sampleFunctionDefinitions, 'linear');
  assertEqual(linearFuncs.length, 1);
  assertEqual(linearFuncs[0].id, 'f1');
});

test('getFunctionsByType - non-existing type', () => {
  assertEqual(ops.getFunctionsByType(sampleFunctionDefinitions, 'exponential'), []);
  assertEqual(ops.getFunctionsByType(sampleFunctionDefinitions, 'unknown'), []);
});

test('getFunctionsByType - edge cases', () => {
  assertEqual(ops.getFunctionsByType(null, 'linear'), []);
  assertEqual(ops.getFunctionsByType(undefined, 'linear'), []);
  assertEqual(ops.getFunctionsByType([], 'linear'), []);
});

// Tests für getFunctionsByInstrument
test('getFunctionsByInstrument - existing instrument', () => {
  const guitarFuncs = ops.getFunctionsByInstrument(sampleFunctionDefinitions, 'guitar');
  assertEqual(guitarFuncs.length, 2);
  assertTrue(guitarFuncs.every(f => f.instrument === 'guitar'));
});

test('getFunctionsByInstrument - non-existing instrument', () => {
  assertEqual(ops.getFunctionsByInstrument(sampleFunctionDefinitions, 'flute'), []);
  assertEqual(ops.getFunctionsByInstrument(sampleFunctionDefinitions, 'unknown'), []);
});

test('getFunctionsByInstrument - edge cases', () => {
  assertEqual(ops.getFunctionsByInstrument(null, 'guitar'), []);
  assertEqual(ops.getFunctionsByInstrument(undefined, 'guitar'), []);
  assertEqual(ops.getFunctionsByInstrument([], 'guitar'), []);
});

// Tests für getUniqueFunctionTypes
test('getUniqueFunctionTypes - normal case', () => {
  const types = ops.getUniqueFunctionTypes(sampleFunctionDefinitions);
  assertTrue(types.includes('linear'));
  assertTrue(types.includes('quadratic'));
  assertTrue(types.includes('trigonometric'));
  assertEqual(types.length, 5);
});

test('getUniqueFunctionTypes - empty array', () => {
  assertEqual(ops.getUniqueFunctionTypes([]), []);
});

test('getUniqueFunctionTypes - edge cases', () => {
  assertEqual(ops.getUniqueFunctionTypes(null), []);
  assertEqual(ops.getUniqueFunctionTypes(undefined), []);
});

// Tests für getUniqueInstruments
test('getUniqueInstruments - normal case', () => {
  const instruments = ops.getUniqueInstruments(sampleFunctionDefinitions);
  assertTrue(instruments.includes('guitar'));
  assertTrue(instruments.includes('piano'));
  assertTrue(instruments.includes('violin'));
  assertEqual(instruments.length, 4);
});

test('getUniqueInstruments - empty array', () => {
  assertEqual(ops.getUniqueInstruments([]), []);
});

test('getUniqueInstruments - edge cases', () => {
  assertEqual(ops.getUniqueInstruments(null), []);
  assertEqual(ops.getUniqueInstruments(undefined), []);
});

// Tests für getFunctionIndexById
test('getFunctionIndexById - existing ID', () => {
  assertEqual(ops.getFunctionIndexById(sampleFunctionDefinitions, 'f1'), 0);
  assertEqual(ops.getFunctionIndexById(sampleFunctionDefinitions, 'f3'), 2);
  assertEqual(ops.getFunctionIndexById(sampleFunctionDefinitions, 'f5'), 4);
});

test('getFunctionIndexById - non-existing ID', () => {
  assertEqual(ops.getFunctionIndexById(sampleFunctionDefinitions, 'nonexistent'), -1);
  assertEqual(ops.getFunctionIndexById(sampleFunctionDefinitions, 'f99'), -1);
});

test('getFunctionIndexById - edge cases', () => {
  assertEqual(ops.getFunctionIndexById(null, 'f1'), -1);
  assertEqual(ops.getFunctionIndexById(undefined, 'f1'), -1);
  assertEqual(ops.getFunctionIndexById([], 'f1'), -1);
});

// =============================
// POINTS OF INTEREST AND LANDMARKS TESTS
// =============================

// Tests für getPointsOfInterestN
test('getPointsOfInterestN - valid index with points', () => {
  const points = ops.getPointsOfInterestN(sampleFunctionDefinitions, 2);
  assertEqual(points.length, 3);
  assertEqual(points[0].type, 'root');
});

test('getPointsOfInterestN - valid index without points', () => {
  assertEqual(ops.getPointsOfInterestN(sampleFunctionDefinitions, 1), []);
  assertEqual(ops.getPointsOfInterestN(sampleFunctionDefinitions, 3), []);
});

test('getPointsOfInterestN - edge cases', () => {
  assertEqual(ops.getPointsOfInterestN(null, 0), []);
  assertEqual(ops.getPointsOfInterestN(sampleFunctionDefinitions, -1), []);
  assertEqual(ops.getPointsOfInterestN(sampleFunctionDefinitions, 100), []);
});

// Tests für getLandmarksN
test('getLandmarksN - valid index with landmarks', () => {
  const landmarks = ops.getLandmarksN(sampleFunctionDefinitions, 4);
  assertEqual(landmarks.length, 3);
  assertEqual(landmarks[0].label, 'Y-Intercept');
});

test('getLandmarksN - valid index without landmarks', () => {
  assertEqual(ops.getLandmarksN(sampleFunctionDefinitions, 1), []);
  assertEqual(ops.getLandmarksN(sampleFunctionDefinitions, 3), []);
});

test('getLandmarksN - edge cases', () => {
  assertEqual(ops.getLandmarksN(null, 0), []);
  assertEqual(ops.getLandmarksN(sampleFunctionDefinitions, -1), []);
  assertEqual(ops.getLandmarksN(sampleFunctionDefinitions, 50), []);
});

// Tests für hasFunctionPointsOfInterest
test('hasFunctionPointsOfInterest - function with points', () => {
  assertTrue(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, 0));
  assertTrue(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, 2));
  assertTrue(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, 4));
});

test('hasFunctionPointsOfInterest - function without points', () => {
  assertFalse(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, 1));
  assertFalse(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, 3));
});

test('hasFunctionPointsOfInterest - edge cases', () => {
  assertFalse(ops.hasFunctionPointsOfInterest(null, 0));
  assertFalse(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, -1));
  assertFalse(ops.hasFunctionPointsOfInterest(sampleFunctionDefinitions, 100));
});

// Tests für hasFunctionLandmarks
test('hasFunctionLandmarks - function with landmarks', () => {
  assertTrue(ops.hasFunctionLandmarks(sampleFunctionDefinitions, 0));
  assertTrue(ops.hasFunctionLandmarks(sampleFunctionDefinitions, 2));
  assertTrue(ops.hasFunctionLandmarks(sampleFunctionDefinitions, 4));
});

test('hasFunctionLandmarks - function without landmarks', () => {
  assertFalse(ops.hasFunctionLandmarks(sampleFunctionDefinitions, 1));
  assertFalse(ops.hasFunctionLandmarks(sampleFunctionDefinitions, 3));
});

test('hasFunctionLandmarks - edge cases', () => {
  assertFalse(ops.hasFunctionLandmarks(null, 0));
  assertFalse(ops.hasFunctionLandmarks(sampleFunctionDefinitions, -1));
  assertFalse(ops.hasFunctionLandmarks(sampleFunctionDefinitions, 50));
});

// =============================
// GRAPH SETTINGS TESTS
// =============================

// Tests für getDefaultView
test('getDefaultView - valid settings', () => {
  assertEqual(ops.getDefaultView(sampleGraphSettings), [-10, 10, 10, -10]);
});

test('getDefaultView - missing property', () => {
  assertEqual(ops.getDefaultView({}), null);
  assertEqual(ops.getDefaultView(emptyGraphSettings), null);
});

test('getDefaultView - edge cases', () => {
  assertEqual(ops.getDefaultView(null), null);
  assertEqual(ops.getDefaultView(undefined), null);
});

// Tests für getMinBoundDifference
test('getMinBoundDifference - valid settings', () => {
  assertEqual(ops.getMinBoundDifference(sampleGraphSettings), 0.1);
});

test('getMinBoundDifference - missing property', () => {
  assertEqual(ops.getMinBoundDifference({}), null);
});

test('getMinBoundDifference - edge cases', () => {
  assertEqual(ops.getMinBoundDifference(null), null);
  assertEqual(ops.getMinBoundDifference(undefined), null);
});

// Tests für getMaxBoundDifference
test('getMaxBoundDifference - valid settings', () => {
  assertEqual(ops.getMaxBoundDifference(sampleGraphSettings), 100);
});

test('getMaxBoundDifference - missing property', () => {
  assertEqual(ops.getMaxBoundDifference({}), null);
});

test('getMaxBoundDifference - edge cases', () => {
  assertEqual(ops.getMaxBoundDifference(null), null);
  assertEqual(ops.getMaxBoundDifference(undefined), null);
});

// Tests für isGridVisible
test('isGridVisible - valid settings', () => {
  assertTrue(ops.isGridVisible(sampleGraphSettings));
  assertFalse(ops.isGridVisible({showGrid: false}));
});

test('isGridVisible - missing property', () => {
  assertFalse(ops.isGridVisible({}));
});

test('isGridVisible - edge cases', () => {
  assertFalse(ops.isGridVisible(null));
  assertFalse(ops.isGridVisible(undefined));
});

// Tests für areAxesVisible
test('areAxesVisible - valid settings', () => {
  assertTrue(ops.areAxesVisible(sampleGraphSettings));
  assertFalse(ops.areAxesVisible({showAxes: false}));
});

test('areAxesVisible - missing property', () => {
  assertFalse(ops.areAxesVisible({}));
});

test('areAxesVisible - edge cases', () => {
  assertFalse(ops.areAxesVisible(null));
  assertFalse(ops.areAxesVisible(undefined));
});

// Tests für getGridColor
test('getGridColor - valid settings', () => {
  assertEqual(ops.getGridColor(sampleGraphSettings), '#CCCCCC');
});

test('getGridColor - missing property', () => {
  assertEqual(ops.getGridColor({}), null);
});

test('getGridColor - edge cases', () => {
  assertEqual(ops.getGridColor(null), null);
  assertEqual(ops.getGridColor(undefined), null);
});

// =============================
// FUNCTION MANIPULATION TESTS
// =============================

// Tests für updateFunction
test('updateFunction - existing ID', () => {
  const updated = ops.updateFunction(sampleFunctionDefinitions, 'f1', { functionName: 'Updated Function' });
  assertEqual(updated[0].functionName, 'Updated Function');
  assertEqual(updated[1].functionName, 'Quadratic Function'); // unchanged
});

test('updateFunction - non-existing ID', () => {
  const updated = ops.updateFunction(sampleFunctionDefinitions, 'nonexistent', { functionName: 'Test' });
  assertEqual(updated, sampleFunctionDefinitions);
});

test('updateFunction - edge cases', () => {
  assertEqual(ops.updateFunction(null, 'f1', {}), []);
  assertEqual(ops.updateFunction([], 'f1', {}), []);
  assertEqual(ops.updateFunction(undefined, 'f1', {}), []);
});

// Tests für addFunction
test('addFunction - normal case', () => {
  const newFunc = { id: 'f6', functionName: 'New Function', isActive: true };
  const updated = ops.addFunction(sampleFunctionDefinitions, newFunc);
  assertEqual(updated.length, 6);
  assertEqual(updated[5].id, 'f6');
});

test('addFunction - null/undefined array', () => {
  const newFunc = { id: 'f1', functionName: 'Test' };
  assertEqual(ops.addFunction(null, newFunc), [newFunc]);
  assertEqual(ops.addFunction(undefined, newFunc), [newFunc]);
});

test('addFunction - empty array', () => {
  const newFunc = { id: 'f1', functionName: 'Test' };
  const result = ops.addFunction([], newFunc);
  assertEqual(result.length, 1);
  assertEqual(result[0], newFunc);
});

// Tests für removeFunction
test('removeFunction - existing ID', () => {
  const updated = ops.removeFunction(sampleFunctionDefinitions, 'f1');
  assertEqual(updated.length, 4);
  assertEqual(updated[0].id, 'f2');
});

test('removeFunction - non-existing ID', () => {
  const updated = ops.removeFunction(sampleFunctionDefinitions, 'nonexistent');
  assertEqual(updated.length, 5);
});

test('removeFunction - edge cases', () => {
  assertEqual(ops.removeFunction(null, 'f1'), []);
  assertEqual(ops.removeFunction([], 'f1'), []);
  assertEqual(ops.removeFunction(undefined, 'f1'), []);
});

// Tests für removeFunctionN
test('removeFunctionN - valid index', () => {
  const updated = ops.removeFunctionN(sampleFunctionDefinitions, 0);
  assertEqual(updated.length, 4);
  assertEqual(updated[0].id, 'f2');
});

test('removeFunctionN - invalid index', () => {
  const updated = ops.removeFunctionN(sampleFunctionDefinitions, -1);
  assertEqual(updated.length, 5);
  const updated2 = ops.removeFunctionN(sampleFunctionDefinitions, 100);
  assertEqual(updated2.length, 5);
});

test('removeFunctionN - edge cases', () => {
  assertEqual(ops.removeFunctionN(null, 0), []);
  assertEqual(ops.removeFunctionN(undefined, 0), []);
  assertEqual(ops.removeFunctionN([], 0), []);
});

// Tests für updateFunctionN
test('updateFunctionN - valid index', () => {
  const updated = ops.updateFunctionN(sampleFunctionDefinitions, 0, { functionName: 'Updated' });
  assertEqual(updated[0].functionName, 'Updated');
  assertEqual(updated[1].functionName, 'Quadratic Function');
});

test('updateFunctionN - invalid index', () => {
  const updated = ops.updateFunctionN(sampleFunctionDefinitions, -1, { functionName: 'Test' });
  assertEqual(updated, sampleFunctionDefinitions);
  const updated2 = ops.updateFunctionN(sampleFunctionDefinitions, 100, { functionName: 'Test' });
  assertEqual(updated2, sampleFunctionDefinitions);
});

test('updateFunctionN - edge cases', () => {
  assertEqual(ops.updateFunctionN(null, 0, {}), []);
  assertEqual(ops.updateFunctionN(undefined, 0, {}), []);
  assertEqual(ops.updateFunctionN([], 0, {}), []);
});

// Tests für duplicateFunction
test('duplicateFunction - existing ID', () => {
  const updated = ops.duplicateFunction(sampleFunctionDefinitions, 'f1');
  assertEqual(updated.length, 6);
  assertTrue(updated[5].functionName.includes('Copy'));
  assertFalse(updated[5].isActive);
});

test('duplicateFunction - non-existing ID', () => {
  const updated = ops.duplicateFunction(sampleFunctionDefinitions, 'nonexistent');
  assertEqual(updated.length, 5);
});

test('duplicateFunction - edge cases', () => {
  assertEqual(ops.duplicateFunction(null, 'f1'), []);
  assertEqual(ops.duplicateFunction(undefined, 'f1'), []);
  assertEqual(ops.duplicateFunction([], 'f1'), []);
});

// Tests für duplicateFunctionN
test('duplicateFunctionN - valid index', () => {
  const updated = ops.duplicateFunctionN(sampleFunctionDefinitions, 0);
  assertEqual(updated.length, 6);
  assertTrue(updated[5].functionName.includes('Copy'));
  assertFalse(updated[5].isActive);
});

test('duplicateFunctionN - invalid index', () => {
  const updated = ops.duplicateFunctionN(sampleFunctionDefinitions, -1);
  assertEqual(updated.length, 5);
  const updated2 = ops.duplicateFunctionN(sampleFunctionDefinitions, 100);
  assertEqual(updated2.length, 5);
});

test('duplicateFunctionN - edge cases', () => {
  assertEqual(ops.duplicateFunctionN(null, 0), []);
  assertEqual(ops.duplicateFunctionN(undefined, 0), []);
  assertEqual(ops.duplicateFunctionN([], 0), []);
});

// Tests für reorderFunctions
test('reorderFunctions - valid indices', () => {
  const reordered = ops.reorderFunctions(sampleFunctionDefinitions, 0, 2);
  assertEqual(reordered[0].id, 'f2');
  assertEqual(reordered[1].id, 'f3');
  assertEqual(reordered[2].id, 'f1');
});

test('reorderFunctions - invalid indices', () => {
  const unchanged = ops.reorderFunctions(sampleFunctionDefinitions, -1, 0);
  assertEqual(unchanged, sampleFunctionDefinitions);
  const unchanged2 = ops.reorderFunctions(sampleFunctionDefinitions, 0, 100);
  assertEqual(unchanged2, sampleFunctionDefinitions);
});

test('reorderFunctions - edge cases', () => {
  assertEqual(ops.reorderFunctions(null, 0, 1), []);
  assertEqual(ops.reorderFunctions(undefined, 0, 1), []);
  assertEqual(ops.reorderFunctions([], 0, 1), []);
});

// =============================
// FUNCTION CREATION TESTS
// =============================

// Tests für createFunction
test('createFunction - minimal parameters', () => {
  const func = ops.createFunction('test1', 'Test Function', 'x + 1');
  assertEqual(func.id, 'test1');
  assertEqual(func.functionName, 'Test Function');
  assertEqual(func.functionString, 'x + 1');
  assertTrue(func.isActive);
});

test('createFunction - with type and options', () => {
  const func = ops.createFunction('test2', 'Test', 'x^2', 'quadratic', { color: '#123456', isActive: false });
  assertEqual(func.type, 'quadratic');
  assertEqual(func.color, '#123456');
  assertFalse(func.isActive);
});

test('createFunction - default values', () => {
  const func = ops.createFunction('test3', 'Test', 'x');
  assertEqual(func.type, 'function');
  assertEqual(func.instrument, 'guitar');
  assertEqual(func.color, '#0000FF');
  assertEqual(func.pointOfInterests, []);
});

// Tests für createPointOfInterest
test('createPointOfInterest - minimal parameters', () => {
  const point = ops.createPointOfInterest(1, 2);
  assertEqual(point.x, 1);
  assertEqual(point.y, 2);
  assertEqual(point.type, 'isolated');
});

test('createPointOfInterest - with type and options', () => {
  const point = ops.createPointOfInterest(0, 0, 'root', { label: 'Origin', color: '#FF0000' });
  assertEqual(point.type, 'root');
  assertEqual(point.label, 'Origin');
  assertEqual(point.color, '#FF0000');
});

test('createPointOfInterest - edge coordinates', () => {
  const point1 = ops.createPointOfInterest(-10, 5.5);
  assertEqual(point1.x, -10);
  assertEqual(point1.y, 5.5);
  const point2 = ops.createPointOfInterest(0, 0);
  assertEqual(point2.x, 0);
  assertEqual(point2.y, 0);
});

// Tests für createLandmark
test('createLandmark - minimal parameters', () => {
  const landmark = ops.createLandmark(3, 4);
  assertEqual(landmark.x, 3);
  assertEqual(landmark.y, 4);
});

test('createLandmark - with options', () => {
  const landmark = ops.createLandmark(1, 1, { label: 'Test Point', message: 'Important point' });
  assertEqual(landmark.label, 'Test Point');
  assertEqual(landmark.message, 'Important point');
});

test('createLandmark - edge coordinates', () => {
  const landmark1 = ops.createLandmark(-5, -5);
  assertEqual(landmark1.x, -5);
  assertEqual(landmark1.y, -5);
  const landmark2 = ops.createLandmark(100, 0);
  assertEqual(landmark2.x, 100);
  assertEqual(landmark2.y, 0);
});

// =============================
// UTILITY TESTS
// =============================

// Tests für generateUniqueId
test('generateUniqueId - default prefix', () => {
  const id = ops.generateUniqueId(sampleFunctionDefinitions);
  assertTrue(id.startsWith('f'));
  assertTrue(!['f1', 'f2', 'f3', 'f4', 'f5'].includes(id));
});

test('generateUniqueId - custom prefix', () => {
  const id = ops.generateUniqueId(sampleFunctionDefinitions, 'test');
  assertTrue(id.startsWith('test'));
});

test('generateUniqueId - edge cases', () => {
  assertEqual(ops.generateUniqueId(null), 'f1');
  assertEqual(ops.generateUniqueId(undefined), 'f1');
  assertEqual(ops.generateUniqueId([]), 'f1');
});

// =============================
// VALIDATION TESTS
// =============================

// Tests für isValidFunctionDefinition
test('isValidFunctionDefinition - valid function', () => {
  assertTrue(ops.isValidFunctionDefinition(sampleFunctionDefinitions[0]));
  assertTrue(ops.isValidFunctionDefinition(sampleFunctionDefinitions[4]));
});

test('isValidFunctionDefinition - missing required fields', () => {
  assertFalse(ops.isValidFunctionDefinition({ id: 'f1' }));
  assertFalse(ops.isValidFunctionDefinition({ functionName: 'Test' }));
  assertFalse(ops.isValidFunctionDefinition({ id: 'f1', functionName: 'Test' }));
});

test('isValidFunctionDefinition - edge cases', () => {
  assertFalse(ops.isValidFunctionDefinition(null));
  assertFalse(ops.isValidFunctionDefinition(undefined));
  assertFalse(ops.isValidFunctionDefinition('string'));
  assertFalse(ops.isValidFunctionDefinition(123));
});

// Tests für isValidGraphSettings
test('isValidGraphSettings - valid settings', () => {
  assertTrue(ops.isValidGraphSettings(sampleGraphSettings));
});

test('isValidGraphSettings - invalid settings', () => {
  assertFalse(ops.isValidGraphSettings(invalidGraphSettings));
  assertFalse(ops.isValidGraphSettings({}));
});

test('isValidGraphSettings - edge cases', () => {
  assertFalse(ops.isValidGraphSettings(null));
  assertFalse(ops.isValidGraphSettings(undefined));
  assertFalse(ops.isValidGraphSettings('string'));
});

// =============================
// FALSY VALUE TESTS
// =============================

// Tests for falsy values that SHOULD be preserved (valid empty strings)
test('getFunctionNameN - empty string name should be preserved', () => {
  assertEqual(ops.getFunctionNameN(falsyValueFunctions, 0), '');
});

test('getFunctionNameN - should not return null for valid empty string', () => {
  const result = ops.getFunctionNameN(falsyValueFunctions, 0);
  assertTrue(result === ''); // explicitly check for empty string
  assertFalse(result === null); // should not be null
});

test('getFunctionStringN - empty string should be preserved', () => {
  assertEqual(ops.getFunctionStringN(falsyValueFunctions, 0), '');
});

test('getFunctionStringN - zero as string should be preserved', () => {
  assertEqual(ops.getFunctionStringN(falsyValueFunctions, 1), '0');
});

test('getFunctionStringN - should not return null for valid empty string', () => {
  const result = ops.getFunctionStringN(falsyValueFunctions, 0);
  assertTrue(result === '');
  assertFalse(result === null);
});

test('getFunctionColorN - empty string color should be preserved', () => {
  assertEqual(ops.getFunctionColorN(falsyValueFunctions, 0), '');
  assertEqual(ops.getFunctionColorN(falsyValueFunctions, 2), '');
});

test('getFunctionColorN - black color should be preserved', () => {
  assertEqual(ops.getFunctionColorN(falsyValueFunctions, 1), '#000000');
});

test('getFunctionColorN - should not return null for valid empty string', () => {
  const result = ops.getFunctionColorN(falsyValueFunctions, 0);
  assertTrue(result === '');
  assertFalse(result === null);
});

// Tests for fields that should NOT accept empty strings (type, instrument)
test('getFunctionTypeN - should return actual type value', () => {
  assertEqual(ops.getFunctionTypeN(falsyValueFunctions, 0), 'linear');
  assertEqual(ops.getFunctionTypeN(falsyValueFunctions, 1), 'quadratic');
  assertEqual(ops.getFunctionTypeN(falsyValueFunctions, 2), 'constant');
});

test('getFunctionInstrumentN - should return actual instrument value', () => {
  assertEqual(ops.getFunctionInstrumentN(falsyValueFunctions, 0), 'guitar');
  assertEqual(ops.getFunctionInstrumentN(falsyValueFunctions, 1), 'piano');
  assertEqual(ops.getFunctionInstrumentN(falsyValueFunctions, 2), 'violin');
});

// Tests for boolean false values (should be preserved)
test('isFunctionActiveN - false should return false, not be converted', () => {
  assertFalse(ops.isFunctionActiveN(falsyValueFunctions, 1));
  assertTrue(ops.isFunctionActiveN(falsyValueFunctions, 0));
});

// Tests for numeric zero values (should be preserved)
test('getPointsOfInterestN - points with zero coordinates should be preserved', () => {
  const points = ops.getPointsOfInterestN(falsyValueFunctions, 0);
  assertEqual(points.length, 1);
  assertEqual(points[0].x, 0);
  assertEqual(points[0].y, 0);
  assertEqual(points[0].label, ''); // empty label should be preserved
  assertEqual(points[0].color, ''); // empty color should be preserved
  assertEqual(points[0].earcon, ''); // empty earcon should be preserved
});

test('getLandmarksN - landmarks with zero coordinates and empty strings should be preserved', () => {
  const landmarks = ops.getLandmarksN(falsyValueFunctions, 0);
  assertEqual(landmarks.length, 1);
  assertEqual(landmarks[0].x, 0);
  assertEqual(landmarks[0].y, 0);
  assertEqual(landmarks[0].label, ''); // empty label should be preserved
  assertEqual(landmarks[0].color, ''); // empty color should be preserved
  assertEqual(landmarks[0].message, ''); // empty message should be preserved
});

// Tests for filtering with valid empty strings
test('getFunctionsByType - should work with actual type values', () => {
  const linearFuncs = ops.getFunctionsByType(falsyValueFunctions, 'linear');
  assertEqual(linearFuncs.length, 1);
  assertEqual(linearFuncs[0].id, 'falsy1');
});

test('getFunctionsByInstrument - should work with actual instrument values', () => {
  const guitarFuncs = ops.getFunctionsByInstrument(falsyValueFunctions, 'guitar');
  assertEqual(guitarFuncs.length, 1);
  assertEqual(guitarFuncs[0].id, 'falsy1');
});

// Tests for unique values (should include actual values, not empty strings for type/instrument)
test('getUniqueFunctionTypes - should include actual types', () => {
  const types = ops.getUniqueFunctionTypes(falsyValueFunctions);
  assertTrue(types.includes('linear'));
  assertTrue(types.includes('quadratic'));
  assertTrue(types.includes('constant'));
  assertEqual(types.length, 3); // should not include empty strings
});

test('getUniqueInstruments - should include actual instruments', () => {
  const instruments = ops.getUniqueInstruments(falsyValueFunctions);
  assertTrue(instruments.includes('guitar'));
  assertTrue(instruments.includes('piano'));
  assertTrue(instruments.includes('violin'));
  assertEqual(instruments.length, 3); // should not include empty strings
});

// Test graphSettings from initGraphObject
const initGraphSettings = {
  "defaultView": [-10, 10, 10, -10],
  "minBoundDifference": 0.1,
  "maxBoundDifference": 100,
  "showGrid": true,
  "showAxes": true,
  "gridColor": "#CCCCCC"
};

// Tests for graph settings with falsy values that ARE allowed
const falsyGraphSettings = {
  defaultView: [0, 0, 0, 0], // zeros in array - should be preserved
  minBoundDifference: 0, // VALID - numeric zero allowed for minBoundDifference
  maxBoundDifference: 0, // VALID - numeric zero allowed for maxBoundDifference  
  showGrid: false, // boolean false should be preserved
  showAxes: false, // boolean false should be preserved
  gridColor: '' // depends on implementation - might be valid
};

// Tests for graph settings with falsy values that ARE allowed
test('getMinBoundDifference - zero should return zero, not null', () => {
  assertEqual(ops.getMinBoundDifference(falsyGraphSettings), 0);
});

test('getMaxBoundDifference - zero should return zero, not null', () => {
  assertEqual(ops.getMaxBoundDifference(falsyGraphSettings), 0);
});

test('isGridVisible - false value should return false, not be converted', () => {
  assertFalse(ops.isGridVisible(falsyGraphSettings));
});

test('areAxesVisible - false value should return false, not be converted', () => {
  assertFalse(ops.areAxesVisible(falsyGraphSettings));
});

test('getDefaultView - array with zeros should return the array', () => {
  assertEqual(ops.getDefaultView(falsyGraphSettings), [0, 0, 0, 0]);
});

// Test gridColor depends on whether empty string is valid for gridColor
test('getGridColor - empty string behavior', () => {
  // This test might need adjustment based on whether empty gridColor is valid
  const result = ops.getGridColor(falsyGraphSettings);
  // If empty string is valid for gridColor:
  assertEqual(result, '');
  // If empty string is NOT valid for gridColor, it should return null:
  // assertEqual(result, null);
});

// Tests for createFunction with falsy but valid values
test('createFunction - with empty string name and functionString', () => {
  const func = ops.createFunction('test1', '', '', 'linear', { color: '' });
  assertEqual(func.id, 'test1');
  assertEqual(func.functionName, ''); // empty name should be preserved
  assertEqual(func.functionString, ''); // empty functionString should be preserved
  assertEqual(func.color, ''); // empty color should be preserved
  assertEqual(func.type, 'linear'); // type should not be empty
});

// Tests for createPointOfInterest with falsy but valid values
test('createPointOfInterest - with zero coordinates and empty strings', () => {
  const point = ops.createPointOfInterest(0, 0, 'root', { 
    label: '', 
    color: '', 
    earcon: '' 
  });
  assertEqual(point.x, 0);
  assertEqual(point.y, 0);
  assertEqual(point.type, 'root'); // type should not be empty
  assertEqual(point.label, ''); // empty label should be preserved
  assertEqual(point.color, ''); // empty color should be preserved
  assertEqual(point.earcon, ''); // empty earcon should be preserved
});

// Tests for createLandmark with falsy but valid values
test('createLandmark - with zero coordinates and empty strings', () => {
  const landmark = ops.createLandmark(0, 0, { 
    earcon: 'landmark-earcon', 
    shortcut: 'l' 
  });
  assertEqual(landmark.x, 0);
  assertEqual(landmark.y, 0);
  assertEqual(landmark.earcon, 'landmark-earcon');
  assertEqual(landmark.shortcut, 'l');
});

// Tests for validation with falsy but valid values
test('isValidFunctionDefinition - function with valid empty strings should be valid', () => {
  assertTrue(ops.isValidFunctionDefinition(falsyValueFunctions[0]));
  assertTrue(ops.isValidFunctionDefinition(falsyValueFunctions[1]));
  assertTrue(ops.isValidFunctionDefinition(falsyValueFunctions[2]));
});

// Additional edge case tests for functions that should handle the || vs ?? operator correctly
test('Regression test - functions should use ?? instead of || for string fields', () => {
  // Test that empty strings are preserved, not converted to null
  const testFunc = {
    id: 'test',
    functionName: '',
    type: 'linear',
    functionString: '',
    isActive: false,
    instrument: 'guitar',
    color: ''
  };
  
  const testArray = [testFunc];
  
  // These should return empty strings, not null
  assertEqual(ops.getFunctionNameN(testArray, 0), '');
  assertEqual(ops.getFunctionStringN(testArray, 0), '');
  assertEqual(ops.getFunctionColorN(testArray, 0), '');
  
  // These should return the actual values
  assertEqual(ops.getFunctionTypeN(testArray, 0), 'linear');
  assertEqual(ops.getFunctionInstrumentN(testArray, 0), 'guitar');
  assertFalse(ops.isFunctionActiveN(testArray, 0)); // false, not converted to null
});

// =============================
// INITGRAPHOBJECT COMPATIBILITY TESTS
// =============================

// Tests for initGraphObject compatibility
test('initGraphObject compatibility - function type', () => {
  assertEqual(ops.getFunctionTypeN(initGraphObjectFunctions, 0), 'function');
  assertEqual(ops.getFunctionTypeN(initGraphObjectFunctions, 1), 'piecewise_function');
});

test('initGraphObject compatibility - instruments', () => {
  assertEqual(ops.getFunctionInstrumentN(initGraphObjectFunctions, 0), 'guitar');
  assertEqual(ops.getFunctionInstrumentN(initGraphObjectFunctions, 1), 'clarinet');
});

test('initGraphObject compatibility - complex piecewise function string', () => {
  const expected = "[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]";
  assertEqual(ops.getFunctionStringN(initGraphObjectFunctions, 1), expected);
});

test('initGraphObject compatibility - points of interest with all fields', () => {
  const points = ops.getPointsOfInterestN(initGraphObjectFunctions, 0);
  assertEqual(points.length, 1);
  assertEqual(points[0].x, 10);
  assertEqual(points[0].y, 10);
  assertEqual(points[0].type, 'isolated');
  assertEqual(points[0].label, 'iso 1');
  assertEqual(points[0].color, '#FF0000');
  assertEqual(points[0].earcon, 'earcon 1');
});

test('initGraphObject compatibility - landmarks with all fields', () => {
  const landmarks = ops.getLandmarksN(initGraphObjectFunctions, 0);
  assertEqual(landmarks.length, 1);
  assertEqual(landmarks[0].x, 0);
  assertEqual(landmarks[0].y, 0);
  assertEqual(landmarks[0].label, 'landmark');
  assertEqual(landmarks[0].color, '#FF0000');
  assertEqual(landmarks[0].earcon, 'earcon2');
  assertEqual(landmarks[0].message, 'user defined message');
  assertEqual(landmarks[0].shortcut, 'a');
});

test('getUniqueFunctionTypes - should include piecewise_function', () => {
  const types = ops.getUniqueFunctionTypes(initGraphObjectFunctions);
  assertTrue(types.includes('function'));
  assertTrue(types.includes('piecewise_function'));
});

test('getUniqueInstruments - should include clarinet', () => {
  const instruments = ops.getUniqueInstruments(initGraphObjectFunctions);
  assertTrue(instruments.includes('guitar'));
  assertTrue(instruments.includes('clarinet'));
});

test('initGraphObject graphSettings compatibility', () => {
  assertEqual(ops.getDefaultView(initGraphSettings), [-10, 10, 10, -10]);
  assertEqual(ops.getMinBoundDifference(initGraphSettings), 0.1);
  assertEqual(ops.getMaxBoundDifference(initGraphSettings), 100);
  assertTrue(ops.isGridVisible(initGraphSettings));
  assertTrue(ops.areAxesVisible(initGraphSettings));
  assertEqual(ops.getGridColor(initGraphSettings), '#CCCCCC');
});

test('isValidGraphSettings - initGraphObject settings should be valid', () => {
  assertTrue(ops.isValidGraphSettings(initGraphSettings));
});

// =============================
// MISSING OPTIONAL FIELDS TESTS
// =============================

// Tests for missing optional fields (should not crash, should return sensible defaults)
test('getFunctionColorN - missing color field should return null or default', () => {
  const result = ops.getFunctionColorN(functionsWithMissingOptionalFields, 0);
  // Should return null for missing field, or a default color if implementation provides one
  assertTrue(result === null || typeof result === 'string');
});

test('getPointsOfInterestN - missing pointOfInterests field should return empty array', () => {
  const points = ops.getPointsOfInterestN(functionsWithMissingOptionalFields, 0);
  assertEqual(points, []);
});

test('getLandmarksN - missing landmarks field should return empty array', () => {
  const landmarks = ops.getLandmarksN(functionsWithMissingOptionalFields, 0);
  assertEqual(landmarks, []);
});

test('getPointsOfInterestN - points with missing optional fields', () => {
  const points = ops.getPointsOfInterestN(functionsWithMissingOptionalFields, 1);
  assertEqual(points.length, 1);
  assertEqual(points[0].x, 1);
  assertEqual(points[0].y, 2);
  assertEqual(points[0].type, 'maximum');
  // Check that missing optional fields don't crash the function
  // They should either be undefined or have default values
});

test('getLandmarksN - landmarks with missing optional fields', () => {
  const landmarks = ops.getLandmarksN(functionsWithMissingOptionalFields, 1);
  assertEqual(landmarks.length, 1);
  assertEqual(landmarks[0].x, 5);
  assertEqual(landmarks[0].y, 10);
  // Check that missing optional fields don't crash the function
});

// Test that filtering works with missing optional fields
test('getFunctionsByType - should work with missing optional fields', () => {
  const linearFuncs = ops.getFunctionsByType(functionsWithMissingOptionalFields, 'linear');
  assertEqual(linearFuncs.length, 1);
  assertEqual(linearFuncs[0].id, 'missing2');
});

test('getFunctionsByInstrument - should work with missing optional fields', () => {
  const guitarFuncs = ops.getFunctionsByInstrument(functionsWithMissingOptionalFields, 'guitar');
  assertEqual(guitarFuncs.length, 1);
  assertEqual(guitarFuncs[0].id, 'missing1');
});

// Test validation with missing optional fields
test('isValidFunctionDefinition - should be valid even with missing optional fields', () => {
  assertTrue(ops.isValidFunctionDefinition(functionsWithMissingOptionalFields[0]));
  assertTrue(ops.isValidFunctionDefinition(functionsWithMissingOptionalFields[1]));
});

// Test createFunction with optional earcon and shortcut
test('createFunction - should handle earcon in pointOfInterests', () => {
  const func = ops.createFunction('test', 'Test', 'x', 'function', {
    pointOfInterests: [{ x: 1, y: 1, type: 'root', earcon: 'test-earcon' }]
  });
  assertEqual(func.pointOfInterests[0].earcon, 'test-earcon');
});

test('createLandmark - should handle earcon and shortcut', () => {
  const landmark = ops.createLandmark(1, 1, { 
    earcon: 'landmark-earcon', 
    shortcut: 'l' 
  });
  assertEqual(landmark.earcon, 'landmark-earcon');
  assertEqual(landmark.shortcut, 'l');
});

// =============================
// EXTREME EDGE CASES
// =============================

// Edge case: What happens with completely empty objects?
test('completely empty function object', () => {
  const emptyFunc = {};
  const emptyArray = [emptyFunc];
  
  // These should return null gracefully, not crash
  assertEqual(ops.getFunctionStringN(emptyArray, 0), null);
  assertEqual(ops.getFunctionNameN(emptyArray, 0), null);
  assertEqual(ops.getFunctionTypeN(emptyArray, 0), null);
  assertEqual(ops.getFunctionColorN(emptyArray, 0), null);
  assertEqual(ops.getFunctionInstrumentN(emptyArray, 0), null);
  assertFalse(ops.isFunctionActiveN(emptyArray, 0));
});

// Test that array methods handle missing arrays gracefully
test('missing array fields should return empty arrays', () => {
  const funcWithoutArrays = {
    id: 'test',
    functionName: 'Test',
    type: 'function',
    functionString: 'x',
    isActive: true,
    instrument: 'guitar'
    // pointOfInterests and landmarks completely missing
  };
  
  const testArray = [funcWithoutArrays];
  assertEqual(ops.getPointsOfInterestN(testArray, 0), []);
  assertEqual(ops.getLandmarksN(testArray, 0), []);
  assertFalse(ops.hasFunctionPointsOfInterest(testArray, 0));
  assertFalse(ops.hasFunctionLandmarks(testArray, 0));
});