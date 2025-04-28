import React, { createContext, useContext, useState } from "react";

const GraphContext = createContext();

export const GraphContextProvider = ({ children }) => {
  const [functionInput, setFunctionInput] = useState("sin(x)");
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });
  const [inputErrorMes, setInputErrorMes] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

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
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = () => useContext(GraphContext);