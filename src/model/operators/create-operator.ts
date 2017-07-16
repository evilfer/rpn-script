import {CodeToken} from "../code-token";
import {RpnError} from "../errors";
import {MULTIPLE_OPTS, SINGLE_OPTS} from "./op-map";
import {Operator, OperatorList} from "./operator";

const SEP_ALLOWED: { [key: string]: boolean } = {
    arrayOpen: true,
    tupleOpen: true,
    wrapOpen: false,
};

function parseCommaSep(tokens: CodeToken[], sepAllowed: boolean): OperatorList[] {
    const items: OperatorList[] = [];
    let start = 0;
    let containerLevel = 0;

    for (let i = 0; i < tokens.length; i++) {
        const type = tokens[i].type || "";

        if (type.match(/(array|tuple|wrap)Open/)) {
            containerLevel++;
        } else if (type.match(/(array|tuple|wrap)Close/)) {
            containerLevel--;
        } else if (type === "sep" && containerLevel === 0) {
            const itemTokens = tokens.slice(start, i);
            items.push(createOperators(itemTokens));
            start = i + 1;

            if (!sepAllowed) {
                tokens[i].errors.push(new RpnError("not_allowed"));
            }
        }
    }

    if (start > 0 || tokens.length > 0) {
        const finalItemTokens = tokens.slice(start);
        items.push(createOperators(finalItemTokens));
    }

    return items;
}

export function createOperators(rhs: CodeToken[]): OperatorList {
    const operators = [];

    for (let i = 0; i < rhs.length; i++) {
        let operator: null | Operator = null;
        const token = rhs[i];
        if (token.type) {
            const type: string = token.type;

            if (type === "sep") {
                token.errors.push(new RpnError("not_allowed"));
            }

            if (SINGLE_OPTS[type]) {
                operator = SINGLE_OPTS[type](token);
            } else if (token.match && MULTIPLE_OPTS[type]) {
                const closingIndex = rhs.indexOf(token.match);
                const tokens = rhs.slice(i, closingIndex + 1);
                operator = MULTIPLE_OPTS[type](tokens, parseCommaSep(tokens.slice(1, -1), SEP_ALLOWED[type]));
                i = closingIndex;
            }
        }

        if (operator) {
            operators.push(operator);
        }
    }

    return operators;
}
