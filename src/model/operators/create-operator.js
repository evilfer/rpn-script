// @flow

import {RpnError} from '../errors';
import type {TokenType} from '../code-token';
import type {OperatorListType} from './operator';
import {Operator} from './operator';
import {SINGLE_OPTS, MULTIPLE_OPTS} from './op-map';

const SEP_ALLOWED = {
    'arrayOpen': true,
    'tupleOpen': true,
    'wrapOpen': false
};

function parseCommaSep(tokens: TokenType[], sepAllowed: boolean): OperatorListType[] {
    let rest = tokens;
    let items: OperatorListType[] = [];

    while (rest.length > 0) {
        let index = rest.findIndex(({type}) => type === 'sep');
        let sepFound = index >= 0;

        if (sepFound && !sepAllowed) {
            rest[index].errors.push(new RpnError('not_allowed'));
        }

        let sepIndex = sepFound ? index : rest.length;
        let itemTokens = rest.slice(0, sepIndex);
        items.push(createOperators(itemTokens));
        rest = rest.slice(sepIndex + 1);
    }

    return items;
}

export function createOperators(rhs: TokenType[]): OperatorListType {
    let operators = [];

    for (let i = 0; i < rhs.length; i++) {
        let operator: ?Operator = null;
        let token = rhs[i];
        if (token.type) {
            let type: string = token.type;

            if (type === 'sep') {
                token.errors.push(new RpnError('not_allowed'));
            }

            if (SINGLE_OPTS[type]) {
                operator = new (SINGLE_OPTS[type])(token);
            } else if (token.match && MULTIPLE_OPTS[type]) {
                let closingIndex = rhs.indexOf(token.match);
                let tokens = rhs.slice(i, closingIndex + 1);
                operator = new (MULTIPLE_OPTS[type])(tokens, parseCommaSep(tokens.slice(1, -1), SEP_ALLOWED[type]));
                i = closingIndex;
            }
        }

        if (operator) {
            operators.push(operator);
        }
    }

    return operators;
}
