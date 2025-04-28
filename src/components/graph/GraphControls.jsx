import React from "react";
import { useGraphContext } from "../../context/GraphContext";

const GraphControls = () => {
  
  const {
    functionInput,
    setFunctionInput,
    cursorCoords,
    error,
    isAudioEnabled,
    setIsAudioEnabled,
  } = useGraphContext();

  return (
    <div style={{ padding: "10px" }}>
      <label htmlFor="functionInput">Function: </label>
      <input
        type="text"
        id="functionInput"
        value={functionInput}
        onChange={(e) => setFunctionInput(e.target.value)}
      />
      <span>
        &nbsp;Cursor: x: {cursorCoords.x}, y: {cursorCoords.y}
      </span>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      <button
        onClick={() => setIsAudioEnabled((prev) => !prev)}
        style={{
          marginLeft: "10px",
          padding: "5px 10px",
          backgroundColor: isAudioEnabled ? "green" : "orange",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isAudioEnabled ? "Stop Audio" : "Start Audio"}
      </button>
    </div>
  );
};

export default GraphControls;