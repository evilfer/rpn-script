import splitTokens from "./split-tokens";
import {addError} from "./add-error";
import {MISSING_NAME, REPEAT_DEFINE, WRAP_IN_NAME, MISMATCHED_WRAP} from "./error-types";


function wrapLevel(tokens) {
    let level = 0;
    tokens.every(token => {
        if (token === '(') {
            level++;
        }
        if (token === ')') {
            level--;
            if (level < 0) {
                return false;
            }
        }
        return true;
    });
    return level;
}

function prepareRhs(rhs, wrappedList) {

    while (true) {
        let level = 0;
        let start = -1;
        let count = -1;

        for (let i = 0; i < rhs.length; i++) {
            let type = rhs[i].type;
            if (type === 'wo') {
                if (level === 0) {
                    start = i;
                }
                level++;
            } else if (type === 'wc') {
                if (level === 1) {
                    count = i - start + 1;
                    break;
                }
                level--;
            }
        }

        if (start < 0) {
            break;
        }

        let wrappedTokens = rhs.splice(start, count);
        wrappedTokens.shift();
        wrappedTokens.pop();
        prepareRhs(wrappedTokens, wrappedList);
        let index = wrappedList.length;
        let wrappedExpr = {rhs: wrappedTokens};
        wrappedList.push(wrappedExpr);
        rhs.splice(start, 0, {type: 'wrapped', index, expr: wrappedExpr});
    }
}


export default function parseExpression(code) {
    let errors = false;
    let parts = splitTokens(code);
    let assignIndex = parts.indexOf('=');
    let wrapped = [];

    if (assignIndex === 0) {
        errors = addError(errors, MISSING_NAME);
    }

    if (parts.indexOf('=', assignIndex + 1) >= 0) {
        errors = addError(errors, REPEAT_DEFINE);
    }

    let lhsTokens = parts.slice(0, Math.max(0, assignIndex));

    if (!lhsTokens.every(t => !t.match(/[()]/))) {
        errors = addError(errors, WRAP_IN_NAME);
    }

    let rhsTokens = parts.slice(assignIndex + 1);

    if (wrapLevel(rhsTokens) !== 0) {
        errors = addError(errors, MISMATCHED_WRAP);
    }

    let name = null;
    let args = [];
    let lhs = [];

    if (lhsTokens.length > 0) {
        lhs = lhsTokens.map((token, i) => i < lhsTokens.length - 1 ?
            {type: 'arg', name: token, code: token} :
            {type: 'name', code: token});
        name = lhsTokens[lhsTokens.length - 1];
        args = lhsTokens.splice(0, lhsTokens.length - 1);
    }

    let rhs = rhsTokens.map(token => {
        if (token === '(') {
            return {type: 'wo', code: token};
        }

        if (token === ')') {
            return {type: 'wc', code: token};
        }

        let unwrapMatch = token.match(/\)(([0-9]+):([0-9]+))?\($/);
        if (unwrapMatch) {
            let to = {type: 'unwrap', code: token};
            if (unwrapMatch[1]) {
                to.input = parseInt(unwrapMatch[2]);
                to.output = parseInt(unwrapMatch[3]);
            }
            return to;
        }

        let value = parseFloat(token);

        return isNaN(value) ?
            {type: args.indexOf(token) < 0 ? 'expr' : 'arg', name: token, code: token} :
            {type: 'number', value, code: token};
    });

    let tokens = [...lhs, ...(name ? [{type: 'assign', code: '='}] : []), ...rhs];

    if (!errors) {
        prepareRhs(rhs, wrapped);
    }


    return {name, args, rhs, lhs, errors, tokens, wrapped};
}