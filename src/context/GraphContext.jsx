import React, { createContext, useContext, useState, useRef } from "react";

const GraphContext = createContext();

export const GraphContextProvider = ({ children }) => {
  const [functionInput, setFunctionInput] = useState("[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]");
  const [functionDefinitions, setFunctionDefinitions] = useState(initGraphObject.functions);
  const [graphSettings, setGraphSettings] = useState(initGraphObject.graphSettings);
  const [cursorCoords, setCursorCoords] = useState([]);
  const [inputErrorMes, setInputErrorMes] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [graphBounds, setGraphBounds] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });
  const [PlayFunction, setPlayFunction] = useState({ active: false, x: 0, speed: 50, interval: 10, source: null, direction: 1 });
  const playActiveRef = useRef(false);   // reference to track if the play function is active, used in mouse move handler 
  const timerRef = useRef(null);
  const [updateCursor, setUpdateCursor] = useState(null);
  const [stepSize, setStepSize] = useState(1); // Default value 1
  const inputRefs = {
    function: useRef(null),
    speed: useRef(null),
  };

  ///////// currently missing features //////////
  // boundingBox
  // speed
  // stepSize
  // gridVisibility
  // markers - setByUser
  // axisTickResolution?
  // min and max frequency
  // functionFilter

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
        isAudioEnabled,
        setIsAudioEnabled,
        graphBounds,
        setGraphBounds,
        PlayFunction, 
        setPlayFunction,
        playActiveRef,
        timerRef,
        inputRefs,
        updateCursor,
        setUpdateCursor,
        stepSize,
        setStepSize,
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
      "functionString": "sin(x)",
      "isActive": true,
      "instrument": "organ",
      "color": "#0000FF",           // optional
      "pointOfInterests": [
        {
          "x": 10,
          "y": 10,
          "type": "isolated",
          "label": "iso 1",         // optional
          "color": "#FF0000",       // optional
          "earcon": "earcon 1"      // optional
        },
      ],

      "landmarks": [
        {
          "x": 0,
          "y": 0,
          "label": "landmark",      // optional
          "color": "#FF0000",       // optional
          "earcon": "earcon2",
          "message": "user defined message",  // optional
          "shortcut": "a"           // set by app or user
        },
      ]
    },


    {
      "id": "f2",
      "functionName": "Pieces",
      "type": "piecewise_function",
      "functionString": "[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]",
      "isActive": true,
      "instrument": "clarinet",
      "color": "#FF0000",           // optional
      "pointOfInterests": [
        {
          "x": 3,
          "y": 5,
          "type": "isolated",
          "label": "iso 1",         // optional
          "color": "#FF0000",       // optional
          "earcon": "earcon 1"      // optional
        },
      ],
      "landmarks": []
    }
  ],

  "graphSettings": {
      "defaultView": [-10, 10, 10, -10],
      "minBoundDifference": 0.1, // minimum difference between xMin and xMax, and yMin and yMax
      "maxBoundDifference": 100, // maximum difference between xMin and xMax, and yMin and yMax
      // should we differ between x and y Diffs?
      "showGrid": true,
      "showAxes": true,
      "gridColor": "#CCCCCC"
  }
};
