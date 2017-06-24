export interface TypeArity {
    input: number[],
    output: number[]
}


export interface OperandType {
    type: null | 'string' | 'number' | 'boolean' | 'array' | 'tuple' | 'wrapped',
    array?: null | TypeArity,
    wrapped?: TypeArity,
    tuple?: TypeArity[]
}

export interface OperationType extends TypeArity {
    types: { [id: number]: OperandType };
}
