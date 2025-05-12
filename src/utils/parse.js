import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

// function to check if 'expr' is a valid math expression
// either single or piecewise
function isValidMathParse(expr){
    try{
        //math.parse(expr); this is not enough, since several variables can be involved
        const parsed = math.parse(expr); // we parse the string txt
        if (!("items" in parsed)){ // not a piecewise function
            if(typeof math.compile(expr).evaluate({x:0})=='number'){ // this parses and checks the expression at 0, if more variables are involved, an error is thrown
            return true;
            }else{
                return false;
            }
        } 
    }
    catch(ex){
        return false;
    }
    const parsed = math.parse(expr); // we parse the string txt
    const its = parsed.items; //list of items, each item should be a pair [expr,ineq]
    //console.log(its.length);
    if (!its.every((e)=> "items" in e)){
        console.log("Invalid input, not an array of arrays");
        return false;
    }
    // so we check that all items are pairs 
    if (!its.every((e)=> e.items.length==2)){
        console.log("Invalid input, not a list of pairs");
        return false;
    }
    let it; //single item
    for (let i=0;i<its.length;i++){
        it=its[i]; // the ith item
        try{
            if (!((typeof it.items[0].evaluate({x:0})=='number') && (typeof it.items[1].evaluate({x:0})=='boolean'))){
                console.log("Invalid input, not a valid expression", it.items[0].toString(), it.items[1].toString());
                return false;
            }
        }catch(ex){
            console.log("Invalid input, not a valid expression", it.items[0].toString(), it.items[1].toString());
            return false;
        }
    }
    return true;
}

// function to check if 'expr' is a constant, for instance, -1 or 10+2
function isMathConstant(expr){
    try{
        math.compile(expr).evaluate() // when trying to evaluate without scope, if not a constant, throws error
        return true;
    }
    catch(ex){
        return false;
    }
}

// checks if txt is a string of the form [[expr_1,ineq_1],[expr_2,ineq_2],..,[expr_n,ineq_n]]
// where expr_i is an expression in the variable x that defines a function in the interval defined by ineq_i
// for instance [[x+5,x < -4],[x^2,-4<=x < 1],[x-2,1<=x < 3],[5,x==3],[x-2,3 < x < 5],[3,5<= x]]
// the only double (chains) inequalities allowed are of the form a<=x<=b, a<x<=b, a<=x<b or a<x<b
function isPiecewise(txt){
    // we first check that the input is a valid math expression
    if (!(isValidMathParse(txt))){
        console.log("Invalid input: could not parse");
        return false;
    }
    const parsed = math.parse(txt); // we parse the string txt
    if (!("items" in parsed)){ // not a piecewise function
      return false;
    }
    const its = parsed.items; //list of items, each item should be a pair [expr,ineq]
    if (!its.every((e)=> "items" in e)){
        console.log("Invalid input, not an array of arrays");
        return false;
    }
    // so we check that all items are pairs 
    if (!its.every((e)=> e.items.length==2)){
        console.log("Invalid input, not a list of pairs");
        return false;
    }
    // now we check that the first item is a function and the second is an inequality
    let it; //single item
    for (let i=0;i<its.length;i++){
        it=its[i]; // the ith item
        // the test isValidMathParse already checks that the first item is a function in x
        // now we check that the second item is an inequality
        const ineq=it.items[1]; // the inequality or equality of ith item
        if ("op" in ineq){ //that is a single inequality or an equality
            // we check if op is ==, <, >, <=, >=
            if (ineq.op != "<" && ineq.op != ">" && ineq.op != "<=" && ineq.op != ">=" && ineq.op != "=="){
                console.log("Invalid input, not a valid inequality (wrong relations)", ineq.toString());
                return false;
            }
            // we check that the number of arguments of the inequality are valid 
            // this is probably not necessary, since the parser should check this
            if (ineq.args.length!=2){
                console.log("Invalid input, not a valid inequality", ineq.toString());
                return false;
            }    
            // we check that the arguments of the inequality are valid
            // one must be constant and the other a variable
            const typeArgs = new Set(ineq.args.map((e)=> e.type));
            if (!typeArgs.has("SymbolNode")){ // at least one must be variable
                console.log("Invalid input, not a valid inequality (variable needed))", ineq.toString());
                return false;
            }
            if (ineq.args[0].type=="SymbolNode"){//equation of the form x op a
                //console.log("Variable first");
                if (!isMathConstant(ineq.args[1].toString())){
                    console.log("Invalid input, not a valid inequality (constant needed))", ineq.toString());
                    return false;
                }
            }else{//equation of the form a op x
                //console.log("variable second")
                if (!isMathConstant(ineq.args[0].toString())){
                    console.log("Invalid input, not a valid inequality (constant needed))", ineq.toString());
                    return false;
                }
            }
            // need to check now that the other argument is constant
        }else{ // now we have a an inequality of the form a<=x<=b, a<x<=b, a<=x<b or a<x<b
            // the values a and b are the first and last arguments of the inequality
            // console.log(ineq.toString()," ",ineq.conditionals.length);
            //const keysIneq = Object.keys(ineq);
            //if (!(keysIneq[0]=="conditionals" && keysIneq[1]=="params" && keysIneq.length==2)){
            if (!(ineq.type=="RelationalNode")){
                console.log("Invalid input, not a valid inequality", ineq.toString());
                return false;
            }
            if (!(ineq.conditionals.length==2)){
                console.log("Invalid input, not a valid chain of inequalities (more than two)", ineq.toString());
                return false;
            }
            if (!ineq.conditionals.every((e)=> e=="smaller" || e=="smallerEq")){
                console.log("Invalid input, not a valid chain of inequalities (only < and <= are allowed)", ineq.toString());
                return false;
            }
            // we check that the arguments of the inequality are valid
            // the first and third must be constant and the second a variable
            //console.log(ineq.params);
            if (!(isMathConstant(ineq.params[0].toString()) && 
                  ineq.params[1].type=="SymbolNode") && 
                  isMathConstant(ineq.params[2].toString())){ // the middle parameter must be a symbol a op1 x op2 b
                console.log("Invalid input, not a valid inequality; two constant params and a symbol", ineq.toString());
                return false;
            }
        }
    }        
    return true;
}

// the output is a translation of the input string into a javascript expression "C ? A : B"
// the input has already been checked with isPiecewise
function parsePiecewise(txt){
    function items2expr(its){ //its is a list of items, each item is a pair [expr,ineq]
        if (its.length==0){
            return "NaN";
        }
        const it=its[0]; // the first item
        const fn = it.items[0]; // the expression of the function
        const ineq=it.items[1]; // the inequality or equality where the function is defined
        let cond; // the condition of "C ? A : B"
        // inequalities of the form a op1 x op2 b are translate into a op1 x && x op2 b 
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
    return items2expr(math.parse(txt).items);
};

// this function checks that the input is a valid function expression
// either single or piecewise
// if the txt is not a valid expression, it returns "0", otherwise it returns the input string
export function checkMathSpell(txt){
    // we first check that the input is a valid math expression
    if (!(isValidMathParse(txt))){
        console.log("Invalid input: could not parse",txt);
        return "0";
    }
    console.log("Valid input: could parse ",txt);
    const parsed = math.parse(txt); // we parse the string txt
    if (!("items" in parsed)){ // not a piecewise function
      return txt;
    }
    if (!isPiecewise(txt)){
        console.log("Invalid input: not a piecewise function");
        return "0";
    }
    return parsePiecewise(txt);
}