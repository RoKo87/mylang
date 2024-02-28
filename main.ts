
import Parser from "./front/parser.ts";
import Environment, { gscope } from "./runtime/environment.ts";
import {evaluate} from "./runtime/interpreter.ts";
import * as fs from 'node:fs';

repl();
//may need to be async
function repl () {
    const parser = new Parser();
    const env : Environment = gscope();
    console.log("\nglombus is coming.");
    if (true) {
        // const input = prompt(" ");
        const input = fs.readFileSync("./text.txt", "utf-8");
        if (!input || input.includes("exit")) {
            Deno.exit(1);
        }
        console.log("\nPARSING:")
        if (input) {
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
}
