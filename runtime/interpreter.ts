import {ValueType, RunVal, NumberVal, INull, StringVal} from "./value.ts";
import {Assign, BinaryExpr, Call, Condition, Declar, Function, Identifier, NodeType, Number, Object, Program, Stmt, Strit} from "../front/ast.ts";
import Environment from "./environment.ts";
import { evalAssign, evalBinary, evalCall, evalId, evalObject } from "./eval/expr.ts";
import { evalCondStmt, evalDecl, evalFunc, evalProgram } from "./eval/stmt.ts";



export function evaluate (astNode: Stmt, env: Environment): RunVal {
    switch (astNode.kind) {
        case "Number":
            return {value: (astNode as Number).value, type: "number"} as NumberVal;
        case "String":
                return {value: (astNode as Strit).value, type: "string"} as StringVal;
        case "Identifier":
            return evalId(astNode as Identifier, env);
        case "Binary":
            return evalBinary(astNode as BinaryExpr, env);
        case "Program":
                return evalProgram(astNode as Program, env);
        case "Assign":
                return evalAssign(astNode as Assign, env);
        case "Object":
                return evalObject(astNode as Object, env);
        case "Call":
            return evalCall(astNode as Call, env);
        case "Condition":
                return evalCondStmt(astNode as Condition, env);
        case "Declar": 
            return evalDecl(astNode as Declar, env);
        case "Function": 
            return evalFunc(astNode as Function, env);
        default:
            console.error("The interpretation of this node is under construction...", astNode);
    
    }
}

