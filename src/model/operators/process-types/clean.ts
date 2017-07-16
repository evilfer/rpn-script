import {OperationType, TypeArity} from "../../operands/operand-types";

function markUsedType(main: OperationType, used: Set<number>, id: number) {
    if (!used.has(id)) {
        used.add(id);
        const type = main.types[id];
        if (type.wrapped) {
            markUsedTypesArity(main, used, type.wrapped);
        }
        if (typeof type.array === "number") {
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
    const used = new Set<number>();
    markUsedTypesArity(main, used, main);
    Object.keys(main.types).forEach(idStr => {
        const id = parseInt(idStr, 10);
        if (!used.has(id)) {
            delete main.types[id];
        }
    });
}
