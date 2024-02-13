
import Parser from "./front/parser.ts";
import Environment, { gscope } from "./runtime/environment.ts";
import {evaluate} from "./runtime/interpreter.ts";
import { INull, INum, IBool } from "./runtime/value.ts";

repl();

async function repl () {
    const parser = new Parser();
    const env = gscope();
    console.log("\nLet's go!");
    while (true) {
        const input = prompt(" ");
        if (!input || input.includes("exit")) {
            Deno.exit(1);
        }
        console.log("\nPARSING:")
        const program = parser.produceAST(input);
        console.log("\nSYNTAX TREE:")
        console.log(program);

        console.log("\nOUTPUT:")
        const result = evaluate(program, env);

        console.log("\nEVALUATION:")
        console.log(result);
        // console.log(result.value);
        console.log("\n\n");
    }
}