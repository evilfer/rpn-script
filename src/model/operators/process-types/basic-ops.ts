import {OperandType, OperationType} from "../../operands/operand-types";
import {matchTypes} from "./match";
import {nextId} from "./next-id";

export function addAnyType(main: OperationType): number {
    const nid = nextId(main);
    main.types[nid] = {type: null};
    return nid;
}

export function popInputType(main: OperationType): number {
    if (main.output.length > 0) {
        return main.output.pop() || 0;
    } else {
        return addAnyType(main);
    }
}

export function pushOutputMemberTypes(main: OperationType, type: OperandType) {
    const nid = nextId(main);
    main.types[nid] = type;
    main.output.push(nid);
}

export function popTypeAndMatch(main: OperationType, id: number) {
    if (main.output.length > 0) {
        const matched = main.output.pop() || 0;
        matchTypes(main, {}, matched, id);
    } else {
        main.input.unshift(id);
    }
}

export function pushType(main: OperationType, id: number) {
    main.output.push(id);
}
