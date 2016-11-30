import splitTokens from "./split-tokens";



export default function parseExpression(code) {
    let errors = false;
    let parts = splitTokens(code);
    let assignIndex = parts.indexOf('=');
    let lhsTokens = parts.slice(0, Math.max(0, assignIndex));
    let rhsTokens = parts.slice(assignIndex + 1);

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

        let value = parseFloat(token);

        return isNaN(value) ?
            {type: args.indexOf(token) < 0 ? 'expr' : 'arg', name: token, code: token} :
            {type: 'number', value, code: token};
    });

    let tokens = [...lhs, ...(name ? [{type: 'assign', code: '='}] : []), ...rhs];

    return {name, args, rhs, lhs, errors, tokens};
}