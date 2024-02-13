import {Stmt, Function, Program, Expr, BinaryExpr, Number, Identifier, Declar, Assign, Property, Call, Member, Strit, Condition, WLoop, Object} from "./ast.ts";
import {tokenize, Token, TType, language} from "./lexer.ts";
import { langerr } from "./mode.ts";

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
        const identifier = this.expect(TType.Name, langerr(language, "e_varname")).value;

        //semicolon
        if (this.peek().type == TType.Semi) {
            this.pop();
            if (lc) 
                throw "Constant declaration must be assigned a value.";
            return {kind: "Declar", identifier, constant: false, value: undefined} as Declar;
        }

        this.expect(TType.Equals, "Expected assignment operator (=) in declaration.");
        const decl = {kind: "Declar", identifier, value: this.parseExpr(), constant: lc} as Declar;

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

    private parseExpr (): Expr {
        return this.parseAssign();
    }

    private parseAssign(): Expr {
        const left = this.parseObject();
        if (this.peek().type == TType.Equals) {
            this.pop();
            const right = this.parseAssign();
            return {value: right, to: left, kind: "Assign"} as Assign;
        }
        return left;
    }

    private parseObject(): Expr {
        if (this.peek().type != TType.OpenCB) {
            return this.parseCondExpr();
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
    
                this.expect(TType.Comma, "Expected comma or closing curly bracket in object assignment.")
            }
        }
        
        this.expect(TType.CloseCB, "Expected closing curly bracket (]) in assignment");
        return {kind: "Object", props} as Object;
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
        
        this.expect(TType.ClosePar, "Expected closing parenthesis that ends condition.");

        let body: Stmt[] = [];

        if (this.peek().value == "{") {
            this.pop();
            while (this.peek().value != "}") 
                body.push(this.parseStmt());
            this.pop() // pass }
        } else 
            body.push(this.parseStmt());
        
        }
        return left;
    }

    private parseAddExpr(): Expr {
        let left = this.parseMultExpr();

        while (this.peek().value == "+" || this.peek().value == "-") {
            const operator = this.pop().value;
            const right = this.parseMultExpr();
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
        let left = this.parseCME();

        while (this.peek().value == "*" || (this.peek().value == "/" || this.peek().value == "%")) {
            const operator = this.pop().value;
            const right = this.parsePrimaryExpr();
            left = {
                kind: "Binary",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }


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

        return call;
    }

    private parseArgs(): Expr[] {
        this.expect(TType.OpenPar, "Expected open parenthesis");
        const args = this.peek().type == TType.ClosePar ? [] : this.parseArgList();

        this.expect(TType.ClosePar, "Missing closing parenthesis for arguments");
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
        let object = this.parsePrimaryExpr();

        while(this.peek().type == TType.Dot || this.peek().type == TType.OpenSB) {
            const operator = this.pop();
            let property: Expr;
            let computed: boolean;

            if (operator.type == TType.Dot) {
                computed = false;
                property = this.parsePrimaryExpr();
                if (property.kind != "Identifier") {
                    throw `Cannot use dot operator without right hand side being an identifier`;
                }
            } else {
                computed = true;
                property = this.parseExpr();
                this.expect(TType.CloseSB, "Missing closing square bracket");
            }
            object = {kind: "Member", object, prop: property, computed} as Member;
        }
        return object;
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