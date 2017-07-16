import {CodeToken} from "../../code-token";
import {LiteralOperator} from "./literal";

export class BooleanOperator extends LiteralOperator<boolean> {
    constructor(token: CodeToken) {
        super(token, "boolean", token.code === "true");
    }
}
