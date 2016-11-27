import {addErrorContainer} from "./utils/add-error";
import {UNKNOWN_VAR, CIRCULAR_DEP} from "./error-types";

export default function checkDependencies(scope, globalNamespace = {}) {
    let solved = new Set();
    let remaining = scope.named.map(e => e);
    let unknown = new Set();

    scope.all.forEach(expr => {
        expr.dependencies = [...new Set(expr.rhs.filter(({type}) => type === 'expr').map(({name}) => name))];
        expr.dependencies.forEach(name => {
            if (!scope.namespace[name] && !globalNamespace[name]) {
                addErrorContainer(expr, {type: UNKNOWN_VAR, name});
                unknown.add(name);
            }
        })
    });

    while (remaining.length > 0) {
        let updated = false;
        for (let i = remaining.length - 1; i >= 0; i--) {
            let v = remaining[i];
            let isSolved = v.dependencies
                .reduce((isSolved, dep) => isSolved && (solved.has(dep) || globalNamespace[dep] || unknown.has(dep)), true);
            if (isSolved) {
                remaining.splice(i, 1);
                solved.add(v.name);
                updated = true;
            }
        }

        if (!updated) {
            remaining.forEach(expr => {
                addErrorContainer(expr, {type: CIRCULAR_DEP});
            });
            break;
        }
    }

    scope.ordered = [...solved];

    return scope;
}