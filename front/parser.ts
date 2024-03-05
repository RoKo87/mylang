// deno-lint-ignore-file

import {Stmt, Function, Program, Expr, BinaryExpr, Number, Identifier, Declar, Assign, Property, Call, Member, Strit, Condition, WLoop, Object, Compound, FLoop, List, Element, Logic, Unary} from "./ast.ts";
import {tokenize, Token, TType, language} from "./lexer.ts";
import { langerr, langget } from "./mode.ts";

export default class Parser {

    private tokens: Token[] = [];

    private not_eof (): boolean {
        return this.tokens[0].type != TType.EOF;
    }

    private peek() {
        return this.tokens[0] as Token;
    }
    

    private pop() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(type: TType, err: any) {
        const prev = this.tokens.shift() as Token;
        console.log("In expect():           ",prev);
        if (!prev || prev.type != type) {
            console.error(langerr(language, "parser") + "\n", err, langerr(language, "parse_rec"), prev, langerr(language, "parse_exp"), type + "\n");
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
        
        while (this.not_eof()) {
            console.log("In produceAST():       ",this.peek());
            program.body.push(this.parseStmt());
        }

        return program;
    }

    private parseStmt (): Stmt {
        // skip to parse_expr
        let t = this.peek().type;
        switch (this.peek().type) {
            case TType.Let: 
            case TType.Const: return this.parseDecl();
            case TType.Function: return this.parseFunc();
            case TType.If: return this.parseCondition();
            case TType.While: return this.parseWLoop();
            case TType.For: return this.parseFLoop();
            default: return this.parseExpr();
        }
    }

    parseFunc(): Stmt {
        this.pop(); //eat keyword
        const name = this.expect(TType.Name, langerr(language, "funcname")).value;
        const args = this.parseArgs();
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

    parseDecl(): Stmt {
        const lc = this.pop().type == TType.Const;
        let type: string | undefined = undefined;
        //lists
        if (this.peek().type == TType.Colon) {
            this.pop(); //eat :
            let arg = this.pop()
            if (arg.type == TType.OpenSB) {
                if (this.pop().type == TType.CloseSB) type = "array";
            } else if (arg.type == TType.List) type = arg.value;
            // console.log(type);
        }
        const identifier = this.expect(TType.Name, langerr(language, "e_varname")).value;
       
        //semicolon
        if (this.peek().type == TType.Semi) {
            this.pop();
            if (lc) 
                throw "Constant declaration must be assigned a value.";
            return {kind: "Declar", identifier, constant: false, value: undefined} as Declar;
        } 

        this.expect(TType.Equals, "Expected assignment operator (=) in declaration.");
        let decl;
        if (type != undefined) 
            {decl = {kind: "Declar", identifier, value: this.parseList(type), constant: lc} as Declar;}
        else {decl = {kind: "Declar", identifier, value: this.parseExpr(), constant: lc} as Declar;}
        this.expect(TType.Semi, "Statement must end with semicolon");
        return decl;
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
        console.log("In parseCondition():    ", this.peek());
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
            assign = this.parseDecl();
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
        this.expect(TType.Comma, "Expected comma that separates statements in for loop initialization.");

        let increment: Expr;
        if (this.peek().value == (assign as Declar).identifier) {
            increment = this.parseAssign();
        } else throw "Invalid for loop step statement.";
        
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

    private parseExpr (): Expr {
        return this.parseAssign();
        this.expect(TType.Semi, "Statement must end with semicolon");
    }

    private parseAssign(): Expr {
        const left = this.parseCompound();
        if (this.peek().type == TType.Equals) {
            this.pop();
            const right = this.parseAssign();
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

            console.log("In parseObject():      ",this.peek());
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
        
        this.pop(); //pop [
        const elements = new Array<Expr>();

        while (this.not_eof() && this.peek().type != TType.CloseSB) {
            elements.push(this.parseCondExpr());
            if (this.peek().type != TType.CloseSB) {
                this.expect(TType.Comma, "Expected comma or closing curly bracket in assignment.")
            }
        }

        this.expect(TType.CloseSB, "Expected closing square bracket (]) in assignment");
        return {kind: "List", type, elements} as List;
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
            const operator = this.pop().value;
            const right = this.parseMultExpr();
            this.expect(TType.Semi, "Statement must end with semicolon");
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
            const right = this.parsePrimaryExpr();
            this.expect(TType.Semi, "Statement must end with semicolon");
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
        let call: Expr = { kind: "Call", name, args: this.parseArgs(), } as Call;
        if (this.peek().type == TType.OpenPar) {
            call = this.parseCall(call);
        }
        // if (this.pop().type != TType.ClosePar && this.peek().type != TType.Semi) 
        //     throw "Expected semicolon at the end of statement.";
        return call;
    }

    private parseArgs(): Expr[] {
        this.expect(TType.OpenPar, "Expected open parenthesis");
        const args = this.peek().type == TType.ClosePar ? [] : this.parseArgList();
        let end = this.peek().type == TType.ClosePar ? this.peek() : this.pop();
        if (end.type != TType.ClosePar) 
            throw "Missing closing parenthesis for arguments";
        this.pop();
        end = this.peek();
        if (end.type != TType.Semi && end.type != TType.ClosePar)
            throw "Expected a semicolon at the end";
        else if (end.type == TType.Semi) this.pop();
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
        console.log("In parsePrimaryExpr(): ",this.peek());
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
                console.error("Unexpected toxen found during parsing: ", this.peek());
                //Trick the compiler for TS
                Deno.exit(1);

        }
    }
}
