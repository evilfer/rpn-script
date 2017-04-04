import splitTokens from "./split-tokens";
import {addError} from "./add-error";
import {MISSING_NAME, REPEAT_DEFINE, WRAP_IN_NAME, MISMATCHED_WRAP, BAD_NAME} from "./error-types";


function wrapLevel(tokens) {
    let levels = [];
    return tokens.every(token => {
            switch (token) {
                case '(':
                    levels.push('w');
                    return true;
                case '[':
                    levels.push('a');
                    return true;
                case ')':
                    return levels.length > 0 && levels.pop() === 'w';
                case ']':
                    return levels.length > 0 && levels.pop() === 'a';
                default:
                    return true;
            }
        }) && levels.length;
}

function prepareRhs(rhs) {

    while (true) {
        let subExprType = null;
        let level = 0;
        let start = -1;
        let count = -1;

        for (let i = 0; i < rhs.length; i++) {
            let type = rhs[i].type;
            if (type === 'wo' || type === 'ao') {
                if (subExprType === null) {
                    subExprType = type;
                    start = i;
                }
                level++;
            } else if (type === 'wc' || type === 'ac') {
                if (level === 1) {
                    count = i - start + 1;
                    break;
                }
                level--;
            }
        }

        if (subExprType === null) {
            break;
        }

        let wrappedTokens = rhs.splice(start, count);
        wrappedTokens.shift();
        wrappedTokens.pop();

        if (subExprType === 'wo') {
            prepareRhs(wrappedTokens);
            rhs.splice(start, 0, {type: 'wrapped', rhs: wrappedTokens});
        } else if (subExprType === 'ao') {
            let parts = [[]];
            wrappedTokens.forEach(token => {
                if (token.type === 'as') {
                    parts.push([]);
                } else {
                    parts[parts.length - 1].push(token);
                }
            });

            parts.forEach(part => prepareRhs(part));
            rhs.splice(start, 0, {type: 'array', items: parts});
        }
    }
}


export default function parseExpression(code) {
    let errors = false;
    let parts = splitTokens(code);
    let assignIndex = parts.indexOf('=');

    if (assignIndex === 0) {
        errors = addError(errors, MISSING_NAME);
    }

    if (parts.indexOf('=', assignIndex + 1) >= 0) {
        errors = addError(errors, REPEAT_DEFINE);
    }

    let lhsTokens = parts.slice(0, Math.max(0, assignIndex));

    lhsTokens.forEach(t => {
        if (t.match(/[()[\]]/)) {
            errors = addError(errors, {type: WRAP_IN_NAME, name: t});
        } else if (t.match(/^[0-9]/)) {
            errors = addError(errors, {type: BAD_NAME, name: t});
        }
    });


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

        if (token === '[') {
            return {type: 'ao', code: token};
        }

        if (token === ']') {
            return {type: 'ac', code: token};
        }

        if (token === ',') {
            return {type: 'as', code: token};
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
        prepareRhs(rhs);
    }


    return {name, args, rhs, lhs, errors, tokens};
}