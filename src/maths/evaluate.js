import clone from "clone";
import {numberType, anyType, wrappedType} from "./stack-types";
import array2obj from "../utils/array-2-obj";
import range from "../utils/range";
import {addErrorContainer} from "./add-error";
import {BAD_TYPE} from "./error-types";

function applyNativeOperator(scope, expr, op) {
    let argCount = op.input.length;
    let args = argCount > 0 ? expr.output.splice(-argCount) : [];
    for (let i = args.length; i < argCount; i++) {
        let arg = numberType();
        expr.input.unshift(arg);
        args.unshift(arg);
    }

    let output = op.tx(args);
    output.forEach(item => expr.output.push(item));
    return true;
}


function assignCallNamespace(expr, callNamespace) {
    expr.callNamespace = callNamespace;
    if (expr.rhs) {
        expr.rhs.forEach(({type, expr}) => {
            if (type === 'wrapped') {
                assignCallNamespace(expr, callNamespace);
            }
        })
    }
}

function applyExprOperator(scope, expr, op) {
    let argCount = op.args.length;

    if (argCount > 0) {
        let args = expr.output.splice(-argCount);
        for (let i = args.length; i < argCount; i++) {
            let arg = anyType();
            expr.input.unshift(arg);
            args.unshift(arg);
        }

        op = clone(op);
        assignCallNamespace(op, array2obj(op.args, (argName, i) => [argName, args[i]]));
    }

    op.rhs.every(evaluateOperator.bind(null, scope, expr, op));
    return true;
}

function applyOperator(scope, expr, name) {
    let refExpr = scope.namespace[name] || scope.globalNamespace[name];
    if (refExpr.native) {
        return applyNativeOperator(scope, expr, refExpr);
    } else {
        return applyExprOperator(scope, expr, refExpr);
    }
}

function evaluateUnwrap(scope, expr) {
    if (expr.output.length === 0) {
        expr.input.unshift(wrappedType())
        expr.output.push(anyType());
        return true;
    }

    let operand = expr.output.pop();

    switch (operand.type) {
        case 'any':
            operand.type = 'wrapped';
            operand.expr = null;
            expr.output.push(anyType());
            return true;
        case 'wrapped':
            if (operand.expr) {
                operand.expr.rhs.every(evaluateOperator.bind(null, scope, expr, operand.expr));
            } else {
                expr.output.push(anyType());
            }

            return true;
        default:
            addErrorContainer(expr, BAD_TYPE);
            return false;
    }


}

function evaluateOperator(scope, expr, opOwner, token) {
    switch (token.type) {
        case 'number':
            expr.output.push({type: token.type, value: token.value});
            return true;
        case 'expr':
            return applyOperator(scope, expr, token.name);
        case 'arg':
            expr.output.push(opOwner.callNamespace[token.name]);
            return true;
        case 'wrapped':
            expr.output.push({
                type: token.type, expr: {
                    callNamespace: token.expr.callNamespace,
                    rhs: clone(token.expr.rhs),
                    input: clone(token.expr.input),
                    output: clone(token.expr.output)
                }
            });
            return true;
        case 'unwrap':
            return evaluateUnwrap(scope, expr);
    }
}

function evaluateExpressionOperators(scope, expr) {
    expr.rhs.every(evaluateOperator.bind(null, scope, expr, expr));
}

function evaluateExpression(scope, expr) {
    expr.input = range(expr.args.length).map(() => anyType());
    expr.output = [];

    assignCallNamespace(expr, array2obj(expr.args, (argName, i) => [argName, expr.input[i]]))

    expr.wrapped.forEach(we => {
        we.input = [];
        we.output = [];
        evaluateExpressionOperators(scope, we);
    });

    evaluateExpressionOperators(scope, expr);

    for (let i = expr.input.length; i < expr.args.length; i++) {
        expr.input.unshift(anyType());
    }
}

export default function evaluate(scope) {
    scope.ordered.forEach(evaluateExpression.bind(null, scope));
    return scope;
}
