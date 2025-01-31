// deno-lint-ignore-file

import {ErrorVal, FHVal, IBool, INative, INull, INum, ListVal, NumberVal, ObjVal, RunVal, StringVal} from "./value.ts";
import {Language, langget, LMap} from "../front/mode.ts";
import {language} from "../front/lexer.ts"
import { evaluate } from "./interpreter.ts";
import Parser from "../front/parser.ts";
import { Identifier, List, Strit } from "../front/ast.ts";
import * as fs from 'node:fs';



export function gscope() {
    const env = new Environment();
    //default global
    env.declare(langget(language, "true"), IBool(true), true);
    env.declare(langget(language, "false"), IBool(false), true);
    env.declare(langget(language, "null"), INull(), true);
    const parser = new Parser();

    //Math "method class"

    env.declare(langget(language, "sqrt"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.sqrt()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        return {type: "number", value: Math.sqrt(args[0].value)} as RunVal;
    }), true)

    env.declare(langget(language, "sin"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.sin()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: Math.sin(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "cos"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.cos()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: Math.cos(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "tan"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.tan()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: Math.tan(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "csc"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.csc()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: 1 / Math.sin(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "sec"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.sec()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: 1 / Math.cos(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "cot"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.cot()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: 1 / Math.tan(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "arcsin"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.arcsin()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: Math.asin(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "arccos"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.arccos()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: Math.acos(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "arctan"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function can only have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.arctan()' ?";
        if (args[0].type != "number") throw "This function must be input a number."
        let mode;
        let angle = args[0].value;
        if (args.length == 1) mode = 0; else mode = args[1].value;
        if (mode != 0 && mode != 1) throw "The second argument must either be 0 or 1."
        if (mode == 1) { angle *= Math.PI; angle /= 180;}
        return {type: "number", value: Math.atan(angle)} as RunVal;
    }), true);

    env.declare(langget(language, "log"), INative((args, scope, object) => {
        if (args.length != 2) throw "This function must have 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.log()' ?";
        if (args[0].type != "number") throw "This function must be input a number."

        let antilog = args[0].value; let base = args[1].value
        return {type: "number", value: Math.log(antilog) / Math.log(base)} as RunVal;
    }), true);

    env.declare(langget(language, "ln"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.ln()' ?";
        if (args[0].type != "number") throw "This function must be input a number."

        let antilog = args[0].value; 
        return {type: "number", value: Math.log(antilog)} as RunVal;
    }), true);

    env.declare(langget(language, "radToDeg"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.radToDeg()' ?";
        if (args[0].type != "number") throw "This function must be input a number."

        let ip = args[0].value; 
        return {type: "number", value: ip * (180/Math.PI)} as RunVal;
    }), true);

    env.declare(langget(language, "degToRad"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.degToRad()' ?";
        if (args[0].type != "number") throw "This function must be input a number."

        let ip = args[0].value; 
        return {type: "number", value: ip * (Math.PI/180)} as RunVal;
    }), true);

    env.declare(langget(language, "floor"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.floor()' ?";
        if (args[0].type != "number") throw "This function must be input a number."

        return INum(Math.floor(args[0].value));
    }), true);

    env.declare(langget(language, "random"), INative((args, scope, object) => {
        if (args.length < 0 || args.length > 2) throw "This function must have between 0 to 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.random()' ?";
        
        if (args.length == 0) return INum(Math.random());
        else if (args.length == 1 && args[0].type == "number") return INum(Math.random() * args[0].value);
        else if (args.length == 2 && args[0].type == "number" && args[1].type == "number") return INum(args[0].value + (Math.random() * (args[1].value - args[0].value)));
        else throw "The arguments passed in the function are not compatible.";
    }), true);

    env.declare(langget(language, "abs"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if ((object as Identifier).symbol != langget(language, "Math")) throw "Did you mean 'Math.abs()' ?";
        if (args[0].type != "number") throw "This function must be input a number."

        return INum(Math.abs(args[0].value));
    }), true);



    env.declare(langget(language, "Math"), 
        {type: "object", props:
            new Map<string, RunVal>([
                [langget(language, "pi"), env.declare(langget(language, "pi"), INum(Math.PI), true)],
                ["e", env.declare("e", INum(Math.E), true)],
            ])} as ObjVal, 
        true);

    //File "method class"
    env.declare(langget(language, "prepare"), INative((args, scope, object) => {
        if (args.length != 1 && args.length != 2) throw "This function must have 1 or 2 arguments.";
        if ((object as Identifier).symbol != langget(language, "File")) throw "Did you mean 'File.prepare()' ?";
        if (args[0].type != "string") throw "This function must be input a string for its first parameter.";
        let mode;
        if (args[1]) {
            if (args[1].type == "number" && args[1].value >= 0 && args[1].value <= 3) mode = args[1].value;
            else if (args[1].value == "r") mode = 0;
            else if (args[1].value == "w") mode = 1;
            else if (args[1].value == "a") mode = 2;
            else if (args[1].value == "rw") mode = 3;
        } else mode = 3;

        return {type: "file handler", mode, file: args[0].value, position: 0} as FHVal;
    }), true)

    env.declare(langget(language, "setMode"), INative((args, scope, object) => {
        if (args.length != 1) throw "This function must have 1 argument.";
        if (evaluate(object as Identifier, env).type != "file handler") throw "This must act as a member to a file handler.";
        if (args[0].type != "string" && args[0].type != "number") throw "This function must be input a string for its first parameter.";
        let mode;
        if (args[0]) {
            if (args[0].type == "number" && args[0].value >= 0 && args[0].value <= 3) mode = args[1].value;
            else if (args[0].value == "r") mode = 0;
            else if (args[0].value == "w") mode = 1;
            else if (args[0].value == "a") mode = 2;
            else if (args[0].value == "rw") mode = 3;
        } else mode = 3;

        env.assign((object as Identifier).symbol, {type: "file handler", mode, 
        file: (evaluate(object as Identifier, env) as FHVal).file,
        position: (evaluate(object as Identifier, env) as FHVal).position} as FHVal)
        return INull();
    }), true)

    env.declare(langget(language, "report"), INative((args, scope, object) => {
        if (args.length > 1) throw "This function must have at most 1 argument.";
        if (evaluate(object as Identifier, env).type != "file handler") throw "This must act as a member to a file handler.";
        if (args[0].type != "number" && args[0] != undefined) throw "Incorrect arguments for this function.";

        const fh = (evaluate(object as Identifier, env) as FHVal)
        const mode = fh.mode;
        const file = fh.file;
        const orpos = fh.position; //stands for original position
        const input = fs.readFileSync(file, "utf-8");
        const len = (args[0] == undefined) ? 1 : args[0].value;

        
        env.assign((object as Identifier).symbol, {type: "file handler", mode, file, position: orpos + len} as FHVal);
        return {type: "string", value: input.substring(orpos, orpos + len)} as StringVal;
    }), true)

    env.declare(langget(language, "close"), INative((args, scope, object) => {
        if (args.length != 0) throw "This function does not accept arguments.";
        if (evaluate(object as Identifier, env).type != "file handler") throw "This must act as a member to a file handler.";  

        env.remove((object as Identifier).symbol)
        return INull();
    }), true)

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
            if (args[1] != undefined && (type == langget(language, "Stack") || type ==  langget(language, "Queue")))
                throw `The arguments provided are not compatible with this data structure.`

            if (type == langget(language, "Set")) {
                if (position == undefined) position = {type: "number", value: arr.length} as NumberVal;
                arr.splice(position.value, 0, addend);
                let index = 0;
                for (const pushed of arr) {
                    if (pushed.value == addend.value && index != position.value) {
                        arr.pop();
                        break;
                    } else index++;
                }
            } else if (position != undefined) arr.splice(position.value, 0, addend);
            else arr.push(addend);
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

        //finds an index
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

        //reverse
    env.declare(langget(language, "reverse"), INative((args, scope, object) => {
        if (object == undefined) throw "This member function does not have an object.";
        if (args.length > 0) throw "This member function does not accept parameters.";
        let obj = evaluate(object, env);

        if (obj.type == "string") {
            let str = (evaluate(object, env) as StringVal).value
            return {type: "string", value: str.split('').reverse().join('') } as StringVal
        }
        else if (obj.type == "list") {
            let arrv = (obj as ListVal);
            let arr = arrv.elements;
            let lclass = arrv.class;
            return {type: "list", class: lclass, elements: arr.reverse()} as ListVal
        }
        else throw "This function only accepts strings and lists as the object."
        }), true)

        //substrings and sub-arrays
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

    env.declare(langget(language, "see"), INative((args, scope, object) => {
        if (object == undefined) throw "This member function does not have an object." ;
        if (args.length > 0) throw "This function does not accept parameters.";
        let obj = evaluate(object, env);
        if ((obj as ErrorVal).message == undefined) throw "This function only works with errors caught by a catch statement."
        let msg = (obj as ErrorVal).message;

        return {type: "string", value: msg} as StringVal
        }), true)

        //sort
    env.declare(langget(language, "sort"), INative((args, scope, object) => {
        if (object == undefined) throw "This member function does not have an object.";
        if (args.length > 0) throw "This member function does not accept parameters.";
        let obj = evaluate(object, env);

        if (obj.type == "string") {
            let str = (evaluate(object, env) as StringVal).value
            return {type: "string", value: str.split('').sort().join('') } as StringVal
        }
        else if (obj.type == "list") {
            let arrv = (obj as ListVal);
            let arr = arrv.elements;
            let lclass = arrv.class;
            return {type: "list", class: lclass, elements: arr.sort()} as ListVal
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
            console.log(value);
            throw `Variable ${name} already defined.`
        }
        this.variables.set(name, value);

        if (lc) {
            this.constants.add(name);
        }
        return value;
    }

    public remove (name: string): void {
        if (this.lookup(name) != undefined) {
            this.variables.delete(name);
            this.constants.delete(name);
        }
    }

    public getValue (name: string): RunVal {
        for (const k of this.variables) {
            if (k[0] == name) return k[1];
        }
        return INull();
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
            // console.log(this.variables);
            if (language == "spanish") {
                throw `La variable "${name}" no existe.`;
            }
            else {
                throw `Variable "${name}" does not exist`;
            }
        } else throw `An unspecified runtime error occured.`
    }
}
