// @flow

export type OperandNameType = 'any' | 'string' | 'number' | 'boolean' | 'array' | 'tuple' | 'wrapped';

export type ExprArityType = {| input: OperandListType, output: OperandListType |};

export type OperandListType = OperandType[];


export type OperandType = {|
    type: OperandNameType,
    arrayType: ?OperandListType,
    tupleTypes: ?OperandListType[],
    wrappedTypes: ?ExprArityType,
    name: ?string
|};

function newType(type: OperandNameType, wrappedTypes: ?ExprArityType = null, arrayType: ?OperandListType = null, tupleTypes: ?OperandListType[] = null): OperandType {
    return {type, wrappedTypes, arrayType, tupleTypes, name: null};
}

export function anyType(): OperandType {
    return newType('any');
}

export function numberType(): OperandType {
    return newType('number');
}

export function stringType(): OperandType {
    return newType('string');
}

export function booleanType(): OperandType {
    return newType('boolean');
}

export function wrappedType(t: ExprArityType): OperandType {
    return newType('wrapped', t);
}

export function arrayType(t: ?OperandListType): OperandType {
    return newType('array', null, t);
}

export function tupleType(t: OperandListType[]): OperandType {
    return newType('tuple', null, null, t);
}

export function literalType(t: 'boolean' | 'number' | 'string') {
    return newType(t);
}
