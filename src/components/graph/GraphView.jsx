import React, { useEffect, useRef } from "react";
import JXG from "jsxgraph";
import { useGraphContext } from "../../context/GraphContext";
import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

// txtraw is a string of the form [[expr_1,ineq_1],[expr_2,ineq_2],..,[expr_n,ineq_n]]
// where expr_i is an expression in the variable x that defines a function in the interval defined by ineq_i
// for instance [[x+5,x < -4],[x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]

function parsePiecewise(txtraw){
    const parsed = math.parse(txtraw);
    if (!("items" in parsed)){ // not a piecewise function
      return txtraw;
    }
    const l = parsed.items;
    function items2expr(its){
        if (its.length==0){
            return "NaN";
        }
        const it=its[0];
        const fn = it.items[0];
        const ineq=it.items[1];
        let cond;
        if ("op" in ineq){ //that is a single inequality or an equality
            cond = ineq.toString();
        }else{
            cond = ineq.params[0].toString()
            cond += ineq.conditionals[0]=="smallerEq" ? "<=" : "<";
            cond += ineq.params[1].toString() + " && " + ineq.params[1].toString(); 
            cond += ineq.conditionals[1]=="smallerEq" ? "<=" : "<";
            cond += ineq.params[2].toString();
        } 
        return cond + " ? (" + fn.toString() + ") : (" + items2expr(its.slice(1)) + ")";
    }
    return items2expr(l);
};

function createEndPoints(txtraw,board){
    const parsed = math.parse(txtraw);
    if (!("items" in parsed)){ // not a piecewise function
        return [[],[]];
    }
    const l = parsed.items;
    let ineq,v,a,b,p,i;
    const endpoints = [];
    const xisolated = [];
    for (i=0;i< l.length;i++){
        ineq = l[i].items[1];
        if ("op" in ineq){ //that is a single inequality or an equality
            if (ineq.op == "<=" || ineq.op ==">=" || ineq.op =="=="){ //one of the arguments is the variable "x" 
                if ("name" in ineq.args[1]){ // we have a op x, with op in {<=, >=, ==}
                    v=ineq.args[0].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue',highlight:false});
                    endpoints.push(p);
                    if (ineq.op == "=="){
                        xisolated.push(p.X());
                    }
                }else{ // we have x op a, with op in {<=, >=, ==}
                    v=ineq.args[1].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue',highlight:false});   
                    endpoints.push(p);
                    if (ineq.op == "=="){
                        xisolated.push(p.X());
                    }
                }
            }
            if (ineq.op == "<" || ineq.op ==">"){ // this we fill in white
                if ("name" in ineq.args[1]){
                    v=ineq.args[0].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue',highlight:false});   
                    endpoints.push(p);
                }else{
                    v=ineq.args[1].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue',highlight:false});   
                    endpoints.push(p);
                }
            }
        }else{ // now we have a an inequality of the form a<=x<=b, a<x<=b, a<=x<b or a<x<b
            // the values a and b are the first and last arguments of the inequality
            a=ineq.params[0].evaluate();
            b=ineq.params[2].evaluate();
            // we should check here that conditionals are in the form smaller, smallerEq 
            if (ineq.conditionals[0]=="smaller"){ // this is a smaller or equal "smallerEq"
                p=board.create("point", [a,l[i].items[0].evaluate({x:a})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue',highlight:false});   
                endpoints.push(p);
            }else{ 
                p=board.create("point", [a,l[i].items[0].evaluate({x:a})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue',highlight:false});   
                endpoints.push(p);
            }
            if (ineq.conditionals[1]=="smaller"){
                p=board.create("point", [b,l[i].items[0].evaluate({x:b})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue',highlight:false});   
                endpoints.push(p);
            }else{
                p=board.create("point", [b,l[i].items[0].evaluate({x:b})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue',highlight:false});   
                endpoints.push(p);
            }
        }
    }
    return [endpoints,xisolated];
}


const GraphView = () => {
  const boardRef = useRef(null);
  const { functionInput, setCursorCoords, setInputErrorMes, graphBounds } = useGraphContext();
  let endpoints;
  let xisolated;
  let snapaccuracy;

  useEffect(() => {
    const board = JXG.JSXGraph.initBoard("jxgbox", {
      boundingbox: [graphBounds.xMin, graphBounds.yMax, graphBounds.xMax, graphBounds.yMin],
      axis: true,
      zoom: { enabled: true, needShift: false },
      pan: { enabled: true, needShift: false },
      showCopyright: false,
    });

    boardRef.current = board;
    snapaccuracy = 3/board.unitX;

    let graphFormula;
    try {
      const expr = parsePiecewise(functionInput);
      graphFormula = board.jc.snippet(expr, true, "x", true);
      setInputErrorMes(null);
    } catch (err) {
      setInputErrorMes("Invalid function. Please check your input.");
      graphFormula = 0;
    }

    const graphObject = board.create("functiongraph", [graphFormula],{fixed:true,highlight:false});

    if (graphFormula != 0){
      [endpoints,xisolated] = createEndPoints(functionInput, board);
    }else{
      endpoints = [];
      xisolated = [];
    }
    const cursor = board.create("point", [0, 0], {
      name: "",
      size: 3,
      color: "red",
      fixed: true,
      highlight: false
    });

    const updateCursor = (event) => {
      const coords = board.getUsrCoordsOfMouse(event);
      var x = coords[0];
      const l=xisolated.filter(function(e){return Math.abs(e-x)<snapaccuracy});
      if (l.length>0){
        x=l[0];
      }
      const y = graphFormula(x);
      cursor.setPositionDirectly(JXG.COORDS_BY_USER, [x, y]);
      setCursorCoords({ x: x.toFixed(2), y: y.toFixed(2) });
      board.update();
    };

    board.on("move", updateCursor, { passive: true });

    return () => {
      board.off("move", updateCursor);
      JXG.JSXGraph.freeBoard(board);
    };
  }, [functionInput, setCursorCoords, setInputErrorMes]);

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