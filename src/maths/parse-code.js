import array2obj from "../utils/array-2-obj";
import parseExpression from "./parse-expression";
import {addErrorContainer} from "./add-error";
import {REDEFINE_VAR} from "./error-types";


export default function parseCode(codeText, globalNamespace = {}) {
    let codeLines = typeof codeText === 'string' ? codeText.replace(/\r/g, '').split('\n') : codeText;

    let lines = codeLines.map(code => {
        let trimmed = code.trim();
        let expr = trimmed && parseExpression(trimmed) || null;
        return {
            code,
            expr
        }
    });

    let all = lines.map(({expr}) => expr).filter(expr => !!expr);

    let named = all.filter(({name}) => !!name);
    let unnamed = all.filter(({name}) => !name);

    let namespace = array2obj(named, (expr, i, array, namespace) => {
        if (namespace[expr.name]) {
            addErrorContainer(expr, {type: REDEFINE_VAR});
            return false;
        }
        return [expr.name, expr];
    });

    let ordered = [];


    return {lines, namespace, all, named, unnamed, ordered, globalNamespace};
}
