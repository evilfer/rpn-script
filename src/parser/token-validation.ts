import {CodeToken} from "../model/code-token";
import {RpnError} from "../model/errors";

const VALID_REF_START_CHARS = "a-zA-Z_+\\-*\\/^$%!'";
const VALID_REF_CHARS = VALID_REF_START_CHARS + "0-9";
const VALID_REF_REGEX = new RegExp(`^[${VALID_REF_START_CHARS}][${VALID_REF_CHARS}]*$`);

const UNWRAP_REGEX = /^}([0-9]+:[0-9]+)?{$/;

const BOOLEAN_REGEX = /^(:?false|true)$/;

const NUMBER_REGEX = /^-?[0-9]+(\.[0-9]+)?$/;

const STRING_REGEX = /^"/;

const BASIC_RHS_TOKENS: { [key: string]: string } = {
    "(": "tupleOpen",
    ")": "tupleClose",
    ",": "sep",
    "[": "arrayOpen",
    "]": "arrayClose",
    "{": "wrapOpen",
    "}": "wrapClose",
};

export function validateRefToken(token: CodeToken): boolean {
    if (!token.code.match(VALID_REF_REGEX)) {
        token.errors.push(new RpnError("bad_ref"));
        return false;
    }

    return true;
}

export function validateRhsToken(token: CodeToken, namedArgs: string[]): boolean {
    if (BASIC_RHS_TOKENS[token.code]) {
        token.type = BASIC_RHS_TOKENS[token.code];
        return true;
    }

    if (token.code.match(BOOLEAN_REGEX)) {
        token.type = "boolean";
        return true;
    }

    if (token.code.match(UNWRAP_REGEX)) {
        token.type = "unwrap";
        return true;
    }

    if (token.code.match(NUMBER_REGEX)) {
        token.type = "number";
        return true;
    }

    if (token.code.match(STRING_REGEX)) {
        token.type = "string";
        return true;
    }

    if (namedArgs.indexOf(token.code) >= 0) {
        token.type = "arg";
        return true;
    }

    token.type = "ref";
    return validateRefToken(token);
}
