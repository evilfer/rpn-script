import {addErrorContainer} from "./add-error";
import {DEPENDENCY_ERROR} from "./error-types";

export default function checkDependencyErrors({namespace, ordered}) {
    ordered.forEach(expr => {
        if (!expr.errors) {
            expr.dependencies.forEach(dep => {
                let depExpr = namespace[dep];
                if (depExpr && depExpr.errors) {
                    addErrorContainer(expr, {type: DEPENDENCY_ERROR, name: dep});
                }
            });
        }
    });
}
