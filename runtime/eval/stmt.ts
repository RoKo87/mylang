import { BinaryExpr, Condition, Declar, Function, Program, Stmt } from "../../front/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, CustomVal, INull, NullVal, RunVal } from "../value.ts";
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
    } else if (cond.else) {
        let result: RunVal = INull();
        const scope = new Environment(env);
        for (const stmt of cond.ebody) {
            result = evaluate(stmt, scope);
        }
    }

    return {type: "null", value: null} as NullVal;
}