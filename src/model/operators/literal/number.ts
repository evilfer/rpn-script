import {CodeToken} from "../../code-token";
import {LiteralOperator} from "./literal";

export class NumberOperator extends LiteralOperator<number> {
    constructor(token: CodeToken) {
        super(token, "number", parseFloat(token.code));
    }
}
