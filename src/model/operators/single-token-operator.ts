import {CodeToken} from "../code-token";
import {Operator} from "./operator";

export abstract class SingleTokenOperator extends Operator {
    protected token: CodeToken;

    protected constructor(token: CodeToken) {
        super();
        this.token = token;
    }
}
