// deno-lint-ignore-file

import {IBool, INative, INull, INum, ListVal, NumberVal, RunVal, StringVal} from "./value.ts";
import {Language, langget, LMap} from "../front/mode.ts";
import {language} from "../front/lexer.ts"
import { evaluate } from "./interpreter.ts";
import Parser from "../front/parser.ts";
import { Identifier, List, Strit } from "../front/ast.ts";



export function gscope() {
    const env = new Environment();
    //default global
    env.declare(langget(language, "true"), IBool(true), true);
    env.declare(langget(language, "false"), IBool(false), true);
    env.declare(langget(language, "null"), INull(), true);
    const parser = new Parser();

    //native functions
    env.declare(langget(language, "print"), INative((args, scope) => {
        let str = "";
        for (const arg of args) 
            if (arg.type == "list") {
                str += "[";
                for (const el of (arg as ListVal).elements) str += (el.value + ", ");
                str = str.substring(0, str.length-2); str += "]";
            } else str += arg.value;
        console.log(str);
        return INull();
    }), true)

    env.declare(langget(language, "println"), INative((args, scope) => {
        for (let arg of args)
            if (arg.type == "list") {
                let str = "[";
                for (const el of (arg as ListVal).elements) str += (el.value + ", ");
                str = str.substring(0, str.length-2); str += "]";
                console.log(str);
            } else console.log(arg.value);
        return INull(); }), true)

    env.declare(langget(language, "ask"), INative((args, scope) => {
        if (args.length == 0) {
            throw `Must have a parameter for the ask() function.`;
        } else {
            if (args[0].value == undefined) throw "you suck boy";
            let pro = prompt(args[0].value);
            if (pro == null) pro = "null"
            return evaluate(parser.produceAST(pro) , scope); } 
    }), true) 

    env.declare(langget(language, "add"), INative((args, scope, object) => {
        let nlist;
        if (args.length == 0) {
            throw `Must have a parameter for the add() function.`;
        } else if (object == undefined || evaluate(object, env).type != "list") {
            throw `The add() function is only compatible with lists.`
        } else {
            let arr = (evaluate(object, env) as ListVal).elements; let addend = args[0];
            let position = (args[1])? (args[1] as NumberVal): undefined; let type = (evaluate(object, env) as ListVal).class;
            // console.log(type);
            if (args[1] != undefined && (type == langget(language, "Stack") || type ==  langget(language, "Queue")))
                throw `The arguments provided are not compatible with this data structure.`
            if (position == undefined || position.value == arr.length) { arr.push(addend);}
            else arr.splice(position.value, 0, addend);
            nlist = {type: "list", class: (evaluate(object, env) as ListVal).class, elements: arr} as ListVal;
            env.assign((object as Identifier).symbol, nlist)  
        } return INull(); }), true)

    env.declare(langget(language, "remove"), INative((args, scope, object) => {
        let nlist;
        if (object == undefined || evaluate(object, env).type != "list") {
            throw `This function is only compatible with lists.`
        } else {
            let arr = (evaluate(object, env) as ListVal).elements; 
            let position = (args[0])? (args[0] as NumberVal): undefined; let type = (evaluate(object, env) as ListVal).class;
            if (args[0] != undefined && (type == langget(language, "Stack") || type ==  langget(language, "Queue")))
                throw `The arguments provided are not compatible with this data structure.`
            let deleted : RunVal;
            if (position == undefined || position.value == arr.length - 1) { 
                deleted = arr[arr.length - 1];
                arr.splice(arr.length - 1, 1); 
            } else if (type == langget(language, "Queue")) {
                deleted = arr[0];
                arr.splice(0, 1);
            } else {
                deleted = arr[position.value];
                arr.splice(position.value, 1);
            }
            nlist = {type: "list", class: (evaluate(object, env) as ListVal).class, elements: arr} as ListVal;
            env.assign((object as Identifier).symbol, nlist)  
            return deleted 
        } }), true)
    
    env.declare(langget(language, "contains"), INative((args, scope, object) => {
        if (object == undefined) throw "This member function does not have an object."
        let obj = evaluate(object, env);
        if (obj.type == "string") {
            let str = (obj as StringVal).value;
            for (let i = 0; i < str.length + 1 - (args[0] as StringVal).value.length; i++) 
                if (str.substring(i, i+(args[0] as StringVal).value.length) == args[0].value) return IBool(true);
        }
        else if (obj.type == "list") {
            let arr = (obj as ListVal).elements;
            for (let x of arr) {
                if (args[0].value == x.value) return IBool(true);
            }
        }
        console.log(obj);
        if (obj.type != "string" && obj.type != "list") throw "This function only accepts strings and lists as the object."
        return IBool(false); }), true)

    env.declare(langget(language, "index"), INative((args, scope, object) => {
        if (object == undefined) throw "This member function does not have an object."
        let obj = evaluate(object, env);
        let position = (args[1])? (args[1] as NumberVal): INum(0);
        if (obj.type == "string") {
            let str = (obj as StringVal).value;
            for (let i = position.value; i < str.length + 1 - (args[0] as StringVal).value.length; i++) 
                if (str.substring(i, i+(args[0] as StringVal).value.length) == args[0].value) return INum(i);
        }
        else if (obj.type == "list") {
            let arr = (obj as ListVal).elements;
            for (let i = position.value; i < arr.length; i++)  {
                if (args[0].value == arr[i].value) return INum(i);
            }
        }
        console.log(obj);
        if (obj.type != "string" && obj.type != "list") throw "This function only accepts strings and lists as the object."
        return INum(-1); }), true)

    env.declare(langget(language, "sub"), INative((args, scope, object) => {
        if (object == undefined) throw "This member function does not have an object."
        let obj = evaluate(object, env);
        let beginning = (args[0] as NumberVal).value;
        let end = (args[1])? (args[1] as NumberVal).value: undefined;
        if (obj.type == "string") {
            let str =( evaluate(object, env) as StringVal).value
            return {type: "string", value: str.substring(beginning, end) } as StringVal
        }
        else if (obj.type == "list") {
            let arrv = (obj as ListVal);
            let arr = arrv.elements;
            let lclass = arrv.class;
            if (end == undefined) end = arr.length;
            return {type: "list", class: lclass, elements: arr.slice(beginning, end)} as ListVal
        }
        else throw "This function only accepts strings and lists as the object."
        }), true)

    return env;
}



