import {RpnError} from '../errors';
import {CodeToken} from '../code-token';
import {Operator} from '../base';
import {OperatorListType} from '../base';
import {SINGLE_OPTS, MULTIPLE_OPTS} from './op-map';

const SEP_ALLOWED: { [key: string]: boolean } = {
    'arrayOpen': true,
    'tupleOpen': true,
    'wrapOpen': false
};

function parseCommaSep(tokens: CodeToken[], sepAllowed: boolean): OperatorListType[] {
    let items: OperatorListType[] = [];
    let start = 0;
    let containerLevel = 0;

    for (let i = 0; i < tokens.length; i++) {
        let type = tokens[i].type || '';

        if (type.match(/(array|tuple|wrap)Open/)) {
            containerLevel++;
        } else if (type.match(/(array|tuple|wrap)Close/)) {
            containerLevel--;
        } else if (type === 'sep' && containerLevel === 0) {
            let itemTokens = tokens.slice(start, i);
            items.push(createOperators(itemTokens));
            start = i + 1;

            if (!sepAllowed) {
                tokens[i].errors.push(new RpnError('not_allowed'));
            }
        }
    }

    if (start > 0 || tokens.length > 0) {
        let finalItemTokens = tokens.slice(start);
        items.push(createOperators(finalItemTokens));
    }

    return items;
}

export function createOperators(rhs: CodeToken[]): OperatorListType {
    let operators = [];

    for (let i = 0; i < rhs.length; i++) {
        let operator: null | Operator = null;
        let token = rhs[i];
        if (token.type) {
            let type: string = token.type;

            if (type === 'sep') {
                token.errors.push(new RpnError('not_allowed'));
            }

            if (SINGLE_OPTS[type]) {
                operator = SINGLE_OPTS[type](token);
            } else if (token.match && MULTIPLE_OPTS[type]) {
                let closingIndex = rhs.indexOf(token.match);
                let tokens = rhs.slice(i, closingIndex + 1);
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
