import {objMap} from "../obj-map";
import {typeNumber, requestType, typeRepeat} from "../stack-types";
import {addErrorContainer} from "../add-error";
import {BAD_TYPE} from "../error-types";


const typeArray = n => typeRepeat(n, 'number');

const typeCheck = (args, errorContainer) => {
    let ok = args.every(arg => requestType(arg, 'number'));
    if (!ok) {
        addErrorContainer(errorContainer, BAD_TYPE);
    }
    return ok;
};

const valueCheck = args => args.every(arg => arg.value !== null);

function numberOp(op, name) {
    let tx = (args, errorContainer) => [
        typeNumber(typeCheck(args, errorContainer) && valueCheck(args) ? op(...args.map(arg => arg.value)) : null)
    ];

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
