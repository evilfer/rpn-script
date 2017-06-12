import {Error} from './errors';

export type CodeToken = {|
    code: string,
    index: number,
    position: number,
    errors: Error[],
    type: ?string,
    match: ?CodeToken
|};

export function newCodeToken(code: string, index: number, position: number): CodeToken {
    return {code, index, position, errors: [], type: null, match: null};
}
