import array2obj from "./utils/array-2-obj";
import parseExpression from "./parse-expression";

export default function parseCode(codeText, scopeTypes) {


    let lines = codeText
        .replace(/\r/g, '')
        .split('\n')
        .map(code => {
            let expr = code && parseExpression(code) || null;
            return {
                code,
                expr
            }
        });

    let all = lines.map(({expr}) => expr).filter(expr => !!expr);

    let named = all.filter(({name}) => !!name);
    let unnamed = all.filter(({name}) => !name);

    let namespace = array2obj(named, expr => {
        return [expr.name, expr];
    });

    let ordered = [];


    return {lines, namespace, all, named, unnamed, ordered};
}