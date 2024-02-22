// deno-lint-ignore-file

export type Language = "regular" | "spanish"



export const LMap: Record<Language, Record<string, string>> = {
    "regular": {
        "add": "add",
        "ask": "ask",
        "let": "let",
        "const": "const",
        "contains": "contains",
        "func": "func",
        "true": "true",
        "false": "false",
        "index": "index",
        "length": "length",
        "null": "null",
        "print": "print",
        "println": "println",
        "Queue": "Queue",
        "remove": "remove",
        "Stack": "Stack",
        "sub": "sub",
    },
    "spanish": {
        "add": "agrega",
        "ask": "pide",
        "let": "let", //not used
        "const": "const",
        "contains": "contiene",
        "func": "func",
        "true": "cierto",
        "false": "falso",
        "index": "índice",
        "length": "largo",
        "null": "nulo",
        "print": "imprime",
        "println": "imprimeln",
        "Queue": "Cola",
        "remove": "quita",
        "Stack": "Pila",
        "sub": "sub",
    }
}

export const EMap: Record<Language, Record<string, string>> = {
    "regular": {
        "e_closecbf": "Expected closing curly brace to end function declaration.",
        "e_opencb": "Expected opening curly bracket.",
        "e_varname": "Expected variable name in declaration.",
        "funcname": "Expected function name following function keyword.",
        "funcparam": "Inside function declaration, expected parameter name.",
        "parser": "Parser error:",
        "parse_exp": ", Expecting: ",
        "parse_rec": "Received: ",
    },
    "spanish": {
        "e_closecbf": "Esperando una llave terminanda (}), para terminar la declaración de la función.",
        "e_opencb": "Esperando una llave inicianda ({).",
        "e_varname": "Esperando el nombre de una variable.",
        "funcname": "Esperando el nombre de la función después de la palabra clave 'func'.",
        "funcparam": "Esperando el nombre de parámetro dentro de la declaración de la función",
        "parser": "Error del analizador:",
        "parse_exp": ", Esperado: ",
        "parse_rec": "Recibido: ",
    }
}

export function langget(lang: Language, key: string): string {
    return LMap[lang][key];
}

export function langerr(lang: Language, key: string, spec?: string): string {
    return EMap[lang][key];
}
