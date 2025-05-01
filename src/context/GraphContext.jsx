import React, { createContext, useContext, useState } from "react";

const GraphContext = createContext();

export const GraphContextProvider = ({ children }) => {
  const [functionInput, setFunctionInput] = useState("[[x+5,x < -4],[1/2*x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]");
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });
  const [inputErrorMes, setInputErrorMes] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [graphBounds, setGraphBounds] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });

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
        cursorCoords,
        setCursorCoords,
        inputErrorMes,
        setInputErrorMes,
        isAudioEnabled,
        setIsAudioEnabled,
        graphBounds,
        setGraphBounds,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = () => useContext(GraphContext);