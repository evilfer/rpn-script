import {OperationType} from "../../operands/operand-types";
import {addAnyType} from "./basic-ops";

export function matchExpectedWrapped(main: OperationType,
                                     id: number,
                                     arity: null | { input: number, output: number }): void {
    const ot = main.types[id];
    switch (ot.type) {
        case null:
            if (arity === null) {
                throw new Error("unknown unwrap arity undefined");
            }
            ot.type = "wrapped";
            ot.wrapped = {
                input: [...Array(arity.input).keys()].map(_ => addAnyType(main)),
                output: [...Array(arity.output).keys()].map(_ => addAnyType(main)),
            };
            break;
        case "wrapped":
            if (arity !== null && ot.wrapped && (
                    ot.wrapped.input.length !== arity.input ||
                    ot.wrapped.output.length !== arity.output
                )) {
                throw new Error("mismatched wrapped expression arity");
            }
            break;
        default:
            throw new Error("mismatched types");
    }
}
