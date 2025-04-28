import React, { useEffect, useRef } from "react";
import JXG from "jsxgraph";
import { useGraphContext } from "../../context/GraphContext";

const GraphView = () => {
  const boardRef = useRef(null);
  const { functionInput, setCursorCoords, setInputErrorMes } = useGraphContext();

  useEffect(() => {
    const board = JXG.JSXGraph.initBoard("jxgbox", {
      boundingbox: [-10, 10, 10, -10],
      axis: true,
      zoom: { enabled: true, needShift: false },
      pan: { enabled: true, needShift: false },
      showCopyright: false,
    });

    let graphFormula;
    try {
      graphFormula = board.jc.snippet(functionInput, true, "x", true);
      setInputErrorMes(null);
    } catch (err) {
      setInputErrorMes("Invalid function. Please check your input.");
      graphFormula = () => 0;
    }

    const graphObject = board.create("functiongraph", [graphFormula]);
    const cursor = board.create("point", [0, 0], {
      name: "",
      size: 3,
      color: "red",
      fixed: true,
    });

    const updateCursor = (event) => {
      const coords = board.getUsrCoordsOfMouse(event);
      const x = coords[0];
      const y = graphFormula(x);
      cursor.setPosition(JXG.COORDS_BY_USER, [x, y]);
      setCursorCoords({ x: x.toFixed(2), y: y.toFixed(2) });
      board.update();
    };

    board.on("move", updateCursor, { passive: true });

    return () => {
      board.off("move", updateCursor);
      JXG.JSXGraph.freeBoard(board);
    };
  }, [functionInput, setCursorCoords, setInputErrorMes]);

  return <div id="jxgbox" style={{ flex: 1, width: "100%", height: "100%" }}></div>;
};

export default GraphView;