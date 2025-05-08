import React, { createContext, useContext, useState } from "react";

const GraphContext = createContext();

export const GraphContextProvider = ({ children }) => {
  const [functionInput, setFunctionInput] = useState("[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]");
  const [functionDefinitions, setFunctionDefinitions] = useState(initFunctionsObject.functions);
  const [graphSettings, setGraphSettings] = useState(initFunctionsObject.graphSettings);
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });
  const [inputErrorMes, setInputErrorMes] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [graphBounds, setGraphBounds] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });
  const [PlayFunction, setPlayFunction] = useState({ active: false, x: 0, speed: 50, interval: 10, timer: null });

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
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = () => useContext(GraphContext);


const initFunctionsObject = {
  "functions": [

      {
          "id": "f1",
          "functionName": "Function 1",
          "type": "function",
          "functionString": "sin(x)",
          "instrument": "guitar",
          "color": "#0000FF",
          "pointOfInterests": [
              {
                  "x": 0,
                  "y": 0,
                  "label": "isolated",
                  "color": "#FF0000"
              },
              {
                  "x": 1.5,
                  "y": 1,
                  "label": "CustomLabel",
                  "color": "#00FF00"
              }
          ],
          "landmarks": [
              {
                  "x": 0,
                  "y": 0,
                  "label": "landmark",
                  "color": "#FF0000"
              },
              {
                  "x": 1.5,
                  "y": 1,
                  "label": "CustomLabel",
                  "color": "#00FF00"
              }
          ]
      },

      {
          "id": "f2",
          "functionName": "Pieces",
          "type": "piecewise_function",
          "functionString": "[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]",
          "instrument": "clarinet",
          "color": "#FF0000",
          "pointOfInterests": [],
          "landmarks": []
      }
  ],



  "graphSettings": {
      "defaultView": [-10, 10, 10, -10],
      "showGrid": true,
      "showAxes": true,
      "gridColor": "#CCCCCC"
  }
};