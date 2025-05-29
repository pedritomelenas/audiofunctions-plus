import React, { useEffect, useRef } from "react";
import JXG from "jsxgraph";
import { useGraphContext } from "../../context/GraphContext";
import { create, all } from 'mathjs'
import { checkMathSpell, transformAssingnments, transformMathConstants } from "../../utils/parse";
import { getActiveFunctions } from "../../utils/graphObjectOperations";

const config = { }
const math = create(all, config)

// txtraw is a string of the form [[expr_1,ineq_1],[expr_2,ineq_2],..,[expr_n,ineq_n]]
// where expr_i is an expression in the variable x that defines a function in the interval defined by ineq_i
// for instance [[x+5,x < -4],[x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]
// it should be previusly checked that it is a valid piecewise function or a math expression
function createEndPoints(txtraw,board){
    const parsed = transformMathConstants(math.parse(txtraw));
    if (!("items" in parsed)){ // not a piecewise function
        return [[],[]];
    }
    const l = parsed.items; //list of items, each item is a pair [expr,ineq]
    let ineq,v,a,b,p,i;
    const endpoints = []; // the endpoints of the intervals
    const xisolated = []; // the x coordinates of points associated to equalities (avoidable discontinuities)
    for (i=0;i< l.length;i++){
        ineq = transformAssingnments(l[i].items[1]); // the inequality or equality of ith item, we change assignments to equalities
        if ("op" in ineq){ //that is a single inequality or an equality
            if (ineq.op == "<=" || ineq.op ==">=" || ineq.op =="=="){ //one of the arguments is the variable "x" 
                if ("name" in ineq.args[1]){ // we have a op x, with op in {<=, >=, ==}
                    v=ineq.args[0].evaluate(); // v is the value of a in a op x
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {cssClass: 'endpoint-closed', fixed:true, highlight:false, withLabel:false, size: 4});
                    endpoints.push(p);
                    if (ineq.op == "=="){ // if we have an equality, we add the x coordinate to the list of x-coordinates of isolated points
                        xisolated.push(p.X());
                    }
                }else{ // we have x op a, with op in {<=, >=, ==}
                    v=ineq.args[1].evaluate(); // v is the value of a in x op a
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {cssClass: 'isolated-point', fixed:true, highlight:false, withLabel:false, size: 4});   
                    endpoints.push(p);
                    if (ineq.op == "=="){ // if we have an equality, we add the x coordinate to the list of x-coordinates of isolated points
                        xisolated.push(p.X());
                    }
                }
            }
            if (ineq.op == "<" || ineq.op ==">" || ineq.op=="!="){ // this we fill in white, since it is an strict inequality
                if ("name" in ineq.args[1]){ // we have a op x, with op in {<,>}
                    v=ineq.args[0].evaluate(); // v is the value of a in a op x
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {cssClass: 'endpoint-open', fixed:true, highlight:false, withLabel:false, size: 4});   
                    endpoints.push(p);
                }else{ // we have x op a, with op in {<, >}
                    v=ineq.args[1].evaluate(); // v is the value of a in x op a
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {cssClass: 'endpoint-open', fixed:true, highlight:false, withLabel:false, size: 4});   
                    endpoints.push(p);
                }
            }
        }else{ // now we have a an inequality of the form a<=x<=b, a<x<=b, a<=x<b or a<x<b
            // the values a and b are the first and last arguments of the inequality
            a=ineq.params[0].evaluate(); // the value of a in a op x op b
            b=ineq.params[2].evaluate(); // the value of b in a op x op b
            // we should check here that conditionals are in the form smaller, smallerEq 
            if (ineq.conditionals[0]=="smaller"){ // this is a smaller so we fill in white, since it is an strict inequality
                p=board.create("point", [a,l[i].items[0].evaluate({x:a})], {cssClass: 'endpoint-open', fixed:true, highlight:false, withLabel:false, size: 4});   
                endpoints.push(p);
            }else{  // this is a smallerEq so we fill in blue
                p=board.create("point", [a,l[i].items[0].evaluate({x:a})], {cssClass: 'endpoint-closed', fixed:true, highlight:false, withLabel:false, size: 4});   
                endpoints.push(p);
            }
            if (ineq.conditionals[1]=="smaller"){ // this is a smaller so we fill in white, since it is an strict inequality
                p=board.create("point", [b,l[i].items[0].evaluate({x:b})], {cssClass: 'endpoint-open', fixed:true, highlight:false, withLabel:false, size: 4});   
                endpoints.push(p);
            }else{ // this is a smallerEq so we fill in blue
                p=board.create("point", [b,l[i].items[0].evaluate({x:b})], {cssClass: 'endpoint-closed', fixed:true, highlight:false, withLabel:false, size: 4});   
                endpoints.push(p);
            }
        }
    }
    return [endpoints,xisolated];
}

