// @flow

import {SingleTokenOperator} from './operator';
import type {TokenType} from '../code-token';


export class RefOperator extends SingleTokenOperator {
    ref: string;

    constructor(token: TokenType) {
        super(token);
        this.ref = token.code;
    }
}
