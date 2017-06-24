import {OperatorListType} from "../base";
import {OperandType, OperationType, TypeArity} from "../operands/operand-types";

export function runTypeCheck(operators: OperatorListType): OperationType {
    return {
        input: [],
        output: [],
        types: {}
    };
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
