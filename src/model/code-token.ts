import {RpnError} from "./errors";

export interface CodeToken {
    code: string;
    index: number;
    position: number;
    errors: RpnError[];
    type: string;
    match: null | CodeToken;
}

export function newCodeToken(code: string, index: number, position: number): CodeToken {
    return {code, index, position, errors: [], type: "", match: null};
}
