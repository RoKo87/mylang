// deno-lint-ignore-file

//may need to import ValueType and INull
import {RunVal, NumberVal, StringVal} from "./value.ts";
//may need to import NodeType
import {Assign, BinaryExpr, Call, Class, ClassObj, Compound, Condition, Declar, Element, FLoop, Function, Identifier, List, Logic, Member, Number, Object, Program, Stmt, Strit, Unary, WLoop} from "../front/ast.ts";
import Environment from "./environment.ts";
import { evalAssign, evalBinary, evalCall, evalClassObj, evalCompound, evalElement, evalId, evalList, evalLogic, evalMember, evalObject, evalUnary } from "./eval/expr.ts";
import { evalClass, evalCondStmt, evalDecl, evalFLoop, evalFunc, evalProgram, evalWLoop } from "./eval/stmt.ts";



export function evaluate (astNode: Stmt, env: Environment): RunVal {
    if (astNode == undefined) {
        throw `The interpreter encountered an undefined node ${astNode}.`
    }
    switch (astNode.kind) {
        case "Number":
            return {value: (astNode as Number).value, type: "number"} as NumberVal;
        case "String":
            return {value: (astNode as Strit).value, type: "string"} as StringVal;
        case "Identifier":
            return evalId(astNode as Identifier, env);
        case "Member":
            return evalMember(astNode as Member, env);
        case "Element":
            return evalElement(astNode as Element, env);
        case "List":
            return evalList(astNode as List, env);
        case "Binary":
            return evalBinary(astNode as BinaryExpr, env);
        case "Unary":
                return evalUnary(astNode as Unary, env);
        case "Logic":
                return evalLogic(astNode as Logic, env);
        case "Program":
            return evalProgram(astNode as Program, env);
        case "Assign":
            return evalAssign(astNode as Assign, env);
        case "Object":
            return evalObject(astNode as Object, env);
        case "Call":
            return evalCall(astNode as Call, env);
        case "Class":
            return evalClass(astNode as Class, env);
        case "Class Object":
            return evalClassObj(astNode as ClassObj, env);
        case "Compound Binary":
            return evalCompound(astNode as Compound, env);
        case "Condition":
            return evalCondStmt(astNode as Condition, env);
        case "Declar": 
            return evalDecl(astNode as Declar, env);
        case "Function": 
            return evalFunc(astNode as Function, env);
        case "WLoop": 
            return evalWLoop(astNode as WLoop, env);
        case "FLoop": 
            return evalFLoop(astNode as FLoop, env);
        default:
            console.error("The interpretation of this node is under construction...", astNode);
            throw "See above"
    
    }
}

