import {numberType, wrappedType, anyType, typeMatch} from "./stack-types";
import array2obj from "../utils/array-2-obj";


function applyExpression(from, {argIn, argOut}) {
    from.argIn.reverse().forEach(arg => {
        if (argOut.length > 0) {
            typeMatch(argOut.pop(), arg);
        } else {
            argIn.push(arg);
        }
    });
    from.argOut.forEach(arg => {
        argOut.push(arg);
    });
}
function evaluateRhsTokens({namespace, globalNamespace}, wrapped, argTypes, expr) {
    let {argIn, argOut} = expr;

    expr.rhs.forEach(({type, name, index}) => {
        switch (type) {
            case 'number':
                argOut.push(numberType());
                break;
            case 'arg':
                argOut.push(argTypes[name]);
                break;
            case 'wrapped':
                argOut.push(wrappedType(wrapped[index]));
                break;
            case 'unwrap':
                if (argOut.length > 0) {
                    let w = argOut.pop();
                    if (w.type === 'wrapped') {
                        applyExpression(w, expr);
                    }
                } else {
                    argIn.push(wrappedType());
                }
                break;
            case 'expr':
                let rel = namespace[name] || globalNamespace[name];
                applyExpression(rel, expr);
        }
    });
}

function identifyRhsType(scope, wrapped, argTypes, expr, popArgIn = []) {
    expr.argOut = [];
    expr.argIn = popArgIn;
    expr.argPop = popArgIn.length;

    evaluateRhsTokens(scope, wrapped, argTypes, expr);
}

export default function identifyTypes(scope) {
    let {ordered} = scope;

    ordered.forEach(expr => {
        if (!expr.errors) {
            let {args, wrapped} = expr;
            let argTypes = array2obj(args, arg => [arg, anyType()]);
            let popArgIn = args.map(arg => argTypes[arg]);

            wrapped.forEach(we => identifyRhsType(scope, wrapped, argTypes, we, []));
            identifyRhsType(scope, wrapped, argTypes, expr, popArgIn);
        }
    });

    return scope;
}
