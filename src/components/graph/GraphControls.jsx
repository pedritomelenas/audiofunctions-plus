import React from "react";
import { useGraphContext } from "../../context/GraphContext";

const GraphControls = () => {
  const { functionInput, setFunctionInput, cursorCoords, error } = useGraphContext();

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
    </div>
  );
};

export default GraphControls;