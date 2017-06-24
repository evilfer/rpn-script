// @flow

import {CodeToken} from './code-token';
import {createOperators} from './operators/create-operator';
import parseTokens from '../parser/parse-tokens';
import {
    splitTokens,
    analyzeName,
    analyzeNamedArgs,
    analyzeEq,
    analyzeRhs,
    analyzeMatchingTokens,
    analyzeDependencies
} from '../parser/analyze-tokens';
import {OperatorListType} from './base';
import {OperandType} from "./operands/operand-types";

export class Expression {
    errors: boolean;
    name: null | string;
    code: string;
    tokens: CodeToken[];
    hash: string;
    namedArgs: string[];
    opsUseArgs: boolean;
    operators: OperatorListType;
    dependencies: string[];

    constructor(code: string) {
        this.errors = false;
        this.code = code;

        let tokens: CodeToken[] = parseTokens(code);
        this.tokens = tokens;
        this.hash = tokens.map(({code}) => code).join(' ');

        let {lhs, rhs, eq} = splitTokens(tokens);
        analyzeEq(lhs, eq);

        this.name = analyzeName(lhs);
        this.namedArgs = analyzeNamedArgs(lhs, this.name).reverse();

        analyzeRhs(rhs, this.namedArgs);
        analyzeMatchingTokens(rhs);

        this.dependencies = analyzeDependencies(rhs, this.name, this.namedArgs);

        this.errors = tokens.some(token => token.errors.length > 0);

        if (!this.errors) {
            this.operators = createOperators(rhs);
            this.opsUseArgs = this.operators.some(op => op.requiresArgs());
            this.errors = tokens.some(token => token.errors.length > 0);
        }
    }

    appliedTypeOperators(args: { [key: string]: OperandType } = {}): OperatorListType {
        return this.opsUseArgs ? this.operators.map(op => op.appliedType(args)) : this.operators;
    }

    /*runTypeCheck(namespace: { [string]: ExprArityType } = {}): ExprTypeCheckContext {
        let context = new ExprTypeCheckContext();

        let args = this.namedArgs.reduce((acc, arg) => {
            acc[arg] = context.pop();
            return acc;
        }, {});

        let appliedOperators = this.appliedOperators(args);
        appliedOperators.forEach(op => op.runTypeCheck(context));

        return context;
    }*/
}