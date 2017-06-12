// @flow
import {Error} from './errors';

import type {OperatorList} from './operator';
import type CodeToken from './code-token';
import {createOperators} from './operator';
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

export class Expression {
    errors: boolean;
    name: ?string;
    code: string;
    tokens: CodeToken[];
    hash: string;
    namedArgs: string[];
    operators: OperatorList;
    dependencies: string[];

    constructor(code: string) {
        this.errors = false;
        this.code = code;

        let tokens: CodeToken[] = parseTokens(code);
        this.tokens = tokens;
        this.hash = tokens.map(({code}) => code).join(' ');

        let {lhs, rhs, eq} = splitTokens(tokens);
        analyzeEq(lhs, eq);
        analyzeRhs(rhs);

        this.name = analyzeName(lhs);
        this.namedArgs = analyzeNamedArgs(lhs, this.name);

        analyzeMatchingTokens(rhs);

        this.dependencies = analyzeDependencies(rhs, this.name, this.namedArgs);

        this.errors = tokens.some(token => token.errors.length > 0);

        if (!this.errors) {
            this.operators = createOperators(rhs);
        }
    }
}

export class CodeSheet {
    errors: boolean;
    code: string;
    hashMap: {| [string]: Expression |};
    nameMap: {| [string]: Expression |};
    ordered: Expression[]
}
