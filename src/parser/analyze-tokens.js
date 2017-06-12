// @flow
import type CodeToken from '../model/code-token';
import {Error} from '../model/errors';
import {validateRefToken, validateRhsToken} from './token-validation';

export function splitTokens(tokens: CodeToken[]): {| lhs: CodeToken[], rhs: CodeToken[], eq: ?CodeToken |} {
    let index = tokens.findIndex(({code}) => code === '=');
    return {
        lhs: index >= 0 ? tokens.slice(0, index) : [],
        rhs: tokens.slice(index + 1),
        eq: index >= 0 ? tokens[index] : null
    };
}

export function analyzeName(lhs: CodeToken[]): ?string {
    if (lhs.length > 0) {
        let token = lhs[lhs.length - 1];
        validateRefToken(token);
        token.type = 'name';
        return token.code;
    }

    return null;
}

export function analyzeNamedArgs(lhs: CodeToken[], name: ?string): string[] {
    let namedArgTokens = lhs.slice(0, -1);
    let namedArgs = [];

    namedArgTokens.forEach(token => {
        token.type = 'namedArg';
        if (validateRefToken(token)) {
            if (token.code === name) {
                token.errors.push(new Error('arg_expr_name'));
            } else if (namedArgs.indexOf(token.code) >= 0) {
                token.errors.push(new Error('arg_repeated'));
            } else {
                namedArgs.push(token.code);
            }
        }
    });

    return namedArgs;
}

export function analyzeEq(lhs: CodeToken[], eq: ?CodeToken): boolean {
    if (eq) {
        eq.type = 'eq';

        if (lhs.length === 0) {
            eq.errors.push(new Error('no_name'));
            return false;
        }
    }

    return true;
}


export function analyzeRhs(rhs: CodeToken[]): void {
    rhs.forEach(token => {
        validateRhsToken(token);
    });
}


function sameConstructType(a: CodeToken, b: CodeToken): boolean {
    return a.type.substr(0, 1) === b.type.substr(0, 1);
}

export function analyzeMatchingTokens(rhs: CodeToken[]) {
    let levels = [];

    rhs.forEach(token => {
        switch (token.type) {
            case 'wrapOpen':
            case 'tupleOpen':
            case 'arrayOpen':
                levels.push(token);
                break;
            case 'wrapClose':
            case 'tupleClose':
            case 'arrayClose':
                let matchCandidate = levels.length > 0 && levels[levels.length - 1];
                if (matchCandidate && sameConstructType(token, matchCandidate)) {
                    matchCandidate.match = token;
                    token.match = matchCandidate;
                    levels.splice(-1, 1);
                } else {
                    token.errors.push(new Error('unmatched'));
                }
                break;
        }
    });

    levels.forEach(token => token.errors.push(new Error('unmatched')));
}

export function analyzeDependencies(rhs: CodeToken[], name: ?string, namedArgs: string[]) {
    let dependencies = [];

    rhs.forEach(token => {
        let {type, code} = token;
        if (type === 'ref') {
            if (code === name) {
                token.errors.push(new Error('self_ref'));
            } else if (namedArgs.indexOf(code) < 0 && dependencies.indexOf(code) < 0) {
                dependencies.push(code);
            }
        }
    });

    return dependencies;
}
