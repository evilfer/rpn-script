// @flow

export type OperandNameType = null | 'string' | 'number' | 'boolean' | 'array' | 'tuple' | 'wrapped';

export type WrappedArityType = {| input: OperandType[], output: OperandType[] |};

export type OperandType = {|
    type: OperandNameType,
    arrayType: ?WrappedArityType,
    tupleTypes: ?WrappedArityType[],
    wrappedTypes: ?WrappedArityType
|};

function newType(type: OperandNameType, wrappedTypes: ?WrappedArityType = null, arrayType: ?WrappedArityType = null, tupleTypes: ?WrappedArityType[] = null): OperandType {
    return {type, wrappedTypes, arrayType, tupleTypes};

}
export function anyType(): OperandType {
    return newType(null);
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

export function wrappedType(t: WrappedArityType): OperandType {
    return newType('wrapped', t);
}

export function arrayType(t: ?WrappedArityType): OperandType {
    return newType('wrapped', null, t);
}

export function tupleType(t: WrappedArityType[]): OperandType {
    return newType('wrapped', null, null, t);
}

export function literalType(t: 'boolean' | 'number' | 'string') {
    return newType(t);
}
