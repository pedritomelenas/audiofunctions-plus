import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { decodeFromImportLink, getHashParameter, clearHashParameter } from "../utils/urlUtils";

const GraphContext = createContext();

export const GraphContextProvider = ({ children }) => {
  // Initialize with default values first
  const [functionDefinitions, setFunctionDefinitions] = useState(initGraphObject.functions);
  const [graphSettings, setGraphSettings] = useState(initGraphObject.graphSettings);
  const [isLoading, setIsLoading] = useState(true);
  
  const [functionInput, setFunctionInput] = useState("[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]"); // TODO delete
  const [cursorCoords, setCursorCoords] = useState([]);
  const [inputErrorMes, setInputErrorMes] = useState(null); // TODO delete
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [graphBounds, setGraphBounds] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });
  const [PlayFunction, setPlayFunction] = useState({ active: false, x: 0, speed: 10, interval: 10, source: null, direction: 1 });
  const playActiveRef = useRef(false);
  const timerRef = useRef(null);
  const mouseTimeoutRef = useRef(null);
  const [updateCursor, setUpdateCursor] = useState(null);
  const [stepSize, setStepSize] = useState(0.25); // Default value 0.5
  const [explorationMode, setExplorationMode] = useState("none"); // "none", "mouse", "keyboard_stepwise", "keyboard_smooth", "batch"
  const [isShiftPressed, setIsShiftPressed] = useState(false); // Track Shift key state
  const inputRefs = {
    function: useRef(null),
    speed: useRef(null),
  };

  const [inputErrors, setInputErrors] = useState({});

  // Load data from URL hash on component mount
  useEffect(() => {
    const loadFromUrl = async () => {
      try {
        const importData = getHashParameter('import');
        if (importData) {
          console.log('Found import data in URL hash:', importData);
          const decodedData = decodeFromImportLink(importData);
          if (decodedData) {
            setFunctionDefinitions(decodedData.functions);
            setGraphSettings(decodedData.graphSettings);
            
            // Set graph bounds from loaded settings if available
            if (decodedData.graphSettings.defaultView) {
              const [xMin, xMax, yMax, yMin] = decodedData.graphSettings.defaultView;
              setGraphBounds({ xMin, xMax, yMin, yMax });
            }
            
            console.log('Loaded data from import link:', decodedData);
            
            // Clear the hash parameter after loading
            // clearHashParameter();
          } else {
            console.warn('Invalid import link data');
          }
        }
      } catch (error) {
        console.error('Error loading import link:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromUrl();
  }, []);

  // Don't render children until we've checked for URL parameters
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Utility function to focus the chart
  const focusChart = () => {
    const chartElement = document.getElementById('chart');
    if (chartElement) {
      chartElement.focus();
    }
  };

  return (
    <GraphContext.Provider
      value={{
        functionInput,
        setFunctionInput,
        functionDefinitions,
        setFunctionDefinitions,
        graphSettings,
        setGraphSettings,
        cursorCoords,
        setCursorCoords,
        inputErrorMes,
        setInputErrorMes,
        inputErrors,
        setInputErrors,
        isAudioEnabled,
        setIsAudioEnabled,
        graphBounds,
        setGraphBounds,
        PlayFunction, 
        setPlayFunction,
        playActiveRef,
        timerRef,
        mouseTimeoutRef,
        inputRefs,
        updateCursor,
        setUpdateCursor,
        stepSize,
        setStepSize,
        explorationMode,
        setExplorationMode,
        isShiftPressed,
        setIsShiftPressed,
        focusChart,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = () => useContext(GraphContext);



const initGraphObject = {
  "functions": [
    {
      "id": "f1",
      "functionName": "Function 1",
      "type": "function",
      // "functionString": "sin(x)",
      "functionDef": "sin(x)",
      "isActive": true,
      "instrument": "clarinet",
      // "color": "#0000FF",           // optional
      "pointOfInterests": [
        // {
        //   "x": 10,
        //   "y": 10,
        //   "type": "isolated",
        //   "label": "iso 1",         // optional
        //   "color": "#FF0000",       // optional
        //   "earcon": "earcon 1"      // optional
        // },
      ],

      "landmarks": [
        // {
        //   "x": 0,
        //   "y": 0,
        //   "label": "landmark",      // optional
        //   "color": "#FF0000",       // optional
        //   "earcon": "earcon2",
        //   "message": "user defined message",  // optional
        //   "shortcut": "a"           // set by app or user
        // },
      ]
    },


    {
      "id": "f2",
      "functionName": "Function 2",
      "type": "piecewise_function",
      // "functionString": "[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]",
      "functionDef": [["x^2","x <= 0"],["x + 1"," 0 < x"]],
      "isActive": false,
      "instrument": "clarinet",
      // "color": "#FF0000",           // optional
      "pointOfInterests": [
        // {
        //   "x": 3,
        //   "y": 5,
        //   "type": "isolated",
        //   "label": "iso 1",         // optional
        //   "color": "#FF0000",       // optional
        //   "earcon": "earcon 1"      // optional
        // },
      ],
      "landmarks": []
    }
  ],

  "graphSettings": {
      "defaultView": [-10, 10, 10, -10],
      "minBoundDifference": 0.1, // minimum difference between xMin and xMax, and yMin and yMax
      "maxBoundDifference": 100, // maximum difference between xMin and xMax, and yMin and yMax
      "showGrid": true,
      "showAxes": true,
      "gridColor": "#CCCCCC",
      
      "restrictionMode": "none" // "none", "read-only", "full-restriction"
  }
};
