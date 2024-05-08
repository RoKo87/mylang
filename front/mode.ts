// deno-lint-ignore-file

export type Language = "regular" | "spanish" | "ht"



export const LMap: Record<Language, Record<string, string>> = {
    "regular": {
        "add": "add",
        "arcsin": "arcsin",
        "arccos": "arccos",
        "arctan": "arctan",
        "ask": "ask",
        "let": "let",
        "close": "close",
        "const": "const",
        "contains": "contains",
        "cos": "cos",
        "cot": "cot",
        "csc": "csc",
        "degToRad": "degToRad",
        "EVALUATION": "EVALUATION",
        "File": "File",
        "func": "func",
        "true": "true",
        "false": "false",
        "index": "index",
        "length": "length",
        "ln": "ln",
        "log": "log",
        "Math": "Math",
        "matches": "matches",
        "null": "null",
        "OUTPUT": "OUTPUT",
        "PARSING": "PARSING",
        "pi": "pi",
        "prepare": "prepare",
        "print": "print",
        "println": "println",
        "Queue": "Queue",
        "radtoDeg": "radtoDeg",
        "remove": "remove",
        "report": "report",
        "sec": "sec",
        "see": "see",
        "sin": "sin",
        "Stack": "Stack",
        "Set": "Set",
        "setMode": "setMode",
        "sub": "sub",
        "sqrt": "sqrt",
        "tan": "tan",
    },
    "spanish": {
        "add": "agrega",
        "arcsin": "arcsen",
        "arccos": "arccos",
        "arctan": "arctan",
        "ask": "pide",
        "close": "cierra",
        "let": "let", //not used
        "const": "const",
        "contains": "contiene",
        "cos": "cos",
        "cot": "cot",
        "csc": "csc",
        "degToRad": "gradARad",
        "EVALUATION": "EVALUACIÓN",
        "File": "Archivo",
        "func": "func",
        "true": "cierto",
        "false": "falso",
        "index": "índice",
        "length": "largo",
        "ln": "ln",
        "log": "log",
        "Math": "Matem",
        "matches": "empareja",
        "null": "nulo",
        "OUTPUT": "PRODUCCIÓN",
        "PARSING": "ANÁLISIS",
        "pi": "pi",
        "prepare": "prepara",
        "print": "imprime",
        "println": "imprimeln",
        "Queue": "Cola",
        "radtoDeg": "radAGrad",
        "remove": "quita",
        "report": "reporta",
        "sec": "sec",
        "see": "averigua",
        "sin": "sen",
        "Stack": "Pila",
        "Set": "Conjunto",
        "setMode": "ajustaModo",
        "sub": "sub",
        "sqrt": "rzc",
        "tan": "tan",
    },
    "ht": {
        "add": "add",
        "arcsin": "arcsin",
        "arccos": "arccos",
        "arctan": "arctan",
        "ask": "preesha",
        "let": "let", //not used
        "close": "byebye",
        "const": "const",
        "contains": "contains",
        "cos": "cos",
        "cot": "cot",
        "csc": "csc",
        "degToRad": "degToRad",
        "EVALUATION": "EVALUATION",
        "File": "File",
        "func": "lethimcook",
        "true": "tej",
        "false": "allen",
        "index": "index",
        "length": "length",
        "ln": "ln",
        "log": "log",
        "Math": "Math",
        "matches": "matches",
        "null": "LValue",
        "OUTPUT": "OUTPUT",
        "PARSING": "PARSING",
        "prepare": "lockin",
        "pi": "pi",
        "print": "huff",
        "println": "huffln",
        "Queue": "Queue",
        "radtoDeg": "radtoDeg",
        "remove": "gtfo",
        "report": "spitfax",
        "see": "peekaboo",
        "sin": "sin",
        "Stack": "Stack",
        "sec": "sec",
        "Set": "Set",
        "setMode": "setMode",
        "sub": "sub",
        "sqrt": "sqrt",
        "tan": "tan",
    }
}

export const EMap: Record<Language, Record<string, string>> = {
    "regular": {
        "a_parsesuccess": "Code parsed successfully :)",
        "a_runsuccess": "Code ran successfully. :D",
        "a_syntax": "Syntax error :(",
        "e_closecbf": "Expected closing curly brace to end function declaration.",
        "e_opencb": "Expected opening curly bracket.",
        "e_varname": "Expected variable name in declaration.",
        "funcname": "Expected function name following function keyword.",
        "funcparam": "Inside function declaration, expected parameter name.",
        "parse_exp": ", Expecting: ",
        "parse_rec": "Received: ",
    },
    "spanish": {
        "a_parsesuccess": "El código se analizó con éxito :)",
        "a_runsuccess": "El código se ejecutó con éxito. :D",
        "a_syntax": "Error de la sintaxis :(",
        "e_closecbf": "Esperando una llave terminanda (}), para terminar la declaración de la función.",
        "e_opencb": "Esperando una llave inicianda ({).",
        "e_varname": "Esperando el nombre de una variable.",
        "funcname": "Esperando el nombre de la función después de la palabra clave 'func'.",
        "funcparam": "Esperando el nombre de parámetro dentro de la declaración de la función",
        "parse_exp": ", Esperado: ",
        "parse_rec": "Recibido: ",
    },
     "ht": {
        "a_parsesuccess": "Code parsed successfully :)",
        "a_runsuccess": "Code ran successfully. :D",
        "a_syntax": "Syntax error :(",
        "e_closecbf": "Expected closing curly brace to end function declaration.",
        "e_opencb": "Expected opening curly bracket.",
        "e_varname": "Expected variable name in declaration.",
        "funcname": "Expected function name following function keyword.",
        "funcparam": "Inside function declaration, expected parameter name.",
        "parse_exp": ", Expecting: ",
        "parse_rec": "Received: ",
    }
}

export function langget(lang: Language, key: string): string {
    return LMap[lang][key];
}

export function langerr(lang: Language, key: string, spec?: string): string {
    return EMap[lang][key];
}
