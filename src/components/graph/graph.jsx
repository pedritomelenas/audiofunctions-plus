import React, { useEffect, useRef, useState } from "react";
import JXG from "jsxgraph";

const Graph = () => {
  const boardRef = useRef(null);
  const [functionInput, setFunctionInput] = useState("sin(x)");
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize JSXGraph board
    const board = JXG.JSXGraph.initBoard("jxgbox", {
      boundingbox: [-10, 10, 10, -10],
      axis: true,
      zoom: {
        enabled: true,
        needShift: false,
      },
      pan: {
        enabled: true,
        needShift: false,
      },
      showCopyright: false,
    });

    // Create the function graph
    let graphFormula = board.jc.snippet(functionInput, true, "x", true);
    const graphObject = board.create("functiongraph", [graphFormula]);

    // Create the red cursor point
    const cursor = board.create("point", [0, 0], {
      name: "",
      size: 3,
      color: "red",
      fixed: true,
    });

    // Update cursor position based on mouse movement
    const updateCursor = (event) => {
      const coords = board.getUsrCoordsOfMouse(event);
      const x = coords[0];
      const y = graphFormula(x);
      cursor.setPosition(JXG.COORDS_BY_USER, [x, y]);
      setCursorCoords({ x: x.toFixed(2), y: y.toFixed(2) });
      board.update();
    };

    // Attach mouse move event listener
    board.on("move", updateCursor);

    // Cleanup on component unmount
    return () => {
      board.off("move", updateCursor);
      JXG.JSXGraph.freeBoard(board);
    };
  }, [functionInput]);

  const handleFunctionChange = (e) => {
    setFunctionInput(e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      <div id="controls" style={{ padding: "10px", backgroundColor: "#f9f9f9" }}>
        <label htmlFor="functionInput">Function: </label>
        <input
          type="text"
          id="functionInput"
          value={functionInput}
          onChange={handleFunctionChange}
        />
        <span>
          &nbsp;Cursor: x: {cursorCoords.x}, y: {cursorCoords.y}
        </span>
      </div>
      <div
        id="jxgbox"
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      ></div>
    </div>
  );
};

export default Graph;