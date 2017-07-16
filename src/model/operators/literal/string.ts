import {CodeToken} from "../../code-token";
import {LiteralOperator} from "./literal";

export class StringOperator extends LiteralOperator<string> {
    constructor(token: CodeToken) {
        super(token, "string", token.code.substr(1, token.code.length - 2));
    }
}
