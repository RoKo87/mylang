// deno-lint-ignore-file

import { BinaryExpr, Condition, Declar, FLoop, Function, Program, Stmt, WLoop } from "../../front/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, CustomVal, INull, NullVal, NumberVal, RunVal } from "../value.ts";
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
    // while ((evalCond(evaluate(cnode.left, env), evaluate(cnode.right, env), 
    // cnode.operator) as BoolVal).value == true) {
    //     let result: RunVal = INull();
    //     const scope = new Environment(env);
    //     for (const stmt of wloop.body) {
    //         result = evaluate(stmt, scope);
    //     }
    // } 

    return {type: "null", value: null} as NullVal;
}
