// deno-lint-ignore-file

export type Language = "regular" | "spanish" | "ht"



export const LMap: Record<Language, Record<string, string>> = {
    "regular": {
        "add": "add",
        "ask": "ask",
        "let": "let",
        "const": "const",
        "contains": "contains",
        "EVALUATION": "EVALUATION",
        "func": "func",
        "true": "true",
        "false": "false",
        "index": "index",
        "length": "length",
        "Math": "Math",
        "matches": "matches",
        "null": "null",
        "OUTPUT": "OUTPUT",
        "PARSING": "PARSING",
        "print": "print",
        "println": "println",
        "Queue": "Queue",
        "remove": "remove",
        "see": "see",
        "Stack": "Stack",
        "Set": "Set",
        "sub": "sub",
        "sqrt": "sqrt",
    },
    "spanish": {
        "add": "agrega",
        "ask": "pide",
        "let": "let", //not used
        "const": "const",
        "contains": "contiene",
        "EVALUATION": "EVALUACIÓN",
        "func": "func",
        "true": "cierto",
        "false": "falso",
        "index": "índice",
        "length": "largo",
        "Math": "Matem",
        "matches": "empareja",
        "null": "nulo",
        "OUTPUT": "PRODUCCIÓN",
        "PARSING": "ANÁLISIS",
        "print": "imprime",
        "println": "imprimeln",
        "Queue": "Cola",
        "remove": "quita",
        "see": "averigua",
        "Stack": "Pila",
        "Set": "Conjunto",
        "sub": "sub",
        "sqrt": "rzc",
    },
    "ht": {
        "add": "add",
        "ask": "preesha",
        "let": "let", //not used
        "const": "const",
        "contains": "contains",
        "EVALUATION": "EVALUATION",
        "func": "lethimcook",
        "true": "tej",
        "false": "allen",
        "index": "index",
        "length": "length",
        "Math": "Math",
        "matches": "matches",
        "null": "LValue",
        "OUTPUT": "OUTPUT",
        "PARSING": "PARSING",
        "print": "huff",
        "println": "huffln",
        "Queue": "Queue",
        "remove": "gtfo",
        "see": "peekaboo",
        "Stack": "Stack",
        "Set": "Set",
        "sub": "sub",
        "sqrt": "sqrt",
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
