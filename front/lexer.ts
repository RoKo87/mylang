// deno-lint-ignore-file

import { Language } from "./mode.ts";

export let language: Language = setLang(prompt("Set language: "));

function setLang(str: string | null): Language {
    if (str == "spanish") {
        return "spanish";
    } else return "ht";
}

export enum TType {
    
    //Value types
    Number,
    Name, //variable names
    String,

    //Operators and symbols
    OpenPar, ClosePar,
    OpenSB, CloseSB,
    OpenCB, CloseCB,
    BinOp, CompOp, LogOp, UnOp,
    Equals,

    Semi,
    Comma,
    Colon,
    Dot,

    //Keywords
    Const, Let, Class, New,
    Function, Constructor,
    If, Else, Switch, Case, Default,
    While, For,
    Try, Throw, Catch,

    //Data Structures
    List,

    EOF,
}


let KW: Record<string, TType> = {
    "var": TType.Let,
    "const": TType.Const,
    "func": TType.Function,
    "if": TType.If,
    "else": TType.Else,
    "while": TType.While,
    "for": TType.For,
    "class": TType.Class,
    "constructor": TType.Constructor,
    "new": TType.New,
    "try": TType.Try,
    "throw": TType.Throw,
    "catch": TType.Catch,
    "switch": TType.Switch,
    "case": TType.Case,
    "default": TType.Default,

    "Stack": TType.List,
    "Queue": TType.List,
    "Set": TType.List
}

if (language == "spanish") {
    KW = {
        "var": TType.Let,
        "const": TType.Const,
        "func": TType.Function,
        "si": TType.If,
        "sino": TType.Else,
        "mientras": TType.While,
        "por": TType.For,
        "clase": TType.Class,
        "crea": TType.New,
        "intenta": TType.Try,
        "echa": TType.Throw,
        "agarra": TType.Catch,
        "cambia": TType.Switch,
        "caso": TType.Case,
        "predet": TType.Default,

        "Pila": TType.List,
        "Cola": TType.List,
        "Conjunto": TType.List,
    }
}

else if (language == "ht") {
    KW = {
        "cook": TType.Let,
        "bake": TType.Const,
        "lethimcook": TType.Function,
        "bill": TType.If,
        "opp": TType.Else,
        "prakhar": TType.While,
        "george": TType.For,
        "megacook": TType.Class,
        "hudson": TType.New,
        "shreyas": TType.Try,
        "uhoh": TType.Throw,
        "ohno": TType.Catch,
        "player": TType.Switch,
        "bish": TType.Case,
        "mid": TType.Default,

        "Stack": TType.List,
        "Queue": TType.List,
        "Set": TType.List,
    }
}

//exporting the interface for the token
export interface Token {
    value: string, //every token has a string value
    type: TType,
}

function addToken (value = "", type: TType): Token {
    return {value, type};
}

function isAlpha (src: string) {
    return src.toUpperCase() != src.toLowerCase();
}

function isInt (src: string) {
    const c = src.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1]);
}

function isSkippable (str: string) {
    return str == ' ' || str == '\n' || str == '\t' || str == "\r";
}

export function tokenize (source:string): Token[] {
    const tokens = new Array<Token>();
    const src = source.split("");

    //Build each token until end of file
    while (src.length > 0) {
        if (src[0] == '(')
            tokens.push(addToken(src.shift(), TType.OpenPar));
        else if (src[0] == ')')
            tokens.push(addToken(src.shift(), TType.ClosePar));
        else if (src[0] == '[')
            tokens.push(addToken(src.shift(), TType.OpenSB));
        else if (src[0] == ']')
            tokens.push(addToken(src.shift(), TType.CloseSB));
        else if (src[0] == '{')
            tokens.push(addToken(src.shift(), TType.OpenCB));
        else if (src[0] == '}')
            tokens.push(addToken(src.shift(), TType.CloseCB));
        else if (src[0] == '&' || src[0] == '|')
            tokens.push(addToken(src.shift(), TType.LogOp));
        else if (src[0] == '+' || src[0] == '-' || src[0] == '*' || src[0] == '/' || src[0] == '%') {
            let op;
            if (src[0] == '+') op = '+';
            if (src[0] == '-') op = '-';
            if (src[0] == '*') op = '*';
            if (src[0] == '/') op = '/';
            if (src[0] == '%') op = '%';
            if (src[1] == '=') {
                src.shift(); src.shift();
                tokens.push(addToken(op + "=", TType.CompOp));
            }
            else if (src[0] != undefined && src[0] != undefined) {
                const op = src.shift();
                tokens.push(addToken(op, TType.BinOp));
            }
        }
        else if (src[0] == '=') {
            if (src[1] == '=') {
                tokens.push(addToken("==", TType.BinOp));
                src.shift(); src.shift();
            } else tokens.push(addToken(src.shift(), TType.Equals));
        }
        else if (src[0] == '>') {
            if (src[1] == '=') {
                tokens.push(addToken(">=", TType.BinOp));
                src.shift(); src.shift();
            } else tokens.push(addToken(src.shift(), TType.BinOp));
        }
        else if (src[0] == '<') {
            if (src[1] == '=') {
                tokens.push(addToken("<=", TType.BinOp));
                src.shift(); src.shift();
            } else tokens.push(addToken(src.shift(), TType.BinOp));
        }
        else if (src[0] == '!') {
            if (src[1] == '=') {
                tokens.push(addToken("!=", TType.BinOp));
                src.shift(); src.shift();
            } 
            else tokens.push(addToken(src.shift(), TType.UnOp));
        }
        else if (src[0] == ';')
            tokens.push(addToken(src.shift(), TType.Semi));
        else if (src[0] == ',')
            tokens.push(addToken(src.shift(), TType.Comma));
        else if (src[0] == '.')
            tokens.push(addToken(src.shift(), TType.Dot));
        else if (src[0] == ':')
            tokens.push(addToken(src.shift(), TType.Colon));
        else if (src[0] == "\"") {
            let str = "";
            src.shift();
            while (src[0] != "\"") {
                //escape sequences
                if (src[0] == "\\") {
                    if (src[1] == "\"") {
                        str += "\""
                    } else if (src[1] == "\\") {
                        str += "\\"
                    } else if (src[1] == "n") {
                        str += "\n"
                    }
                    src.shift(); src.shift();
                } else {
                    str += src.shift();
                }
            }
            src.shift();
            tokens.push(addToken(str, TType.String));
        }
        else {
            if (isInt(src[0])) {
                let num = "";
                while (src.length > 0 && isInt(src[0])) {
                    num += src.shift();
                }
                tokens.push(addToken(num, TType.Number));
            } else if (isAlpha(src[0])) {
                let ident = ""; //foo or let
                while (src.length > 0 && (isAlpha(src[0]) || isInt(src[0]))) {
                    ident += src.shift();
                }

                const reserved = KW[ident];
                if (reserved == undefined) 
                    tokens.push(addToken(ident, TType.Name));
                else 
                    tokens.push(addToken(ident, reserved));
            } else if (isSkippable(src[0])) {
                src.shift();
            } else {
                console.log("Unrecognized: ", src[0]);
                Deno.exit(1);
            }
        }
    }
    
    tokens.push({value: "EndOfFile", type: TType.EOF});
    return tokens;
}

// for (const token of tokenize(source));
