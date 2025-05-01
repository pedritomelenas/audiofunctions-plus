import React, { useEffect, useRef } from "react";
import JXG from "jsxgraph";
import { useGraphContext } from "../../context/GraphContext";
import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

var xisolated = [];


// txtraw is a string of the form [[expr_1,ineq_1],[expr_2,ineq_2],..,[expr_n,ineq_n]]
// where expr_i is an expression in the variable x that defines a function in the interval defined by ineq_i
// for instance [[x+5,x < -4],[x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]

function parsePiecewise(txtraw){
    var parsed = math.parse(txtraw);
    var l = parsed.items;
    var v,a,b,i;
    var result= "";
    var items2expr = function(its){
        var it,ineq,fn,cond;
        if (its.length==0){
            return "NaN";
        }
        it=its[0];
        fn = it.items[0];
        ineq=it.items[1];
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
    var parsed = math.parse(txtraw);
    var l = parsed.items;
    var ineq,v,a,b,p,i;
    var endpoints = [];
    for (i=0;i< l.length;i++){
        ineq = l[i].items[1];
        if ("op" in ineq){ //that is a single inequality or an equality
            if (ineq.op == "<=" || ineq.op ==">=" || ineq.op =="=="){ //one of the arguments is the variable "x" 
                if ("name" in ineq.args[1]){ // we have a op x, with op in {<=, >=, ==}
                    v=ineq.args[0].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue'});
                    endpoints.push(p);
                    if (ineq.op == "=="){
                        xisolated.push(p.X());
                    }
                }else{ // we have x op a, with op in {<=, >=, ==}
                    v=ineq.args[1].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue'});   
                    endpoints.push(p);
                    if (ineq.op == "=="){
                        xisolated.push(p.X());
                    }
                }
            }
            if (ineq.op == "<" || ineq.op ==">"){ // this we fill in white
                if ("name" in ineq.args[1]){
                    v=ineq.args[0].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue'});   
                    endpoints.push(p);
                }else{
                    v=ineq.args[1].evaluate();
                    p=board.create("point", [v,l[i].items[0].evaluate({x:v})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue'});   
                    endpoints.push(p);
                }
            }
        }else{ // now we have a an inequality of the form a<=x<=b, a<x<=b, a<=x<b or a<x<b
            // the values a and b are the first and last arguments of the inequality
            a=ineq.params[0].evaluate();
            b=ineq.params[2].evaluate();
            // we should check here that conditionals are in the form smaller, smallerEq 
            if (ineq.conditionals[0]=="smaller"){ // this is a smaller or equal "smallerEq"
                p=board.create("point", [a,l[i].items[0].evaluate({x:a})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue'});   
                endpoints.push(p);
            }else{ 
                p=board.create("point", [a,l[i].items[0].evaluate({x:a})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue'});   
                endpoints.push(p);
            }
            if (ineq.conditionals[1]=="smaller"){
                p=board.create("point", [b,l[i].items[0].evaluate({x:b})], {fixed:true,withLabel:false,fillColor:'white', fillOpacity:0.1,strokeColor:'blue'});   
                endpoints.push(p);
            }else{
                p=board.create("point", [b,l[i].items[0].evaluate({x:b})], {fixed:true,withLabel:false,fillColor:'blue',strokeColor:'blue'});   
                endpoints.push(p);
            }
        }
    }
    return endpoints;
}


const GraphView = () => {
  const boardRef = useRef(null);
  const { functionInput, setCursorCoords, setInputErrorMes, graphBounds } = useGraphContext();

  useEffect(() => {
    const board = JXG.JSXGraph.initBoard("jxgbox", {
      boundingbox: [graphBounds.xMin, graphBounds.yMax, graphBounds.xMax, graphBounds.yMin],
      axis: true,
      zoom: { enabled: true, needShift: false },
      pan: { enabled: true, needShift: false },
      showCopyright: false,
    });

    boardRef.current = board;


    let graphFormula;
    try {
      console.log("functionInput", functionInput);
      const expr = parsePiecewise(functionInput);
      console.log("expr", expr);
      graphFormula = board.jc.snippet(expr, true, "x", true);
      setInputErrorMes(null);
    } catch (err) {
      setInputErrorMes("Invalid function. Please check your input.");
      graphFormula = 0;
    }

    const graphObject = board.create("functiongraph", [graphFormula]);
    const cursor = board.create("point", [0, 0], {
      name: "",
      size: 3,
      color: "red",
      fixed: true,
    });

    if (graphFormula != 0){
      const endpoints = createEndPoints(functionInput, board);
      console.log("endpoints", endpoints);
      console.log("xisolated", xisolated);
    }else{
      const endpoints = [];
    }

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