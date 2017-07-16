import {CodeToken} from "../../code-token";
import {SingleTokenOperator} from "../single-token-operator";

export abstract class AppliedArgOperator<T> extends SingleTokenOperator {
    public operand: T;

    constructor(token: CodeToken, operand: T) {
        super(token);
        this.operand = operand;
    }
}
