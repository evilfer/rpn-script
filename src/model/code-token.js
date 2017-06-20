// @flow

import {RpnError} from './errors';

export type TokenType = {|
    code: string,
    index: number,
    position: number,
    errors: RpnError[],
    type: ?string,
    match: ?TokenType
|};

export function newCodeToken(code: string, index: number, position: number): TokenType {
    return {code, index, position, errors: [], type: null, match: null};
}
