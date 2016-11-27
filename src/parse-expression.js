import parseTokens from "./utils/tokens";

export default function parseExpression(code) {
    let errors = false;
    let parts = code.split(/=/, 2).map(part => part.trim());
    let [lhsCode, rhsCode] = parts.length === 2 ? parts : [null, parts[0]];
    let name = null;
    let args = [];

    if (lhsCode) {
        let lhs = parseTokens(lhsCode);
        name = lhs[lhs.length - 1];
        args = lhs.splice(0, lhs.length - 1);
    }

    let rhs = parseTokens(rhsCode).map(token => {
        let value = parseFloat(token);
        return isNaN(value) ?
            {type: 'expr', name: token} :
            {type: 'value', value};
    });

    return {name, args, rhs, errors};
}