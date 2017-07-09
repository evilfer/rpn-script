import {OperatorList} from "../operators/operator";

export interface StackValue {
    val: boolean | number | string | StackValue[] | OperatorList;
}

export type Stack = StackValue[];
