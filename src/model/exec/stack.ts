export interface StackValue {
    val: boolean | number | string | Array<StackValue>;
}

export type Stack = StackValue[];
