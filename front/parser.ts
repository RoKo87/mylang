// deno-lint-ignore-file

import { showParsing } from "../main.ts";
import {Stmt, Function, Program, Expr, BinaryExpr, Number, Identifier, Declar, Assign, Property, Call, Member, Strit, Condition, WLoop, Object, Compound, FLoop, List, Element, Logic, Unary, Constructor, Class, ClassObj, ErrorHandler, Error, Case, Switcher, isExpr, canSkipSemi, Regex, Return, FH} from "./ast.ts";
import {tokenize, Token, TType, language} from "./lexer.ts";
import { langerr, langget } from "./mode.ts";

export default class Parser {

    private tokens: Token[] = [];
    private popped: Token[] = [];

    private not_eof (): boolean {
        return this.tokens[0].type != TType.EOF;
    }

    private peek() {
        return this.tokens[0] as Token;
    }
    

    private pop() {
        const prev = this.tokens.shift() as Token;
        this.popped.push(prev);
        return prev;
    }

    private expect(type: TType, err: any) {
        const prev = this.tokens.shift() as Token;
        if (showParsing) console.log("In expect():           ",prev); //optional log
        if (!prev || prev.type != type) {
            console.log("Syntax error :(")
            console.log(err, langerr(language, "parse_rec"), prev, langerr(language, "parse_exp"), type + "\n");
            console.log();
            Deno.exit(1);
        }
        return prev;
    }

    public produceAST (source: string): Program {
        this.tokens = tokenize(source);        
        const program: Program = {
            kind: "Program",
            body: [],
        };
        
        try {
        while (this.not_eof()) {
            if (showParsing) console.log("In produceAST():       ",this.peek());
            program.body.push(this.parseStmt());
        }
        } catch (e) { console.log("Syntax Error: ", e);}

        if (!showParsing) console.log(langerr(language, "a_parsesuccess"))
        return program;
    }

    private parseStmt (): Stmt {
        // skip to parse_expr
        if (showParsing) console.log("In parseStmt():        ",this.peek()); //optional log
        let t = this.peek().type;
        switch (this.peek().type) {
            case TType.Let: 
            case TType.Const: return this.parseDecl(true);
            case TType.Throw: return this.parseError(true);
            case TType.Class: return this.parseClass();
            case TType.Function: return this.parseFunc();
            case TType.Constructor: return this.parseCtor();
            case TType.If: return this.parseCondition();
            case TType.While: return this.parseWLoop();
            case TType.For: return this.parseFLoop();
            case TType.Try: return this.parseErrHand();
            case TType.Switch: return this.parseSwitcher();
            case TType.Return: return this.parseReturn();
            default: return this.parseExpr();
        }
    }

