export type NodeType = 
    //STATEMENT
    | "Program" 
    | "Declar"
    | "Function"
    | "Condition"
    | "Logic"
    | "WLoop"
    | "FLoop"

    //VALUES
    | "Identifier" 
    | "Number" 
    | "Object"
    | "List"
    | "Property"
    | "String"

    //EXPRESSIONS
    | "Assign"
    | "Binary" 
    | "Call" 
    | "Compound Binary"
    | "Element"
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

export interface Logic extends Stmt {
    kind: "Logic";
    left: Expr;
    logic: string;
    right: Expr;
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

export interface FLoop extends Stmt {
    kind: "FLoop";
    assign?: Expr;
    condition: Expr;
    increment?: Expr;
    version: string;
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

export interface Unary extends Expr {
    kind: "Unary"
    operator: string;
    on: Expr;
    pre: boolean;
}

export interface Compound extends Expr {
    kind: "Compound Binary"
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

export interface List extends Expr {
    kind: "List",
    type: string,
    elements: Expr[];
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

export interface Element extends Expr {
    kind: "Element"
    list: Expr,
    index: Expr;
}

