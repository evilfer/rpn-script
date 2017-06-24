import {SingleTokenOperator} from './operator';
import {CodeToken} from '../code-token';


export class RefOperator extends SingleTokenOperator {
    ref: string;

    constructor(token: CodeToken) {
        super(token);
        this.ref = token.code;
    }
}
