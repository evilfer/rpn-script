export interface TypeArity {
    input: number[],
    output: number[]
}


export interface OperandType {
    id: number,
    type: 'any' | 'string' | 'number' | 'boolean' | 'array' | 'tuple' | 'wrapped',
    array?: null | TypeArity,
    wrapped?: TypeArity,
    tuple?: TypeArity[]
}

export interface OperatorType extends TypeArity {
    types: { [id: number]: OperandType };
}
