import objMap from "../utils/obj-map";

const OPS = {
    '+': (a, b) => [a + b],
    '-': (a, b) => [a - b],
    '*': (a, b) => [a * b],
    '?': (a, b, c) => a ? b : c
};

const typeArray = n => Array.from(new Array(n).keys()).map(() => ({type: 'number'}));

export default objMap(OPS, (f, key) => ({
    name: key,
    argIn: typeArray(f.length),
    argPop: f.length,
    argOut: typeArray(1),
    nativeImpl: f
}));
