import objMap from "../../utils/obj-map";
import range from "../../utils/range";
import {numberType} from "../../maths/stack-types";

const OPS = {
    '+': (a, b) => [a + b],
    '-': (a, b) => [a - b],
    '*': (a, b) => [a * b],
    '/': (a, b) => [a / b],
    '?': (a, b, c) => [c ? a : b]
};

const typeArray = n => range(n).map(numberType);

export default objMap(OPS, (f, key) => ({
    name: key,
    argIn: typeArray(f.length),
    argPop: f.length,
    argOut: typeArray(1),
    nativeImpl: f
}));
