import extend = require("extend");
import {Dependent, resolveDependencies} from "../deps/dependency-manager";
import {ExecNamespace} from "./exec/namespace";
import {Stack} from "./exec/stack";
import {Expression} from "./expression";

export interface ExecutedExpression {
    expr: Expression;
    result: null | Stack;
}

export class Sheet {

    public readonly exprLineMap: { [line: number]: ExecutedExpression };
    public readonly exprNameMap: { [name: string]: ExecutedExpression };

    private readonly lines: string[];
    private readonly namedExpressions: Array<Expression & Dependent>;
    private readonly sheetNamespace: { [name: string]: Expression };
    private readonly circular: null | string[];
    private readonly ordered: ExecutedExpression[];

    public constructor(private code: string) {
        this.lines = code.split(/\r?\n/);
        this.exprLineMap = {};
        this.exprNameMap = {};
        this.sheetNamespace = {};
        this.namedExpressions = [];
        this.ordered = [];

        const anonymousExpressions: ExecutedExpression[] = [];

        for (let i = 0; i < this.lines.length; i++) {
            if (this.lines[i].trim().length > 0) {
                const expr = new Expression(this.lines[i]);
                const exExpr = {expr, result: null};

                this.exprLineMap[i] = exExpr;
                if (expr.name !== null) {
                    this.namedExpressions.push(expr as (Expression & Dependent));
                    this.exprNameMap[expr.name] = exExpr;
                    this.sheetNamespace[expr.name] = expr;
                } else {
                    anonymousExpressions.push(exExpr);
                }
            }
        }

        const dependencies = resolveDependencies(this.namedExpressions);
        if (dependencies.circular.length > 0) {
            this.circular = dependencies.circular;
        } else {
            this.circular = null;

            dependencies.ordered.forEach(name => this.ordered.push(this.exprNameMap[name]));
            anonymousExpressions.forEach(expr => this.ordered.push(expr));
        }
    }

    public exec(namespace: ExecNamespace) {
        const fullNamespace = extend({}, namespace, this.sheetNamespace);
        this.ordered.forEach(exExpr => {
            exExpr.result = exExpr.expr.exec(fullNamespace);
        });
    }
}
