import { Stmt } from "../front/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "boolean" | "string" 
| "object" | "native" | "custom" | "list";

export interface RunVal {
    type: ValueType;
}

export interface NullVal extends RunVal {
    type: "null",
    value: null;
}

export interface NumberVal extends RunVal {
    type: "number",
    value: number;
}

export interface StringVal extends RunVal {
    type: "string",
    value: string;
}

export interface BoolVal extends RunVal {
    type: "boolean",
    value: boolean;
}

export interface ObjVal extends RunVal {
    type: "object",
    props: Map<string, RunVal>;
}

export interface ListVal extends RunVal {
    type: "list",
    class: string,
    elements: RunVal[];
}

export function INum(n = 0) {
    return {type: "number", value: n} as NumberVal;
}

export function INull(_n = 0) {
    return {type: "null", value: null} as NullVal;
}

export function IBool(b = false) {
    return {type: "boolean", value: b} as BoolVal;
}

export type FunCall = (args: RunVal[], env: Environment, object?: Stmt) => RunVal;

export interface NativeVal extends RunVal {
    type: "native";
    call: FunCall;
}

export function INative(call: FunCall) {
    return {type: "native", call} as NativeVal;
}

export interface CustomVal extends RunVal {
    type: "custom";
    name: string,
    params: string[],
    envir: Environment;
    body: Stmt[];
}

export function ICustom(call: FunCall) {
    return {type: "native", call} as NativeVal;
}
