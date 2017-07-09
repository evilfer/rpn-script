import {OperandType, OperationType} from "../../operands/operand-types";
import {nextId} from "./next-id";
import {matchTypes} from "./match";


export function addAnyType(main: OperationType): number {
    let nid = nextId(main);
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
    let nid = nextId(main);
    main.types[nid] = type;
    main.output.push(nid);
}

export function popTypeAndMatch(main: OperationType, id: number) {
    if (main.output.length > 0) {
        let matched = main.output.pop() || 0;
        matchTypes(main, {}, matched, id);
    } else {
        main.input.unshift(id);
    }
}

export function pushType(main: OperationType, id: number) {
    main.output.push(id);
}
