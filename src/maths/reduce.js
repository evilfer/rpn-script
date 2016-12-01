import array2obj from "../utils/array-2-obj";

function reduceToken(scope, expr, stack, localNamespace, token) {
    let {namespace, globalNamespace} = scope;

    switch (token.type) {
        case 'number':
            stack.push(token.value);
            return true;
        case 'wrapped':
            stack.push(token);
            return true;
            break;
        case 'arg':
            if (typeof localNamespace[token.name] === 'undefined') {
                return false;
            }
            stack.push(localNamespace[token.name]);
            return true;
        case 'unwrap':
            if (stack.length === 0) {
                return false;
            }
            let stackedExpr = stack.pop();
            return reduceTokens(scope, expr, stack, localNamespace, stackedExpr.expr.rhs);
        case 'expr':
            let refd = namespace[token.name] || globalNamespace[token.name];

            if (refd.reduced) {
                stack.push(refd.value);
                return true;
            }

            if (refd.argIn.length > stack.length) {
                return false;
            }

            let args = refd.argPop > 0 ? stack.splice(-refd.argPop) : [];
            if (refd.nativeImpl) {
                let tx = refd.nativeImpl.apply(null, args);
                for (let i = 0; i < refd.argOut.length; i++) {
                    stack.push(tx[i]);
                }
                return true;
            }

            if (refd.rhs) {
                let refdLocalNamespace = array2obj(refd.args, (argName, i) => [argName, args[i]]);
                return reduceTokens(scope, refd, stack, refdLocalNamespace, refd.rhs);
            }

            return false;
    }
}

function reduceTokens(scope, expr, stack, localNamespace, tokens) {
    return tokens.every(reduceToken.bind(null, scope, expr, stack, localNamespace));
}

export default function reduce(scope) {
    scope.ordered.forEach(expr => {
        if (!expr.errors) {
            let stack = [];

            expr.reduced = reduceTokens(scope, expr, stack, {}, expr.rhs) && stack.length === 1;
            expr.value = expr.reduced ? stack[0] : null;
        }
    });

    return scope
}