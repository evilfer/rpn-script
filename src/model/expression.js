// @flow

import type {TokenType} from './code-token';
import type {ExprArityType} from './operands/types';
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
import type {OperatorListType} from './base';
import ExprTypeCheckContext from './operands/expr-type-check-context';

export class Expression {
    errors: boolean;
    name: ?string;
    code: string;
    tokens: TokenType[];
    hash: string;
    namedArgs: string[];
    opsUseArgs: boolean;
    operators: OperatorListType;
    dependencies: string[];

    constructor(code: string) {
        this.errors = false;
        this.code = code;

        let tokens: TokenType[] = parseTokens(code);
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

    appliedOperators<T>(args: { [string]: T } = {}): OperatorListType {
        return this.opsUseArgs ? this.operators.map(op => op.applied(args)) : this.operators;
    }

    runTypeCheck(namespace: { [string]: ExprArityType } = {}): ExprTypeCheckContext {
        let context = new ExprTypeCheckContext();

        let args = this.namedArgs.reduce((acc, arg) => {
            acc[arg] = context.pop();
            return acc;
        }, {});

        let appliedOperators = this.appliedOperators(args);
        appliedOperators.forEach(op => op.runTypeCheck(context));

        return context;
    }
}

export class CodeSheet {
    errors: boolean;
    code: string;
    hashMap: {| [string]: Expression |};
    nameMap: {| [string]: Expression |};
    ordered: Expression[]
}
