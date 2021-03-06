import {CodeToken} from "../model/code-token";
import {RpnError} from "../model/errors";
import {validateRefToken, validateRhsToken} from "./token-validation";

export function splitTokens(tokens: CodeToken[]): { lhs: CodeToken[], rhs: CodeToken[], eq: null | CodeToken } {
    const index = tokens.findIndex(({code}) => code === "=");
    return {
        eq: index >= 0 ? tokens[index] : null,
        lhs: index >= 0 ? tokens.slice(0, index) : [],
        rhs: tokens.slice(index + 1),
    };
}

export function analyzeName(lhs: CodeToken[]): null | string {
    if (lhs.length > 0) {
        const token = lhs[lhs.length - 1];
        validateRefToken(token);
        token.type = "name";
        return token.code;
    }

    return null;
}

export function analyzeNamedArgs(lhs: CodeToken[], name: null | string): string[] {
    const namedArgTokens = lhs.slice(0, -1);
    const namedArgs: string[] = [];

    namedArgTokens.forEach(token => {
        token.type = "namedArg";
        if (validateRefToken(token)) {
            if (token.code === name) {
                token.errors.push(new RpnError("arg_expr_name"));
            } else if (namedArgs.indexOf(token.code) >= 0) {
                token.errors.push(new RpnError("arg_repeated"));
            } else {
                namedArgs.push(token.code);
            }
        }
    });

    return namedArgs;
}

export function analyzeEq(lhs: CodeToken[], eq: null | CodeToken): boolean {
    if (eq) {
        eq.type = "eq";

        if (lhs.length === 0) {
            eq.errors.push(new RpnError("no_name"));
            return false;
        }
    }

    return true;
}

export function analyzeRhs(rhs: CodeToken[], namedArgs: string[]): void {
    rhs.forEach(token => {
        validateRhsToken(token, namedArgs);
    });
}

function sameConstructType(a: CodeToken, b: CodeToken): boolean {
    return a.type.substr(0, 1) === b.type.substr(0, 1);
}

export function analyzeMatchingTokens(rhs: CodeToken[]) {
    const levels: CodeToken[] = [];

    rhs.forEach(token => {
        switch (token.type) {
            case "wrapOpen":
            case "tupleOpen":
            case "arrayOpen":
                levels.push(token);
                break;
            case "wrapClose":
            case "tupleClose":
            case "arrayClose":
                const matchCandidate = levels.length > 0 && levels[levels.length - 1];
                if (matchCandidate && sameConstructType(token, matchCandidate)) {
                    matchCandidate.match = token;
                    token.match = matchCandidate;
                    levels.splice(-1, 1);
                } else {
                    token.errors.push(new RpnError("unmatched"));
                }
                break;
        }
    });

    levels.forEach(token => token.errors.push(new RpnError("unmatched")));
}

export function analyzeDependencies(rhs: CodeToken[], name: null | string, namedArgs: string[]): string[] {
    const dependencies: string[] = [];

    rhs.forEach(token => {
        const {type, code} = token;
        if (type === "ref") {
            if (code === name) {
                token.errors.push(new RpnError("self_ref"));
            } else if (namedArgs.indexOf(code) < 0 && dependencies.indexOf(code) < 0) {
                dependencies.push(code);
            }
        }
    });

    return dependencies;
}