const GraphView = () => {
  const boardRef = useRef(null);
  const { functionDefinitions, setCursorCoords, setInputErrorMes, graphBounds, PlayFunction } = useGraphContext();
  let endpoints = [];
  let xisolated = [];
  let snapaccuracy;
  const graphObjectsRef = useRef(new Map()); // Store graph objects for each function
  const cursorsRef = useRef(new Map()); // Store cursors for each function
  const parsedExpressionsRef = useRef(new Map()); // Store parsed expressions

  useEffect(() => {
    const board = JXG.JSXGraph.initBoard("jxgbox", {
      boundingbox: [graphBounds.xMin, graphBounds.yMax, graphBounds.xMax, graphBounds.yMin],
      grid: {
        cssClass: "grid",
      },      
      axis: {
        cssClass: "axis", 
        needsRegularUpdate: true,
        highlight: false,
        ticks: {
          insertTicks: true,
          majorHeight: 5,
          minorHeight: 3,
        },
      },
      zoom: { enabled: true, needShift: false },
      pan: { enabled: true, needShift: false, needTwoFingers: true},
      showCopyright: false,
    });

    boardRef.current = board;
    snapaccuracy = 3/board.unitX;

    // Get active functions
    const activeFunctions = getActiveFunctions(functionDefinitions);

    // Clear old objects and cursors
    graphObjectsRef.current.clear();
    cursorsRef.current.clear();
    parsedExpressionsRef.current.clear();

    // Create graph objects and cursors for each active function
    activeFunctions.forEach(func => {
      let graphFormula;
      let expr = checkMathSpell(func.functionString);
      
      try {
        graphFormula = board.jc.snippet(expr, true, "x", true);
        setInputErrorMes(null);
      } catch (err) {
        console.error(`Error parsing expression for function ${func.id}: `, err);
        setInputErrorMes(`Invalid function ${func.functionName}. Please check your input.`);
        expr = "0";
        graphFormula = 0;
      }

      // Store the parsed expression
      parsedExpressionsRef.current.set(func.id, expr);

      // Create graph object with function's color
      const graphObject = board.create("functiongraph", [graphFormula], {
        cssClass: "curve",
        fixed: true,
        highlight: false,
        strokeColor: func.color || "#0000FF", // Use function's color or default to blue
      });

      // Create endpoints for piecewise functions
      if (expr !== "0") {
        const [funcEndpoints, funcXisolated] = createEndPoints(func.functionString, board);
        endpoints = [...endpoints, ...funcEndpoints];
        xisolated = [...xisolated, ...funcXisolated];
      }

      // Create cursor for this function
      const cursor = board.create("point", [0, 0], {
        cssClass: "functionCursor",
        name: "",
        size: 5,
        fixed: true,
        highlight: false,
        fillColor: func.color || "#0000FF",
        strokeColor: func.color || "#0000FF"
      });

      // Store references
      graphObjectsRef.current.set(func.id, graphObject);
      cursorsRef.current.set(func.id, cursor);
    });

    const updateCursors = (x) => {
      const l = xisolated.filter(e => Math.abs(e-x) < snapaccuracy);
      const snappedX = l.length > 0 ? l[0] : x;
      
      // Update all active cursors
      const cursorPositions = [];
      activeFunctions.forEach(func => {
        const cursor = cursorsRef.current.get(func.id);
        const graphObject = graphObjectsRef.current.get(func.id);
        const parsedExpr = parsedExpressionsRef.current.get(func.id);
        
        if (cursor && graphObject && parsedExpr) {
          try {
            const y = board.jc.snippet(parsedExpr, true, "x", true)(snappedX);
            // Check if y is a valid number
            if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
              cursor.setPositionDirectly(JXG.COORDS_BY_USER, [snappedX, y]);
              cursorPositions.push({
                functionId: func.id,
                x: snappedX.toFixed(2),
                y: y.toFixed(2)
              });
            } else {
              console.warn(`Invalid y value for function ${func.id} at x=${snappedX}: ${y}`);
              cursor.hide();
            }
          } catch (err) {
            console.error(`Error updating cursor for function ${func.id}:`, err);
            cursor.hide();
          }
        }
      });
      
      setCursorCoords(cursorPositions);
      board.update();
    };

    if (PlayFunction.active) {
      console.log("Play mode activated!");
      if (PlayFunction.speed > 0) PlayFunction.x = graphBounds.xMin; else PlayFunction.x = graphBounds.xMax;
      PlayFunction.timer = setInterval(() => {
        PlayFunction.x += ((graphBounds.xMax - graphBounds.xMin) / (1000 / PlayFunction.interval)) * (PlayFunction.speed / 100);
        updateCursors(PlayFunction.x);
        if ((PlayFunction.x > graphBounds.xMax) || (PlayFunction.x < graphBounds.xMin)) {
          PlayFunction.active = false;
        }
      }, PlayFunction.interval);
    } else {
      if (PlayFunction.timer !== null) {
        clearInterval(PlayFunction.timer);
        PlayFunction.timer = null;
      }
    }

    const moveHandler = (event) => {
      if (!PlayFunction.active) {
        const coords = board.getUsrCoordsOfMouse(event);
        const x = coords[0];
        updateCursors(x);
      }
    };

    board.on("move", moveHandler, { passive: true });

    return () => {
      board.off("move", moveHandler);
      JXG.JSXGraph.freeBoard(board);
    };
  }, [functionDefinitions, PlayFunction.active]);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.setBoundingBox([
        graphBounds.xMin,
        graphBounds.yMax,
        graphBounds.xMax,
        graphBounds.yMin,
      ]);
      boardRef.current.update();
    }
  }, [graphBounds]);

  return <div id="jxgbox" style={{ flex: 1, width: "100%", height: "100%" }}></div>;
};

export default GraphView;