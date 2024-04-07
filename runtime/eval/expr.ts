// deno-lint-ignore-file

import { Assign, BinaryExpr, Call, ClassObj, Compound, Element, Error, Expr, Identifier, List, Logic, Member, Number, Object, Strit, Unary } from "../../front/ast.ts";
import { language } from "../../front/lexer.ts";
import { langget } from "../../front/mode.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, ClassObjVal, ClassVal, CustomVal, ErrorVal, IBool, INull, INum, ListVal, NativeVal, NumberVal, ObjVal, RunVal, StringVal } from "../value.ts";

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
    else if (op == "%") 
        res = left.value % right.value;
    else if (op == "|") 
        res = left.value | right.value;
    else if (op == "&") 
        res = left.value & right.value;
    else return evalCond(left, right, op);

    return {value: res, type: "number"} as NumberVal;
}

export function evalCond(left: RunVal, right: RunVal, op: string): RunVal {
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

export function evalUnary (unop: Unary, env: Environment): RunVal {
    const on = evaluate(unop.on, env);
    const operator = unop.operator;

    if (on.type == "boolean") 
        return IBool(!((on as BoolVal).value));
    if (on.type == "number") {
        let val = (on as NumberVal).value; let exp = 1;
        if (val == 0) return {type: "number", value: 1} as NumberVal;
        while (Math.pow(2, exp) <= val) exp++;
        return {type: "number", value: (Math.pow(2, exp) - 1) - val} as NumberVal;
    } 

    return INull();
}

export function evalLogic (logic: Logic, env: Environment): RunVal {
    const left = evaluate(logic.left, env);
    const right = evaluate(logic.right, env);
    const log = logic.logic;

    if (left.type == "number" && right.type == "number") {
        return evalMath(left as NumberVal, right as NumberVal, logic.logic);
    }

    if (left.type == "boolean" && right.type == "boolean") {
        if (log == "&") 
            return IBool((left as BoolVal).value && (right as BoolVal).value);
        else if (log == "|") 
            return IBool((left as BoolVal).value || (right as BoolVal).value);
    }

    if (left.type != right.type && ((left.type != "boolean" && left.type != "number") || (right.type != "boolean" && right.type != "number"))) 
        throw "Both sides of a logic expression must either be conditional statements, booleans, or numbers."

    return INull();
}

export function evalId (ident: Identifier, env: Environment): RunVal {
    // console.log("In evalId():  ", env)
    const val = env.lookup(ident.symbol);
    return val;
}

export function evalError (err: Error, env: Environment): RunVal {
    // console.log("In evalId():  ", env)
    const message = err.message;
    const error_type = err.type ? err.type : null;
    throw {type: "error", error_type, message} as ErrorVal;
}

export function evalAssign (node: Assign, env: Environment): RunVal {
    if (node.to.kind != "Identifier" && node.to.kind != "Element" )
        throw `The assigned value must be a variable, you put ${JSON.stringify(node.to)}`;

    if (node.to.kind == "Identifier") {
    const identifier = (node.to as Identifier);
    const name = identifier.symbol;
    if (node.value.kind == "List") {
        return env.assign(name, evaluate(({kind: "List", type: (evaluate(identifier, env) as ListVal).class, 
        elements: (node.value as List).elements} as List), env))
    }
    return env.assign(name, evaluate(node.value, env));
    } else {
        const name = ((node.to as Element).list as Identifier); 
        let arrv = (evaluate(name, env) as ListVal);
        if (arrv.class == "array") {
            let arr = arrv.elements;
            let index = evaluate((node.to as Element).index, env);
            let indexrv = (index as NumberVal).value;
            if (indexrv >= arr.length || ((node.to as Element).index as Number).value >= arr.length) 
                throw "Out of bounds for an index of this list."
            arr[indexrv] = evaluate(node.value, env);
            return env.assign(name.symbol, {type: "list", class: arrv.class, elements: arr} as ListVal)
        }
        return INull();
    }
}

export function evalCompound (node: Compound, env: Environment): RunVal {
    if (node.left.kind != "Identifier")
        throw `The assigned value must be a variable, you put ${JSON.stringify(node.left)}`;

    const name = (node.left as Identifier).symbol;
    let res;
    if (evaluate(node.left, env).type == "string" && evaluate(node.right, env).type == "string" && node.operator == "+=") {
        //concatenation
        res = "";
        res = (evaluate(node.left, env) as StringVal).value + (evaluate(node.right, env) as StringVal).value;
        return {value: res, type: "string"} as StringVal;
    } else if (evaluate(node.left, env).type == "number" && evaluate(node.right, env).type == "number") {
        let modop = node.operator.substring(0,1);
        res = evalMath(evaluate(node.left, env) as NumberVal, evaluate(node.right, env) as NumberVal, modop);
    }
    if (res) return env.assign(name, res);
    else throw `An unspecified runtime error occured.`;
}

export function evalObject (obj: Object, env: Environment): RunVal {
    const object = {type: "object", props: new Map()} as ObjVal;
    for (const {key, value} of obj.props) {
        const runval = (value == undefined) ? env.lookup(key) : evaluate(value, env);
        object.props.set(key, runval)
    }
    return object;
}

export function evalClassObj (obj: ClassObj, env: Environment): RunVal {
    const class_value = (env.lookup(obj.cname)) as ClassVal;
    let fields = class_value.fields;
    const args = obj.args;
    let cov : ClassObjVal = {type: "class object", class_value, fields};
    for (const ctor of class_value.ctors) {
        if (ctor.params.length == args.length) {
            let params = new Map<string, Expr>(); let index = 0;
            for (const param of ctor.params) {
                params.set(param, args[index]);
                index++;
            }
            for (const stmt of ctor.body) {
                if (stmt.kind == "Assign") {
                    let assign = stmt as Assign
                    if (assign.value.kind == "Identifier" && (assign.value as Identifier).symbol != undefined ) {
                        let par = (params.get((assign.value as Identifier).symbol) != undefined) ? 
                            params.get((assign.value as Identifier).symbol) : {kind: "Identifier", symbol: ""} as Identifier;
                        if (par == undefined) par = {kind: "Identifier", symbol: ""} as Identifier;
                        fields.set((assign.to as Identifier).symbol, evaluate(par, env));
                    }
                }
            }
        }
    }

    return cov;
}

export function evalMember (mem: Member, env: Environment): RunVal {
    const object = evalId(mem.object as Identifier, env);
    let instring = (mem.prop as Identifier).symbol;
    let x: RunVal | undefined;
    try { x = (object as ObjVal).props.get(instring); }

    catch (e: any) {}
    if (x != undefined) {
        return x;
    } else if (instring == langget(language, "length")) {
        if (evaluate(mem.object, env).type == "string") {
            return INum((evaluate(mem.object, env) as StringVal).value.length);
        } else if (evaluate(mem.object, env).type == "list") {
            return INum((evaluate(mem.object, env) as ListVal).elements.length);
        }
    }
    return INull();
}

export function evalElement (elem: Element, env: Environment): RunVal {
    const list = evalId(elem.list as Identifier, env);
    let indexInput = evaluate(elem.index, env);
    let index = (indexInput as NumberVal).value;
    let length;
    if (list.type == "string") 
        length = (list as StringVal).value.length;
    else length = (list as ListVal).elements.length;

    if (index >= length || index < 0) {
        throw `${index} is out of bounds for an index of ${(elem.list as Identifier).symbol}.`
    } 
    
    if (list.type == "string") {
        return evaluate({kind: "String", value: (list as StringVal).value.substring(index, index+1)} as Strit, env);
    } else return (list as ListVal).elements[index];

    // let length = list.valu

    return INull();
}

export function evalList (list: List, env: Environment): RunVal {
    let elements = new Array<RunVal>;;
    if (list.type == "Set") {
        for (const elem of list.elements) {
            elements.push(evaluate(elem, env));
            let index = 0;
            for (const pushed of elements) {
                if (pushed.value == evaluate(elem, env).value && index != elements.length - 1) {
                    elements.pop();
                    break;
                } else index++;
            }
        }
    } else for (const elem of list.elements) {
        elements.push(evaluate(elem, env));
    }

    const res = {type: "list", class: list.type, elements} as ListVal;
    return res;
}

export function evalCall (call: Call, env: Environment): RunVal {
    const args = call.args.map((arg) => evaluate(arg, env));
    let fn;
    if (call.name.kind == "Member") {
        fn = evaluate((call.name as Member).prop, env);
        // console.log("In evalCall(): ", (call.name as Member).prop);
    }
    else fn = evaluate(call.name, env);

    if (fn.type == "native") {
        let result;
        if (call.name.kind != undefined) {result = (fn as NativeVal).call(args, env, (call.name as Member).object);}
        else {result = (fn as NativeVal).call(args, env);}
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
        return result;

    } 
        throw "Cannot call an undefined function: " + JSON.stringify(fn) + ", could be non-native";
}

