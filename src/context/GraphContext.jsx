import React, { createContext, useContext, useState } from "react";

const GraphContext = createContext();

export const GraphContextProvider = ({ children }) => {
  const [functionInput, setFunctionInput] = useState("sin(x)");
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);

  return (
    <GraphContext.Provider
      value={{
        functionInput,
        setFunctionInput,
        cursorCoords,
        setCursorCoords,
        error,
        setError,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = () => useContext(GraphContext);