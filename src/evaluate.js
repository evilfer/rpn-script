import {typed, typeNumber, typeWrapped, requestType, typeRepeat, typeArray} from "./stack-types";

function argPop(evaluation, type = 'any') {
    if (evaluation.output.length > 0) {
        let arg = evaluation.output.pop();
        requestType(arg, type);
        return arg;
    } else {
        let newArg = typed(type);
        evaluation.input.unshift(newArg);
        return newArg;
    }
}

function appliedRhsNested(rhs, map) {
    return rhs.map(token => {
        switch (token.type) {
            case 'wrapped':
                return {type: 'wrapped', rhs: appliedRhsNested(token.rhs, map)};
            case 'array':
                return {
                    type: 'array',
                    items: token.items.map(rhs => appliedRhsNested(rhs, map))
                };
            case 'arg':
                return {
                    type: 'arg',
                    name: token.name,
                    element: map[token.name]
                };
            default:
                return token;
        }
    });
}

function appliedRhs(expr, evaluation) {
    if (expr.args.length === 0) {
        return expr.rhs;
    }

    let argMap = {};
    for (let i = expr.args.length - 1; i >= 0; i--) {
        argMap[expr.args[i]] = argPop(evaluation);
    }

    return appliedRhsNested(expr.rhs, argMap);
}

export function createArrayFromRhs(scope, rhsList) {
    return typeArray(rhsList.map(rhs => createArrayItemFromRhs(scope, rhs)));
}
export function createArrayItemFromRhs(scope, rhs) {
    let item = {rhs, evaluation: {input: [], output: []}};
    applyRhs(scope, rhs, item.evaluation);
    return item;
}

export function applyRhs(scope, rhs, evaluation) {
    return rhs.every(token => {
        switch (token.type) {
            case 'number':
                evaluation.output.push(typeNumber(token.value));
                return true;
            case 'arg':
                evaluation.output.push(token.element);
                return true;
            case 'wrapped':
                evaluation.output.push(typeWrapped(token.rhs));
                return true;
            case 'expr':
                let refExpr = scope.namespace[token.name] || scope.globalNamespace[token.name];
                return applyExpression(scope, refExpr, evaluation);
            case 'array':
                evaluation.output.push(createArrayFromRhs(scope, token.items));
                return true;
            case 'unwrap':
                let wrapped = argPop(evaluation, 'wrapped');
                if (wrapped.value) {
                    return applyRhs(scope, wrapped.value, evaluation);
                } else {
                    if (typeof token.input !== 'undefined') {
                        let input = [];
                        for (let i = 0; i < token.input; i++) {
                            input.push(argPop(evaluation));
                        }
                        let output = typeRepeat(token.output);
                        wrapped.input = input;
                        wrapped.output = output;
                        output.forEach(arg => evaluation.output.push(arg));
                    } else {
                        evaluation.unknown = true;
                    }
                    return true;
                }
        }
    });
}

function applyExpression(scope, appliedExpr, evaluation) {
    if (appliedExpr.native) {
        let args = [];
        for (let i = appliedExpr.input.length - 1; i >= 0; i--) {
            args[i] = argPop(evaluation, appliedExpr.input[i].type);
        }
        let result = appliedExpr.tx(args, evaluation, scope);
        result.forEach(element => evaluation.output.push(element));
        return true;
    } else {
        let rhs = appliedRhs(appliedExpr, evaluation);
        return applyRhs(scope, rhs, evaluation);
    }
}

function evaluateExpression(scope, expr) {
    let evaluation = {
        input: [],
        output: []
    };
    expr.evaluation = evaluation;
    applyExpression(scope, expr, evaluation);
}

export default function evaluate(scope) {
    scope.ordered
        .filter(expr => !expr.errors)
        .forEach(evaluateExpression.bind(null, scope));
    return scope;
}

