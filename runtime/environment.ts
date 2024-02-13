import {IBool, INative, INull, RunVal} from "./value.ts";
import {Language, langget, LMap} from "../front/mode.ts";
import {language} from "../front/lexer.ts"



export function gscope() {
    const env = new Environment();
    //default global
    env.declare(langget(language, "true"), IBool(true), true);
    env.declare(langget(language, "false"), IBool(false), true);
    env.declare(langget(language, "null"), INull(), true);

    env.declare(langget(language, "print"), INative((args, scope) => {
        let str = "";
        for (const arg of args)
            str += arg.value;
        console.log(str);
        return INull();
    }), true)

    env.declare(langget(language, "println"), INative((args, scope) => {
        for (const arg of args)
            console.log(arg.value);
        return INull();
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
        let env: Environment = undefined;
        try {
            env = this.resolve(name);
        }
        catch (e: Exception) {
            console.log("Error caught.")
        }
        if (env != undefined) {
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
        // console.log("In lookup():  ", env);
        return env.variables.get(name) as RunVal;
    }

    //query a variable's environment
    public resolve (name: string): Environment {
        // console.log("In resolve(): ", "'", name, "'", this.variables.has(name));
        if (this.variables.has(name)) {
            return this;
        } else if (this.parent != undefined) {
            return this.parent.resolve(name);
        } 

        if (this.parent == undefined) {
            throw `Variable "${name}" doesn't exist`
        }
    }

}