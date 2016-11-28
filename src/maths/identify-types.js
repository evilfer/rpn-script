import {numberType, anyType, typeMatch} from "./stack-types";
import array2obj from "../utils/array-2-obj";

export default function identifyTypes(scope) {
    let {ordered, namespace, globalNamespace} = scope;

    ordered.forEach(expr => {
        if (!expr.errors) {
            let {args, rhs} = expr;

            let argOut = expr.argOut = [];
            expr.argPop = args.length;
            let argTypes = array2obj(args, arg => [arg, anyType()]);
            let argIn = expr.argIn = args.map(arg => argTypes[arg]);

            rhs.forEach(({type, name}) => {
                switch (type) {
                    case 'number':
                        argOut.push(numberType());
                        break;
                    case 'arg':
                        argOut.push(argTypes[name]);
                        break;
                    case 'expr':
                        let rel = namespace[name] || globalNamespace[name];
                        rel.argIn.reverse().forEach(arg => {
                            if (argOut.length > 0) {
                                typeMatch(argOut.pop(), arg);
                            } else {
                                argIn.push(arg);
                            }
                        });
                        rel.argOut.forEach(arg => {
                            argOut.push(arg);
                        });
                }
            });
        }


    });

    return scope;
}
