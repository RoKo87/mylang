import { Assign, BinaryExpr, Call, Identifier, Object } from "../../front/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, CustomVal, IBool, INull, NativeVal, NumberVal, ObjVal, RunVal, StringVal } from "../value.ts";

export function evalMath(left: NumberVal, right: NumberVal, op: string): RunVal {
    let res = 0;
    if (op == "+")
        res = left.value + right.value;
    else if (op == "-") 
        res = left.value - right.value;
    else if (op == "*")
        res = left.value * right.value;
    else if (op == "/")
        res = left.value / right.value;
    else if (op == "%") {
        res = left.value % right.value;
    }
    else return evalCond(left, right, op);

    return {value: res, type: "number"} as NumberVal;
}

export function evalCond(left: NumberVal | StringVal, right: NumberVal | StringVal, op: string): RunVal {
    let res = false;
    if (op == "==")
        res = left.value == right.value;
    else if (op == "!=")
        res = left.value != right.value;
    else if (op == "<") 
        if (left.type == "number" && right.type == "number") 
            res = left.value < right.value;
        else throw 'This conditional operator should be used with numbers only.'
    else if (op == "<=") 
        if (left.type == "number" && right.type == "number") 
            res = left.value <= right.value;
        else throw 'This conditional operator should be used with numbers only.'
    else if (op == ">") 
        if (left.type == "number" && right.type == "number") 
            res = left.value > right.value;
        else throw 'This conditional operator should be used with numbers only.'
    else if (op == ">=") 
        if (left.type == "number" && right.type == "number") 
            res = left.value >= right.value;
        else throw 'This conditional operator should be used with numbers only.'

    return {value: res, type: "boolean"} as BoolVal;
}

export function evalBinary (binop: BinaryExpr, env: Environment): RunVal {
    const left = evaluate(binop.left, env);
    const right = evaluate(binop.right, env);
    const operator = binop.operator;

    if (left.type == "number" && right.type == "number") {
        return evalMath(left as NumberVal, right as NumberVal, binop.operator);
    }

    if (operator == "==" || operator == "<" || operator == "<=" || operator == ">" ||
    operator == ">=" || operator == "!=") {
        return evalCond(left, right, binop.operator);
    }

    if (left.type == "string" && right.type == "string" && binop.operator == "+") {
        //concatenation
        let res = "";
        res = (left as StringVal).value + (right as StringVal).value;
        return {value: res, type: "string"} as StringVal;
    }

    return INull();
}

export function evalId (ident: Identifier, env: Environment): RunVal {
    // console.log("In evalId():  ", env)
    const val = env.lookup(ident.symbol);
    return val;
}

export function evalAssign (node: Assign, env: Environment): RunVal {
    if (node.to.kind != "Identifier")
        throw `The assigned value must be a variable, you put ${JSON.stringify(node.to)}`;

    const name = (node.to as Identifier).symbol;
    return env.assign(name, evaluate(node.value, env));
}

export function evalObject (obj: Object, env: Environment): RunVal {
    const object = {type: "object", props: new Map()} as ObjVal;
    for (const {key, value} of obj.props) {
        const runval = (value == undefined) ? env.lookup(key) : evaluate(value, env);
        object.props.set(key, runval)
    }
    return object;
}

export function evalCall (call: Call, env: Environment): RunVal {
    const args = call.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(call.name, env);

    if (fn.type == "native") {
        const result = (fn as NativeVal).call(args, env);
        return result;
    } 
    
    if (fn.type == "custom") {
        const func = fn as CustomVal;
        const scope = new Environment(func.envir);

        for (let i = 0; i < func.params.length; i++) {
            const aname = func.params[i];
            scope.declare(aname, args[i], false);
        }
        let result: RunVal = INull();
        for (const stmt of func.body) {
            result = evaluate(stmt, scope);
        }
        console.log("huh luh?")
        return result;

    } 
        throw "Cannot call an undefined function: " + JSON.stringify(fn) + ", could be non-native";
}

