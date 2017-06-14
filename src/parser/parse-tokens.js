// @flow

import type {TokenType} from '../model/code-token';
import {newCodeToken} from '../model/code-token';

const STRING_ESCAPED: string[] = ['\\\\n', '\\\\"', '\\\\\\\\', '"'];

const REGEX: RegExp = new RegExp(`(${STRING_ESCAPED.join('|')})`);

function findString(code: string): ?[string, string, boolean, string] {
    let index = code.indexOf('"');
    if (index < 0) {
        return null;
    }

    let prev = code.slice(0, index);
    let string = '"';
    let rest = code.slice(index + 1);
    let match;
    let ended = false;

    while (match = rest.match(REGEX)) {
        // $FlowFixMe
        let matchString = rest.slice(0, match.index) + match[0];
        string += matchString;
        rest = rest.slice(matchString.length);
        if (match[0] === '"') {
            ended = true;
            break;
        }
    }

    if (!ended) {
        string += rest;
        rest = '';
    }

    return [prev, string, ended, rest];
}


function parseOtherTokens(expr: string, exprPosition: number, tokens: TokenType[]): void {
    let regex = /[^\s]+/g;
    let match;

    while (match = regex.exec(expr)) {
        // $FlowFixMe
        let index = match.index;

        splitSpecialTokens(match[0], exprPosition + index, tokens);
    }
}

function splitSpecialTokens(token: string, tokenPosition: number, tokens: TokenType[]): void {
    let match;
    let remaining = token;

    while (match = remaining.match(/}([0-9]+:[0-9]+)?{|{|}|\)([0-9]+:[0-9]+)?\(|\(|\)|\[|]|,/)) {
        // $FlowFixMe
        let index = match.index;
        if (index > 0) {
            tokens.push(newCodeToken(remaining.slice(0, index), tokens.length, tokenPosition));
        }
        tokens.push(newCodeToken(match[0], tokens.length, tokenPosition + index));
        remaining = remaining.slice(index + match[0].length);
        tokenPosition += index + match[0].length;
    }

    if (remaining.length > 0) {
        tokens.push(newCodeToken(remaining, tokens.length, tokenPosition));
    }
}

export default function parseTokens(expr: string): TokenType[] {
    let tokens: TokenType[] = [];
    let rest = expr;
    let stringFind;
    let restPosition = 0;

    while (stringFind = findString(rest)) {
        let [prev, string, ended, next] = stringFind;
        parseOtherTokens(prev, restPosition, tokens);
        let stringToken = newCodeToken(string, tokens.length, restPosition + prev.length);
        if (!ended) {
            stringToken.errors.push(new Error('unterminated_string'));
        }
        tokens.push(stringToken);
        restPosition += prev.length + string.length;
        rest = next;
    }

    parseOtherTokens(rest, restPosition, tokens);

    return tokens;
}

