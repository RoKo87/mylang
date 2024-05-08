// deno-lint-ignore-file

import { Stmt } from "../front/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "boolean" | "string" 
| "object" | "native" | "custom" | "list" | "class" | "constructor" | "class object" | "error" | "file handler";

export interface RunVal {
    type: ValueType;
    value?: any; //test line
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

export interface ErrorVal extends RunVal {
    type: "error",
    message: string;
    error_type: string | null;
}

export interface ClassVal extends RunVal {
    type: "class",
    fields: Map<string, RunVal>;
    ctors: CustomVal[];
    methods: CustomVal[];
}

export interface BoolVal extends RunVal {
    type: "boolean",
    value: boolean;
}

export interface ObjVal extends RunVal {
    type: "object",
    props: Map<string, RunVal>;
}

export interface ClassObjVal extends RunVal {
    type: "class object",
    class_value: ClassVal;
    fields: Map<string, RunVal>;
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

export interface CtorVal extends RunVal {
    type: "constructor";
    params: string[],
    envir: Environment;
    body: Stmt[];
}

export interface FHVal extends RunVal {
    type: "file handler";
    mode: number;
    file: string;
    position: number;
}



export function ICustom(call: FunCall) {
    return {type: "native", call} as NativeVal;
}
