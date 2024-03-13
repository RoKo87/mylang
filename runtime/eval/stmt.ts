// deno-lint-ignore-file

import { BinaryExpr, Class, Condition, Constructor, Declar, FLoop, Function, Program, Stmt, WLoop } from "../../front/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, ClassVal, CtorVal, CustomVal, INull, NullVal, NumberVal, RunVal } from "../value.ts";
import { evalCond } from "./expr.ts";

export function evalProgram (program: Program, env: Environment): RunVal {
    let lastEval: RunVal = INull();

    for (const statement of program.body) {
        lastEval = evaluate(statement, env);
    }
    return lastEval;
}

export function evalDecl(decl: Declar, env: Environment): RunVal {
    const value = decl.value ? evaluate(decl.value, env) : INull();
    return env.declare(decl.identifier, value, decl.constant);
}

export function evalFunc(decl: Function, env: Environment): RunVal {
    const func = {type: "custom", name: decl.name,
    params: decl.params,
    envir: env,
    body: decl.body} as CustomVal;

    return env.declare(decl.name, func, true);
}

export function evalCtor(decl: Constructor, env: Environment, cl: string, iter: number): RunVal {
    const func = {type: "constructor",
    params: decl.params,
    envir: env,
    body: decl.body} as CtorVal;

    return env.declare(cl+"{"+iter, func, true);
}

export function evalCondStmt(cond: Condition, env: Environment): RunVal {
    let cnode = (cond.condition as BinaryExpr)
    if ((evalCond(evaluate(cnode.left, env), evaluate(cnode.right, env), 
    cnode.operator) as BoolVal).value == true) {
        let result: RunVal = INull();
        const scope = new Environment(env);
        for (const stmt of cond.body) {
            result = evaluate(stmt, scope);
        }
    } else if (cond.else && cond.ebody) {
        let result: RunVal = INull();
        const scope = new Environment(env);
        for (const stmt of cond.ebody) {
            result = evaluate(stmt, scope);
        }
    }

    return {type: "null", value: null} as NullVal;
}

export function evalWLoop(wloop: WLoop, env: Environment): RunVal {
    let cnode = (wloop.condition as BinaryExpr)
    while ((evalCond(evaluate(cnode.left, env), evaluate(cnode.right, env), 
    cnode.operator) as BoolVal).value == true) {
        let result: RunVal = INull();
        const scope = new Environment(env);
        for (const stmt of wloop.body) {
            result = evaluate(stmt, scope);
        }
    } 

    return {type: "null", value: null} as NullVal;
}

//argument wloop is a FLoop.
export function evalFLoop(wloop: FLoop, env: Environment): RunVal {
    let version: string = (wloop.version)
    const scope = new Environment(env);
    if (version == "regular") {
        let index = evalDecl(wloop.assign as Declar, scope);
        let cond = (wloop.condition as BinaryExpr);
        if (index.type != "number") throw "For this type of foor loop declaration, the local variable must be assigned a number."
        while ((evalCond(evaluate(cond.left, scope), evaluate(cond.right, scope), 
        cond.operator) as BoolVal).value == true) {
            let result: RunVal = INull();
            for (const stmt of wloop.body) {
                result = evaluate(stmt, scope);
            }
            if (wloop.increment) result = evaluate(wloop.increment, scope);
        }
    } else if (version == "fixed") {
        let index = evaluate(wloop.condition, env) as NumberVal;
        let loops = 0;
        while (loops < index.value) {
            let result: RunVal = INull();
            for (const stmt of wloop.body) {
                result = evaluate(stmt, scope);
            }
            loops++;
        }
    }
    return {type: "null", value: null} as NullVal;
}

export function evalClass(cl: Class, env: Environment): RunVal {
    const scope = new Environment(env);
    let fields = new Map<string, RunVal>();
    let methods = new Array<CustomVal>();
    let ctors = new Array<CustomVal>();
    for (const field of cl.fields) {
        fields.set((field as Declar).identifier, evalDecl((field as Declar), scope));
    }
    for (const method of cl.methods) {
        methods.push(evalFunc((method as Function), scope) as CustomVal);
    }
    for (const ctor of cl.ctors) {
        let num = 0;
        ctors.push(evalCtor((ctor as Constructor), scope, cl.name, num) as CustomVal);
        num++;
    }
    env.declare(cl.name, {type: "class", fields, ctors, methods} as ClassVal, true);
    return {type: "class", fields, ctors, methods} as ClassVal;
    // const value = decl.value ? evaluate(decl.value, env) : INull();
    // return env.declare(decl.identifier, value, decl.constant);
}