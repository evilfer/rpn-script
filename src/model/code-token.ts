import {RpnError} from './errors';

export interface TokenType {
    code: string,
    index: number,
    position: number,
    errors: RpnError[],
    type: null | string,
    match: null | TokenType
};

export function newCodeToken(code: string, index: number, position: number): TokenType {
    return {code, index, position, errors: [], type: null, match: null};
}
