import {OperandType, OperationType, TypeArity} from "../../operands/operand-types";
import {nextId} from "./next-id";

function addTypeFromSubToMain(main: OperationType,
                              sub: OperationType,
                              tx: { [id: number]: number },
                              id: number): number {
    if (typeof tx[id] === "number") {
        return tx[id];
    } else {
        const nid = nextId(main);
        tx[id] = nid;
        const newType: OperandType = {...sub.types[id]};
        main.types[nid] = newType;

        if (typeof newType.array === "number") {
            newType.array = addTypeFromSubToMain(main, sub, tx, newType.array);
        }
        if (newType.tuple) {
            newType.tuple = newType.tuple.map(tid => addTypeFromSubToMain(main, sub, tx, tid));
        }
        if (newType.wrapped) {
            newType.wrapped = addTypesFromSubToMain(main, sub, tx, newType.wrapped);
        }
        return nid;
    }
}

function addTypesFromSubToMain(main: OperationType,
                               sub: OperationType,
                               tx: { [id: number]: number },
                               arity: TypeArity): TypeArity {
    return {
        input: arity.input.map(id => addTypeFromSubToMain(main, sub, tx, id)),
        output: arity.output.map(id => addTypeFromSubToMain(main, sub, tx, id)),
    };
}

export function arityFromSubToMain(main: OperationType, sub: OperationType): TypeArity {
    return addTypesFromSubToMain(main, sub, {}, sub);
}
