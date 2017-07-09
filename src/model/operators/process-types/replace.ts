import {OperationType, TypeArity} from "../../operands/operand-types";


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

export function replaceTypeIdWith(main: OperationType, from: number, to: number): void {
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
