export type NodeType = 
    //STATEMENT
    | "Program" 
    | "Declar"
    | "Function"
    | "Condition"
    | "WLoop"

    //VALUES
    | "Identifier" 
    | "Number" 
    | "Object"
    | "Property"
    | "String"

    //EXPRESSIONS
    | "Assign"
    | "Binary" 
    | "Call" 
    | "Member"
    | "Unary";


export interface Stmt {
    kind: NodeType;
}

export interface Program extends Stmt {
    kind: "Program";
    body: Stmt[];
}

export interface Declar extends Stmt {
    kind: "Declar";
    constant: boolean,
    identifier: string,
    value?: Expr;
}

export interface Condition extends Stmt {
    kind: "Condition";
    condition: Expr;
    body: Stmt[];
    else: boolean;
    ebody?: Stmt[];
}

export interface Function extends Stmt {
    kind: "Function";
    params: string[];
    name: string;
    body: Stmt[];
}

export interface WLoop extends Stmt {
    kind: "WLoop";
    condition: Expr;
    body: Stmt[];
}

export interface Expr extends Stmt {}

export interface Assign extends Expr {
    kind: "Assign",
    to: Expr,
    value: Expr,
}

export interface BinaryExpr extends Expr {
    kind: "Binary"
    left: Expr;
    right: Expr;
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier"
    symbol: string;
}

export interface Number extends Expr {
    kind: "Number"
    value: number;
}

export interface Strit extends Expr {
    kind: "String"
    value: string;
}

export interface Property extends Expr {
    kind: "Property"
    key: string,
    value?: Expr,
}

export interface Object extends Expr {
    kind: "Object"
    props: Property[];
}

export interface Call extends Expr {
    kind: "Call"
    args: Expr[];
    name: Expr;
}

export interface Member extends Expr {
    kind: "Member"
    object: Expr;
    prop: Expr;
    computed: boolean;
}

