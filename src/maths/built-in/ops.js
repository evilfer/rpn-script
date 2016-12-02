import extend from "extend";
import objMap from "../../utils/obj-map";
import range from "../../utils/range";
import {numberType, isOfType} from "../../maths/stack-types";
import {addErrorContainer} from "../add-error";
import {BAD_TYPE} from "../error-types";


const typeArray = n => range(n).map(numberType);

const typeCheck = (args, errorContainer) => {
    let ok = args.every(arg => isOfType(arg, 'number'));
    if (!ok) {
        addErrorContainer(errorContainer, BAD_TYPE);
    }
    return ok;
};

const valueCheck = args => args.every(arg => typeof arg.value !== 'undefined');

function numberOp(op, name) {


    let tx = (args, errorContainer) => {
        return [
            typeCheck(args, errorContainer) && valueCheck(args) ?
                {
                    type: 'number',
                    value: op(...args.map(arg => arg.value))
                } :
                {type: 'number'}
        ];
    };

    let input = typeArray(op.length);
    let output = typeArray(1);

    return {
        name,
        tx,
        input,
        output,
        native: true
    };
}


const OPS = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b
};

export default objMap(OPS, numberOp);
