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
function createEndPoints(func,board){
    // we are allowing the use of the power operator **, so we replace it by ^ to be able to parse it
    // we are also transforming the math constants to be able to parse them
    // WARNING nthroot is not implemented in mathjs, we need nthRoot, so when using mathjs, we need to change nthroot to nthRoot
    console.log("Creating endpoints for function: ", func);
    const txtraw= func.functionString
    const parsed = transformMathConstants(math.parse(txtraw.replace("**","^").replace("nthroot","nthRoot"))); 
    const types_to_be_deleted= ["isolated", "unequal"]; // we remove these types of points of interest, since they will be redefined
    const filteredPoints = func.pointOfInterests.filter(
      point => !types_to_be_deleted.includes(point.type)
    );
    func.pointOfInterests = filteredPoints;
    console.log(func);

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
                        xisolated.push(v);
                        console.log("Adding isolated point at x=", v);
                        func.pointOfInterests.push({
                            x: v,
                            y: l[i].items[0].evaluate({x:v}),
                            type: "isolated"
                        });
                        console.log("Function ", func);
                      }
                }else{ // we have x op a, with op in {<=, >=, ==}
                    v=ineq.args[1].evaluate(); // v is the value of a in x op a
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {cssClass: 'isolated-point', fixed:true, highlight:false, withLabel:false, size: 4});   
                    endpoints.push(p);
                    if (ineq.op == "=="){ // if we have an equality, we add the x coordinate to the list of x-coordinates of isolated points
                        xisolated.push(v);
                        console.log("Adding isolated point at x=", v);
                        func.pointOfInterests.push({
                            x: v,
                            y: l[i].items[0].evaluate({x:v}),
                            type: "isolated"
                        });
                        console.log("Function ", func);
                    }
                }
            }
            if (ineq.op == "<" || ineq.op ==">" || ineq.op=="!="){ // this we fill in white, since it is an strict inequality
                if ("name" in ineq.args[1]){ // we have a op x, with op in {<,>}
                    v=ineq.args[0].evaluate(); // v is the value of a in a op x
                    let fv = l[i].items[0].evaluate({x:v});
                    if (isNaN(fv) && ineq.op == "!="){ // the point is not defined here, we try the mean of the values at the left and right of v
                      fv=(l[i].items[0].evaluate({x:v-0.0000001})+l[i].items[0].evaluate({x:v+0.0000001})/2);
                      console.log("Possible value at x=", v, fv);
                    }
                    p=board.create("point", [v,fv], {cssClass: 'endpoint-open', fixed:true, highlight:false, withLabel:false, size: 4});   
                    endpoints.push(p);
                }else{ // we have x op a, with op in {<, >}
                    v=ineq.args[1].evaluate(); // v is the value of a in x op a
                    let fv = l[i].items[0].evaluate({x:v});
                    if (isNaN(fv) && ineq.op == "!="){ // the point is not defined here, we try the mean of the values at the left and right of v
                      fv=(l[i].items[0].evaluate({x:v-0.0000001})+l[i].items[0].evaluate({x:v+0.0000001})/2);
                      console.log("Possible value at x=", v, fv);
                    }
                    p=board.create("point", [v,fv], {cssClass: 'endpoint-open', fixed:true, highlight:false, withLabel:false, size: 4});   
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
    return [endpoints,[...new Set(xisolated)]]; // we return the endpoints and the x-coordinates of isolated points, removing duplicates
}

const GraphView = () => {
  const wrapperRef = useRef(null);
  const graphContainerRef = useRef(null);
  const boardRef = useRef(null);
  const { functionDefinitions, cursorCoords, setCursorCoords, setInputErrorMes, graphBounds, PlayFunction, playActiveRef, updateCursor, setUpdateCursor, setPlayFunction, timerRef } = useGraphContext();
  let endpoints = [];
  let xisolated = [];
  let snapaccuracy;
  const graphObjectsRef = useRef(new Map()); // Store graph objects for each function
  const cursorsRef = useRef(new Map()); // Store cursors for each function
  const parsedExpressionsRef = useRef(new Map()); // Store parsed expressions
  const lastCursorPositionRef = useRef(null); // Store the last known cursor position
  const pendingStateUpdateRef = useRef(null); // Store pending state update

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
        const [funcEndpoints, funcXisolated] = createEndPoints(func, board);
        endpoints = [...endpoints, ...funcEndpoints];
        xisolated = [...xisolated, ...funcXisolated];
      }

      // Find last known position for this function's cursor
      let lastPos = cursorCoords && Array.isArray(cursorCoords)
        ? cursorCoords.find(c => c.functionId === func.id)
        : undefined;
      let initialX = lastPos ? parseFloat(lastPos.x) : 0;
      let initialY = lastPos ? parseFloat(lastPos.y) : 0;

      // Create cursor for this function at last known position (or [0,0])
      const cursor = board.create("point", [initialX, initialY], {
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
      // retrieve points of interest
      const l = xisolated.filter(e => Math.abs(e-x) < snapaccuracy);
      const snappedX = l.length > 0 ? l[0] : x;
      
      // Store the current position immediately
      lastCursorPositionRef.current = { x: snappedX };
      
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
            //if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
              cursor.setPositionDirectly(JXG.COORDS_BY_USER, [snappedX, y]);
              cursorPositions.push({
                functionId: func.id,
                x: snappedX.toFixed(2),
                y: y.toFixed(2)
              });
            //} else {
            //  console.warn(`Invalid y value for function ${func.id} at x=${snappedX}: ${y}`);
              //cursor.hide();
            //}
          } catch (err) {
            console.error(`Error updating cursor for function ${func.id}:`, err);
            cursor.hide();
          }
        }
      });
      
      // Update audio immediately by calling setCursorCoords right away
      setCursorCoords(cursorPositions);
      
      // Clear any pending state update
      if (pendingStateUpdateRef.current) {
        clearTimeout(pendingStateUpdateRef.current);
      }
      
      // The delayed state update is no longer needed since we update immediately
      // But we keep the ref for potential future use
      pendingStateUpdateRef.current = null;
      
      board.update();
    };
    setUpdateCursor(() => updateCursors);

    if (PlayFunction.active) {
      console.log("Play mode activated!");
      let startX;
      if (PlayFunction.source === "play") {
        startX = PlayFunction.speed > 0 ? graphBounds.xMin : graphBounds.xMax;
      } else if (PlayFunction.source === "keyboard") {
        // Use the current cursor position if available, otherwise default to edge
        if (cursorCoords && cursorCoords.length > 0 && cursorCoords[0].x !== undefined) {
          startX = parseFloat(cursorCoords[0].x);
          // Clamp to bounds
          if (startX > graphBounds.xMax) startX = graphBounds.xMax;
          if (startX < graphBounds.xMin) startX = graphBounds.xMin;
        } else {
          startX = PlayFunction.speed > 0 ? graphBounds.xMin : graphBounds.xMax;
        }
      } else {
        startX = PlayFunction.speed > 0 ? graphBounds.xMin : graphBounds.xMax;
      }
      PlayFunction.x = startX;
      PlayFunction.timer = setInterval(() => {
        // Use direction to determine movement direction
        const actualSpeed = PlayFunction.source === "keyboard" 
          ? Math.abs(PlayFunction.speed) * PlayFunction.direction 
          : PlayFunction.speed;
        PlayFunction.x += ((graphBounds.xMax - graphBounds.xMin) / (1000 / PlayFunction.interval)) * (actualSpeed / 100);
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
      // Use the last known position immediately
      if (lastCursorPositionRef.current && lastCursorPositionRef.current.x !== undefined) {
        updateCursors(lastCursorPositionRef.current.x);
      } else if (PlayFunction.x !== undefined) {
        updateCursors(PlayFunction.x);
      }
    }

    const moveHandler = (event) => {
      if (!playActiveRef.current) {
        const coords = board.getUsrCoordsOfMouse(event);
        const x = coords[0];
        updateCursors(x);
      }
    };

    board.on("move", moveHandler, { passive: true });

    return () => {
      board.unsuspendUpdate();
      JXG.JSXGraph.freeBoard(board);
    };
  }, [functionDefinitions, graphBounds, PlayFunction.active, PlayFunction.source]);

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

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleKeyDown = (e) => {
      // only handle key events when the wrapper is focused
      if (document.activeElement !== wrapper) return;

      // ESCAPE to exit the application
      if (e.key === 'Escape') {
        wrapper.blur(); // Focus entfernen
        return;
      }
      
      // TAB to allow normal tabbing through elements
      if (e.key === 'Tab') {
        return; // Not preventing default to allow normal tabbing
      }

      // Only intercept graph-specific keys
      const graphKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',];
      if (!graphKeys.includes(e.key)) {
        return; // Other keys are passed through normally
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      switch (e.key) {
        case 'ArrowLeft':
          setPlayFunction(prev => ({ ...prev, source: "keyboard", active: true, direction: -1 }));
          break;
        case 'ArrowRight':
          setPlayFunction(prev => ({ ...prev, source: "keyboard", active: true, direction: 1 }));
          break;
      }
    };

    wrapper.addEventListener('keydown', handleKeyDown);
    return () => wrapper.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={wrapperRef}
      role="application"
      tabIndex={0}
      aria-label="Interactive graph."
      style={{ outline: 'none', width: "100%", height: "100%" }}
    >
      <div 
        ref={graphContainerRef}
        id="jxgbox" 
        style={{ width: "100%", height: "100%", outline: 'none' }}
      />
    </div>
  );
};

export default GraphView;