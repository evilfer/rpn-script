import {OperatorListType} from "../base";
import {OperandType, OperationType, TypeArity} from "../operands/operand-types";

export function runTypeCheck(operators: OperatorListType, namespace: { [name: string]: OperationType }): OperationType {
    let result: OperationType = {
        input: [],
        output: [],
        types: {}
    };

    operators.forEach(operator => operator.applyTypes(result, namespace));

    return result;
}

function nextId(opty: OperationType): number {
    let ids: number[] = Object.keys(opty.types).map(v => parseInt(v));
    return Math.max(0, Math.max.apply(null, ids) + 1);
}

export function addAnyType(main: OperationType): number {
    let nid = nextId(main);
    let newType: OperandType = {type: null};
    main.types[nid] = newType;
    return nid;
}


function addTypeFromSubToMain(main: OperationType, sub: OperationType, tx: { [id: number]: number }, id: number): number {
    if (typeof tx[id] === 'number') {
        return tx[id];
    } else {
        let nid = nextId(main);
        tx[id] = nid;
        let newType: OperandType = {...sub.types[id]};
        main.types[nid] = newType;

        if (typeof newType.array === 'number') {
            newType.array = addTypeFromSubToMain(main, sub, tx, newType.array);
        }
        if (newType.tuple) {
            newType.tuple = newType.tuple.map(id => addTypeFromSubToMain(main, sub, tx, id));
        }
        if (newType.wrapped) {
            newType.wrapped = addTypesFromSubToMain(main, sub, tx, newType.wrapped);
        }
        return nid;
    }
}

function addTypesFromSubToMain(main: OperationType, sub: OperationType, tx: { [id: number]: number }, arity: TypeArity): TypeArity {
    return {
        input: arity.input.map(id => addTypeFromSubToMain(main, sub, tx, id)),
        output: arity.output.map(id => addTypeFromSubToMain(main, sub, tx, id))
    };
}

export function arityFromSubToMain(main: OperationType, sub: OperationType): TypeArity {
    return addTypesFromSubToMain(main, sub, {}, sub);
}


export function pushOutputMemberTypes(main: OperationType, type: OperandType) {
    let nid = nextId(main);
    main.types[nid] = type;
    main.output.push(nid);
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

function replaceTypeIdWithInList(from: number, to: number, list: number[]): void {
    list.forEach((v, i, arr) => {
        if (v === from) {
            arr[i] = to;
        }
    });
}

function replaceTypeIdWithInArity(from: number, to: number, container: TypeArity): void {
    replaceTypeIdWithInList(from, to, container.input);
    replaceTypeIdWithInList(from, to, container.output);
}

function replaceTypeIdWith(main: OperationType, from: number, to: number): void {
    replaceTypeIdWithInArity(from, to, main);
    Object.keys(main.types).map(id => main.types[parseInt(id)]).forEach(type => {
        if (type.array === from) {
            type.array = to;
        }
        if (type.wrapped) {
            replaceTypeIdWithInArity(from, to, type.wrapped);
        }
        if (type.tuple) {
            type.tuple.forEach((id, i, arr) => {
                if (id === from) {
                    arr[i] = to;
                }
            });
        }
    });
}


function markUsedType(main: OperationType, used: Set<number>, id: number) {
    if (!used.has(id)) {
        used.add(id);
        let type = main.types[id];
        if (type.wrapped) {
            markUsedTypesArity(main, used, type.wrapped);
        }
        if (typeof type.array === 'number') {
            markUsedType(main, used, type.array);
        }
        if (type.tuple) {
            type.tuple.forEach(a => markUsedType(main, used, a));
        }
    }
}

function markUsedTypesArity(main: OperationType, used: Set<number>, arity: TypeArity) {
    arity.input.forEach(id => markUsedType(main, used, id));
    arity.output.forEach(id => markUsedType(main, used, id));
}

export function cleanTypes(main: OperationType) {
    let used = new Set<number>();
    markUsedTypesArity(main, used, main);
    Object.keys(main.types).forEach(idStr => {
        let id = parseInt(idStr);
        if (!used.has(id)) {
            delete main.types[id];
        }
    });
}
