import {OperandType, OperationType, TypeArity} from "../../operands/operand-types";
import {replaceTypeIdWith} from "./replace";


export function matchTypes(main: OperationType, tx: { [id: number]: number }, a: number, b: number): void {
    if (a === b) {
        return;
    }

    let typeA = main.types[a];
    let typeB = main.types[b];
    let newType: OperandType;

    if (typeA.type === null) {
        newType = typeB;
    } else if (typeB.type === null) {
        newType = typeA;
    } else if (typeA.type !== typeB.type) {
        throw new Error('not matching types');
    } else {
        newType = {type: typeA.type};
        switch (newType.type) {
            case 'array':
                matchArrays(main, tx, newType, typeA.array || 0, typeB.array || 0);
                break;
            case 'tuple':
                matchTuples(main, tx, newType, typeA.tuple || [], typeB.tuple || []);
                break;
            case 'wrapped':
                matchWrapped(main, tx, newType, typeA.wrapped, typeB.wrapped);
        }
    }

    main.types[a] = newType;
    main.types[b] = newType;

    replaceTypeIdWith(main, b, a);

    tx[b] = a;
}

function matchArity(main: OperationType, tx: { [id: number]: number }, arityA: null | TypeArity, arityB: null | TypeArity): null | TypeArity {
    if (arityA === null) {
        return arityB;
    } else if (arityB === null) {
        return arityA;
    }

    if (arityA.input.length !== arityB.input.length) {
        throw new Error('not matching type');
    }

    if (arityA.output.length !== arityB.output.length) {
        throw new Error('not matching type');
    }

    arityA.input.forEach((a, i) => matchTypes(main, tx, a, arityB.input[i]));
    arityA.output.forEach((a, i) => matchTypes(main, tx, a, arityB.output[i]));

    return arityA;
}



function matchArrays(main: OperationType, tx: { [id: number]: number }, newType: OperandType, arrayA: number, arrayB: number): void {
    matchTypes(main, tx, arrayA, arrayB);
    newType.array = arrayA;
}

function matchTuples(main: OperationType, tx: { [id: number]: number }, newType: OperandType, tupleA: number[], tupleB: number[]): void {
    if (tupleA.length !== tupleB.length) {
        throw new Error('tuple length does not match');
    }
    tupleA.forEach((a, i) => matchTypes(main, tx, a, tupleB[i]));
    newType.tuple = tupleA;
}

function matchWrapped(main: OperationType, tx: { [id: number]: number }, newType: OperandType, wrappedA: undefined | TypeArity, wrappedB: undefined | TypeArity): void {
    if (!wrappedA || !wrappedB) {
        throw new Error('missing wrapped arity');
    }

    matchArity(main, tx, wrappedA, wrappedB);
    newType.wrapped = wrappedA;
}
