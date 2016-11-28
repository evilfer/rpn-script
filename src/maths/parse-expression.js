import parseTokens from "./tokens";

function assignTokens(lhs) {
    return
}

export default function parseExpression(code) {
    let errors = false;
    let parts = code.split(/=/, 2).map(part => part.trim());
    let [lhsCode, rhsCode] = parts.length === 2 ? parts : [null, parts[0]];
    let name = null;
    let args = [];
    let lhs = [];

    if (lhsCode) {
        let lhsTokens = parseTokens(lhsCode);
        lhs = lhsTokens.map((token, i) => i < lhsTokens.length - 1 ?
            {type: 'arg', name: token, code: token} :
            {type: 'name', code: token});
        name = lhsTokens[lhsTokens.length - 1];
        args = lhsTokens.splice(0, lhsTokens.length - 1);
    }

    let rhs = parseTokens(rhsCode).map(token => {
        let value = parseFloat(token);
        return isNaN(value) ?
            {type: args.indexOf(token) < 0 ? 'expr' : 'arg', name: token, code: token} :
            {type: 'number', value, code: token};
    });

    let tokens = [...lhs, ...(name ? [{type: 'assign', code: '='}] : []), ...rhs];

    return {name, args, rhs, lhs, errors, tokens};
}