
import { language } from "./front/lexer.ts";
import { langerr, langget } from "./front/mode.ts";
import Parser from "./front/parser.ts";
import Environment, { gscope } from "./runtime/environment.ts";
import {evaluate} from "./runtime/interpreter.ts";
import * as fs from 'node:fs';

export const showParsing = false;
const showSyntax = true;
const showEval = false;

repl();
//may need to be async
function repl () {
    const parser = new Parser();
    const env : Environment = gscope();

    console.log("\n");
    try {
        // const input = prompt(" ");
        const input = fs.readFileSync("./text.txt", "utf-8");
        if (!input || input.includes("exit")) {
            Deno.exit(1);
        }
        console.log("\n" + langget(language, "PARSING") + ":");
        if (input) {
            const program = parser.produceAST(input);
            if (showSyntax) { console.log("\nSYNTAX TREE:"); console.log(program); }

            console.log("\n" + langget(language, "OUTPUT") + ":");
            const result = evaluate(program, env);

            console.log("\n" + langget(language, "EVALUATION") + ":")
            if (showEval) console.log(result);
            else console.log(langerr(language, "a_runsuccess"));
            // console.log(result.value);
            console.log("\n\n");
        }
    } catch (e) { console.log("ERROR: ", e) }
}