export default class Environment {

    private parent?: Environment; 
    private variables: Map<string, RunVal>;
    private constants: Set<string>;

    constructor (parentE?: Environment) {
        const global = parentE ? true : false;
        this.parent = parentE;
        this.variables = new Map();
        this.constants = new Set();

    }


    public declare (name: string, value: RunVal, lc: boolean): RunVal {
        let env: Environment | undefined = undefined;
        try { env = this.resolve(name); }
        catch (e) { }
        if (env != undefined) {
            console.log(env);
            throw `Variable ${name} already defined.`
        }
        this.variables.set(name, value);

        if (lc) {
            this.constants.add(name);
        }
        return value;
    }

    public assign (name: string, value: RunVal): RunVal {
        const env = this.resolve(name);
        if (env.constants.has(name)) {
            throw `Constant ${name} cannot be reassigned.`;
        }
        env.variables.set(name, value);

        return value;
    }

    public lookup (name: string): RunVal {
        const env = this.resolve(name);
        // console.log("In lookup():  ", name);
        return env.variables.get(name) as RunVal;
    }

    //query a variable's environment
    public resolve (name: string): Environment {
        // console.log("In resolve(): ", "'", name, "'", this.variables.has(name));
        if (this.variables.has(name)) {
            return this;
        } else if (this.parent != undefined) {
            return this.parent.resolve(name);
        } else if (this.parent == undefined) {
            throw `Variable "${name}" doesn't exist`
        } else throw `An unspecified runtime error occured.`
    }
}
