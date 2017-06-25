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

function addTypesFromSubToMain(main: OperationType, sub: OperationType, tx: { [id: number]: number }, arity: TypeArity): TypeArity {
    let txId: { (id: number): number } = id => {
        if (typeof tx[id] === 'number') {
            return tx[id];
        } else {
            let nid = nextId(main);
            tx[id] = nid;
            let newType: OperandType = {...sub.types[id]};
            main.types[nid] = newType;

            if (newType.array) {
                newType.array = addTypesFromSubToMain(main, sub, tx, newType.array);
            }
            if (newType.tuple) {
                newType.tuple = newType.tuple.map(a => addTypesFromSubToMain(main, sub, tx, a));
            }
            if (newType.wrapped) {
                newType.wrapped = addTypesFromSubToMain(main, sub, tx, newType.wrapped);
            }
            return nid;
        }
    };

    return {
        input: arity.input.map(txId),
        output: arity.output.map(txId)
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

enum Match {A, B}

function matchArrays(main: OperationType, tx: { [id: number]: number }, newType: OperandType, arrayA: null | TypeArity, arrayB: null | TypeArity): void {
    newType.array = matchArity(main, tx, arrayA, arrayB);
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
                matchArrays(main, tx, newType, typeA.array || null, typeB.array || null);
                break;
        }
    }

    main.types[a] = newType;
    main.types[b] = newType;

    replaceTypeIdWith(main, b, a);

    tx[b] = a;
}

function replaceTypeIdWithInList(main: OperationType, from: number, to: number, list: number[]): void {
    list.forEach((v, i, arr) => {
        if (v === from) {
            arr[i] = to;
        }
    });
}

function replaceTypeIdWithInArity(main: OperationType, from: number, to: number, container: TypeArity): void {
    replaceTypeIdWithInList(main, from, to, container.input);
    replaceTypeIdWithInList(main, from, to, container.output);
}

function replaceTypeIdWith(main: OperationType, from: number, to: number): void {
    replaceTypeIdWithInArity(main, from, to, main);
    Object.keys(main.types).map(id => main.types[parseInt(id)]).forEach(type => {
        if (type.array) {
            replaceTypeIdWithInArity(main, from, to, type.array);
        }
        if (type.wrapped) {
            replaceTypeIdWithInArity(main, from, to, type.wrapped);
        }
        if (type.tuple) {
            type.tuple.forEach(arity => replaceTypeIdWithInArity(main, from, to, arity));
        }
    });
}


function markUsedType(main: OperationType, used: Set<number>, id: number) {
    used.add(id);
    let type = main.types[id];
    if (type.wrapped) {
        markUsedTypesArity(main, used, type.wrapped);
    }
    if (type.array) {
        markUsedTypesArity(main, used, type.array);
    }
    if (type.tuple) {
        type.tuple.forEach(a => markUsedTypesArity(main, used, a));
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