    parseFunc(): Stmt {
        this.pop(); //eat keyword
        const name = this.expect(TType.Name, langerr(language, "funcname")).value;
        const args = this.parseArgs(false);
        //double check
        const params: string[] = []; 
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                console.log(arg);
                throw langerr(language, "funcparam");
            }
            params.push((arg as Identifier).symbol);
        }

        this.expect(TType.OpenCB, langerr(language, "e_opencb"));

        const body: Stmt[] = [];

        while (this.peek().type !== TType.EOF && this.peek().type !== TType.CloseCB) {
            body.push(this.parseStmt());
        }

        this.expect(TType.CloseCB, langerr(language, "e_closecbf"));
        const fn = {body, name, params, kind: "Function"} as Function;

        return fn;

    }

    parseCtor(): Stmt {
        this.pop(); //eat "constructor"
        const args = this.parseArgs(false);
        //double check
        const params: string[] = []; 
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                console.log(arg);
                throw langerr(language, "funcparam");
            }
            params.push((arg as Identifier).symbol);
        }

        this.expect(TType.OpenCB, langerr(language, "e_opencb"));

        const body: Stmt[] = [];

        while (this.peek().type !== TType.EOF && this.peek().type !== TType.CloseCB) {
            body.push(this.parseStmt());
        }

        this.expect(TType.CloseCB, langerr(language, "e_closecbf"));
        const fn = {body, params, kind: "Constructor"} as Constructor;

        return fn;

    }

    parseReturn(): Stmt {
        this.pop(); //eat "return"
        let on = this.parseExpr();
        let ret =  {kind: "Return", on} as Return;
        this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing a Return Statement]");
        return ret;
    }

    parseDecl(semiReq : boolean): Stmt {
        const lc = this.pop().type == TType.Const;
        let type: string | undefined = undefined;
        let evalue;
        //lists
        if (this.peek().type == TType.Colon) {
            this.pop(); //eat :
            let arg = this.pop()
            if (arg.type == TType.OpenSB) {
                if (this.pop().type == TType.CloseSB) type = "array";
            } else if (arg.type == TType.List) type = arg.value;
            else if (arg.type == TType.FH) type = "FH";
            // console.log(type);
        }
        const identifier = this.expect(TType.Name, langerr(language, "e_varname")).value;
       
        //semicolon
        if (this.peek().type == TType.Semi && semiReq) {
            this.pop();
            if (lc) 
                throw "Constant declaration must be assigned a value.";
            return {kind: "Declar", identifier, constant: false, value: undefined} as Declar;
        } 

        this.expect(TType.Equals, "Expected assignment operator (=) in declaration.");
        let decl;
        if (type != undefined && type != "FH") 
            { decl = {kind: "Declar", identifier, value: this.parseList(type), constant: lc} as Declar;}
        else if (type == "FH") {
            decl = {kind: "Declar", identifier, value: this.parseFH(), constant: lc} as Declar;
        }
        else {
            evalue = this.parseExpr();
            decl = {kind: "Declar", identifier, value:evalue, constant: lc} as Declar;
        }
        if (semiReq && (decl.value as Stmt).kind != "Call" && this.popped[this.popped.length - 1].type != TType.Semi) { 
            this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing a Declaration]");
        }
        return decl;
    }

    parseError(semiReq : boolean): Stmt {
        this.pop(); //eats throw
        let message : string;
        let type : undefined | string;
        if (this.peek().type == TType.String) {
            message = this.pop().value;
        } else {
            type = this.pop().value;
            this.expect(TType.Comma, "Expected a comma.");
            message = this.pop().value;
        }

        if (semiReq) this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing a Throw Statement]");
        return {kind: "Error", type, message} as Error;
    }

    parseClass(): Stmt {
        this.pop(); //pop class
        const name = this.pop().value;
        this.expect(TType.Equals, "Expected an equals sign");
        this.expect(TType.OpenCB, "Expected an opening curly brace ({)");
        let fields = new Array<Declar>;
        let methods = new Array<Function>;
        let ctors = new Array<Constructor>;
        while (this.peek().type != TType.CloseCB) {
            let dec = this.parseStmt();
            if (dec.kind == "Declar") fields.push(dec as Declar);
            else if (dec.kind == "Function") methods.push(dec as Function);
            else if (dec.kind == "Constructor") ctors.push(dec as Constructor);
            if (showParsing) console.log("In parseClass():       ",this.peek());
        }
        this.expect(TType.CloseCB, "Expected closing culry brace (})"); //pop }
        return {kind: "Class", name, fields, ctors, methods} as Class;

    }

    parseCondition(): Stmt {
        this.pop() //eat keyword
        let condition: Expr;
        this.expect(TType.OpenPar, "Expected open parenthesis that begins condition.");
        if (this.peek().type == TType.Name || this.peek().type == TType.Number || this.peek().type == TType.String) {
            condition = this.parseCondExpr();
        }
        else {
            throw "Invalid conditional expression for if-statement."
        }
        if (showParsing) console.log("In parseCondition():   ", this.peek());
        this.expect(TType.ClosePar, "Expected closing parenthesis that ends condition.");

        let body: Stmt[] = [];

        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            body.push(this.parseStmt());
        
        let elseb = false;
        let ebody: Stmt[] = [];
        if (this.peek().type == TType.Else) {
            elseb = true;
            this.pop();
            if (this.peek().value == "{") {
                this.pop();
                while (this.peek().value != "}") 
                    ebody.push(this.parseStmt());
                this.pop() // pass }
            } else 
                ebody.push(this.parseStmt());
        }

        return { kind: "Condition", condition, body, else: elseb, ebody} as Condition;
    }

    parseWLoop (): Stmt {
        this.pop(); //eat keyword
        let condition: Expr;
        this.expect(TType.OpenPar, "Expected open parenthesis that begins condition.");
        if (this.peek().type == TType.Name || this.peek().type == TType.Number || this.peek().type == TType.String) {
            condition = this.parseCondExpr();
        } else {
            throw "Invalid conditional expression."
        }
        
        this.expect(TType.ClosePar, "Expected closing parenthesis that ends condition.");

        let body: Stmt[] = [];

        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            body.push(this.parseStmt());
            
        
        return {kind: "WLoop", condition, body} as WLoop;
    }

    parseFLoop (): Stmt {
        this.pop(); //eat keyword
        let assign: Expr;
        this.expect(TType.OpenPar, "Expected open parenthesis that begins condition.");
        if (this.peek().type == TType.Let) {
            assign = this.parseDecl(false);
        } else if (this.peek().type == TType.Number || this.peek().type == TType.Name) {
            let condition = this.parseExpr();
            this.expect(TType.ClosePar, "Expected closing parenthesis that ends for loop initialization.");
            let body: Stmt[] = [];

            if (this.peek().value == "{") {
                this.pop();
                while (this.peek().value != "}") 
                    body.push(this.parseStmt());
                this.pop() // pass }
            } else 
                body.push(this.parseStmt());
            return {kind: "FLoop", condition, version: "fixed", body} as FLoop;
        } 
        else throw "Must declare variable to initialize for loop.";
        this.expect(TType.Comma, "Expected comma that separates statements in for loop initialization.");
        let condition: Expr;
        if (this.peek().type == TType.Name || this.peek().type == TType.Number || this.peek().type == TType.String) {
            condition = this.parseCondExpr();
        } else {
            throw "Invalid conditional expression."
        }
        console.log("TKT<ATGL>EG");
        this.expect(TType.Comma, "Expected comma that separates statements in for loop initialization.");

        let increment: Expr;
        if (this.peek().value == (assign as Declar).identifier) {
            console.log("TKT<AL>GT");
            increment = this.parseAssign(false);
        } else {console.error("Invalid for loop step statement."); Deno.exit(1)}
        this.expect(TType.ClosePar, "Expected closing parenthesis that ends for loop initialization.");

        let body: Stmt[] = [];

        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            body.push(this.parseStmt());
        
        return {kind: "FLoop", assign, condition, increment, version: "regular", body} as FLoop;
    }

    parseErrHand(): Stmt {
        this.pop() //eat "try"

        let try_body: Stmt[] = [];

        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                try_body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            try_body.push(this.parseStmt());

        this.expect(TType.Catch, "A try statement must be matched with a catch statement.") //eat "catch"

        let catch_body: Stmt[] = [];

        let what;
        if (this.peek().type == TType.OpenPar) {
            this.pop();
            what = {kind: "Identifier", symbol: this.pop().value } as Identifier;
            this.expect(TType.ClosePar, "Expected closing parenthesis.");
        } 
        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                catch_body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            catch_body.push(this.parseStmt());

        return { kind: "Error Handler", try_body, what, catch_body} as ErrorHandler;
    }

    parseSwitcher(): Stmt {
        this.pop() //eat "switch"

        this.expect(TType.OpenPar, "Expected opening parenthesis");
        let value = this.parseExpr();
        this.expect(TType.ClosePar, "Expected closing parenthesis");

        this.expect(TType.OpenCB, "Expected opening curly bracket.");
        let finished = false;
        let cases = new Array<Case>
        while (!finished) {
            this.expect(TType.Case, "Expected keyword 'case'.");
            cases.push(this.parseCase());
            if (this.peek().type == TType.CloseCB) finished = true;
        }
        this.expect(TType.CloseCB, "Expected closing curly bracket.");

        return { kind: "Switcher", value, cases} as Switcher;
    }

    private parseCase(): Case {
        let name = this.peek();
        let value;
        let def = false;
        if (this.peek().type != TType.Default) {
            value = this.parseExpr();
        } else { 
            this.pop();
            def = true;
        }
        this.expect(TType.Colon, "Expected a colon.");

        let body: Stmt[] = [];

        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            body.push(this.parseStmt());

        return {kind: "Case", value, def, body} as Case;
    }

    private parseExpr (): Expr {
        if (showParsing) console.log("In parseExpr():        ",this.peek());
        if (this.peek().type == TType.New) return this.parseClassObj();
        else return this.parseAssign(true);
        this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing an Expression]");
    }

    private parseClassObj(): Expr {
        this.pop(); //pop "new"
        const cname = this.pop().value;
        const args = this.parseArgs(false);
        return {kind: "Class Object", cname, args} as ClassObj

    }

    private parseAssign(semiReq : boolean): Expr {
        const left = this.parseCompound();
        if (this.peek().type == TType.Equals) {
            this.pop();
            const right = this.parseAssign(false);
            if (semiReq) this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing an Assignment]");
            return {value: right, to: left, kind: "Assign"} as Assign;
        }
        return left;
    }

    private parseCompound(): Expr {
        let left = this.parseObject();
        while (this.peek().value == "+=" || this.peek().value == "-=" || this.peek().value == "*="
        || this.peek().value == "/=" || this.peek().value == "%=") {
            const operator = this.pop().value;
            const right = this.parseObject();
            if (left.kind != "Identifier") 
                throw "The left-hand side of a compound binary expression must be a variable.";
                this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing an Compound]");
                left = {
                kind: "Compound Binary",
                left,
                right,
                operator,
            } as Compound;
        }

        return left;
    }

    private parseObject(): Expr {
        if (this.peek().type != TType.OpenCB) {
            return this.parseList("array");
        }    

        this.pop();
        const props = new Array<Property>();

        while (this.not_eof() && this.peek().type != TType.CloseCB) {
            const key = this.expect(TType.Name, "Expected key during object assignment").value;
            if (this.peek().type == TType.Comma) {
                this.pop();
                props.push({key, kind: "Property", value: undefined} as Property);
                continue;
            } else if (this.peek().type == TType.CloseCB) {
                props.push({key, kind: "Property", value: undefined} as Property);
                continue;
            }

            if (showParsing) console.log("In parseObject():      ",this.peek());
            this.expect(TType.Colon, "Missing colon following key in object assignment");
            const value = this.parseExpr();

            props.push({kind: "Property", value, key});
            if (this.peek().type != TType.CloseCB) {
    
                this.expect(TType.Comma, "Expected comma or closing curly bracket in assignment.")
            }
        }
        
        this.expect(TType.CloseCB, "Expected closing curly bracket (}) in assignment");
        return {kind: "Object", props} as Object;
    }

    private parseList(type: string): Expr {
        if (this.peek().type != TType.OpenSB) {
            return this.parseLogic();
        }
        if (showParsing) console.log("In parseList():        ", this.peek());
        this.pop(); //pop [
        
        const elements = new Array<Expr>();
        if (this.peek().type == TType.OpenSB) {
            elements.push(this.parseList("array"));
        }
        while (this.not_eof() && this.peek().type != TType.CloseSB) {
            if (this.peek().type != TType.Comma && this.peek().type != TType.OpenSB ) elements.push(this.parseCondExpr());
            if (this.peek().type == TType.OpenSB) {
                elements.push(this.parseList("array"));
            }
            if (this.peek().type != TType.CloseSB) {
                this.expect(TType.Comma, "Expected comma or closing curly bracket in assignment.")
            }
        }
        this.expect(TType.CloseSB, "Expected closing square bracket (]) in assignment");
        return {kind: "List", type, elements} as List;
    }

    private parseFH(): Expr {
        return {kind: "FH", call: this.parseExpr()} as FH;
    }

    private parseLogic(): Expr {
        let left = this.parseCondExpr();
        while (this.peek().value == "&" || this.peek().value == "|" ) {
            const logic = this.pop().value;
            const right = this.parseLogic();
            if ((left.kind != "Binary" && left.kind != "Logic" && left.kind != "Unary" && left.kind != "Number") && (left as Identifier).symbol != langget(language, "true") && (left as Identifier).symbol != langget(language, "false")) 
                throw "Invalid left-hand side of logic expression";
            left = {
                kind: "Logic",
                left,
                right,
                logic,
            } as Logic;
        }

        return left;
    }

    private parseCondExpr(): Expr {
        let left = this.parseAddExpr();

        while (this.peek().value == "==" || this.peek().value == "<" || this.peek().value == "<="  ||
        this.peek().value == ">" || this.peek().value == ">=" || this.peek().value == "!=" ) {
            const operator = this.pop().value;
            const right = this.parseAddExpr();
            left = {
                kind: "Binary",
                left,
                right,
                operator,
            } as BinaryExpr;
        }
       
        return left;
    }

    private parseAddExpr(): Expr {
        let left = this.parseMultExpr();
        while (this.peek().value == "+" || this.peek().value == "-") {
            if (showParsing) console.log("In parseAddExpr():     ",this.peek());
            const operator = this.pop().value;
            const right = this.parseMultExpr();
            // this.expect(TType.Semi, "Statement must end with semicolon [error source: Parsing an Additive Expression]");
            left = {
                kind: "Binary",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parseMultExpr(): Expr {
        let left = this.parsePreUnary();

        while (this.peek().value == "*" || (this.peek().value == "/" || this.peek().value == "%")) {
            const operator = this.pop().value;
            let right = this.parsePrimaryExpr();
            if (this.peek().type == TType.Dot) {
                this.pop();
                right = {kind: "Member", object: {kind: "Identifier", symbol: (right as Identifier).symbol} as Identifier, 
                prop: this.parsePrimaryExpr(), computed: false} as Member;
            }
            left = {
                kind: "Binary",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parsePreUnary(): Expr {
        let expr;
        if  (this.peek().type == TType.UnOp) {
            const operator = this.pop().value;
            const on = this.parsePrimaryExpr();
            expr = {kind: "Unary", on, operator, pre: true} as Unary;
        }
        else return this.parseCME();

        return expr;
    }

    //calls, members, and elements
    private parseCME(): Expr {
        const member = this.parseMember();

        if (this.peek().type == TType.OpenPar) {
            return this.parseCall(member);
        }

        return member;
    }

    private parseCall(name: Expr): Expr {
        let call: Expr = { kind: "Call", name, args: this.parseArgs(true), } as Call;
        if (showParsing) console.log("In parseCall():        ", this.peek()); //optional log
        if (this.peek().type == TType.OpenPar) {
            call = this.parseCall(call);
        }
        // if (this.pop().type != TType.ClosePar && this.peek().type != TType.Semi) 
        //     throw "Expected semicolon at the end of statement.";
        return call;
    }

    private parseArgs(semiReq: boolean): Expr[] {
        this.expect(TType.OpenPar, "Expected open parenthesis");
        const args = this.peek().type == TType.ClosePar ? [] : this.parseArgList();
        let end = this.peek().type == TType.ClosePar ? this.peek() : this.pop();
        if (end.type != TType.ClosePar) 
            throw "Missing closing parenthesis for arguments";
        this.pop();
        end = this.peek();
        if (end.type != TType.Semi && end.type != TType.ClosePar && end.type != TType.BinOp && semiReq)
            throw "Expected a semicolon at the end";
        else if (end.type == TType.Semi && semiReq) this.pop();
        return args;
    }

    private parseArgList(): Expr[] {
        const args = [this.parseExpr()];

        while (this.not_eof() && this.peek().type == TType.Comma && this.pop()) {
            args.push(this.parseExpr());
        }

        return args;
    }

    private parseMember(): Expr {
        let object = this.parseElement();
        let property; let computed;

        while(this.peek().type == TType.Dot) {
            const operator = this.pop();

            if (operator.type == TType.Dot) {
                computed = false;
                property = this.parsePrimaryExpr();
                if (property.kind != "Identifier") {
                    throw `Cannot use dot operator without right hand side being an identifier`;
                }
            }
            object = {kind: "Member", object, prop: property, computed} as Member;
        }
        return object;
    }

    private parseElement(): Expr {
        let list = this.parsePrimaryExpr();
        let index;
        if (this.peek().type == TType.OpenSB) {
            this.pop() //pop [
            index = this.parseExpr();
            this.expect(TType.CloseSB, "Expected closing square bracket (])");
            return {kind: "Element", list, index} as Element;
        }
        return list;
    }
    //Orders of Precedence
    // Assignment, Member, Function, Logical, Comparison, Additive, Mult, Unary, PrimaryExpr

    private parsePrimaryExpr(): Expr {
        if (showParsing) console.log("In parsePrimaryExpr(): ",this.peek()); //optional log
        const tk = this.peek().type;

        switch (tk) {
            case TType.Name:
                return {kind: "Identifier", symbol: this.pop().value} as Identifier;
            case TType.String:
                    return {kind: "String", value: this.pop().value} as Strit;
            case TType.Number:
                return {kind: "Number", value: parseFloat(this.pop().value)} as Number;
            case TType.OpenPar:
                this.pop();
                const value = this.parseExpr();
                this.expect(TType.ClosePar, "Unexpected token found inside parenthesis. Expected closing parenthesis.");
                return value;
            default:
                console.error("Syntax error :( \nUnexpected toxen found during parsing: ", this.peek(), "\n");
                //Trick the compiler for TS
                Deno.exit(1);

        }
    }
}
