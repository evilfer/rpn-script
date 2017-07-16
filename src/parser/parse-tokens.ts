import {CodeToken} from "../model/code-token";
import {newCodeToken} from "../model/code-token";
import {RpnError} from "../model/errors";

const STRING_ESCAPED: string[] = ["\\\\n", '\\\\"', "\\\\\\\\", '"'];

const REGEX: RegExp = new RegExp(`(${STRING_ESCAPED.join("|")})`);

function findString(code: string): null | [string, string, boolean, string] {
    const index = code.indexOf('"');
    if (index < 0) {
        return null;
    }

    const prev = code.slice(0, index);
    let str = '"';
    let rest = code.slice(index + 1);
    let match;
    let ended = false;

    while (match = rest.match(REGEX)) {
        // $FlowFixMe
        const matchString = rest.slice(0, match.index) + match[0];
        str += matchString;
        rest = rest.slice(matchString.length);
        if (match[0] === '"') {
            ended = true;
            break;
        }
    }

    if (!ended) {
        str += rest;
        rest = "";
    }

    return [prev, str, ended, rest];
}

function parseOtherTokens(expr: string, exprPosition: number, tokens: CodeToken[]): void {
    const regex = /[^\s]+/g;
    let match;

    while (match = regex.exec(expr)) {
        // $FlowFixMe
        const index = match.index;

        splitSpecialTokens(match[0], exprPosition + index, tokens);
    }
}

function splitSpecialTokens(token: string, tokenPosition: number, tokens: CodeToken[]): void {
    let match;
    let remaining = token;

    while (match = remaining.match(/}([0-9]+:[0-9]+)?{|{|}|\)([0-9]+:[0-9]+)?\(|\(|\)|\[|]|,/)) {
        const index = match.index as number;
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

export default function parseTokens(expr: string): CodeToken[] {
    const tokens: CodeToken[] = [];
    let rest = expr;
    let stringFind;
    let restPosition = 0;

    while (stringFind = findString(rest)) {
        const [prev, string, ended, next] = stringFind;
        parseOtherTokens(prev, restPosition, tokens);
        const stringToken = newCodeToken(string, tokens.length, restPosition + prev.length);
        if (!ended) {
            stringToken.errors.push(new RpnError("unterminated_string"));
        }
        tokens.push(stringToken);
        restPosition += prev.length + string.length;
        rest = next;
    }

    parseOtherTokens(rest, restPosition, tokens);

    return tokens;
}
