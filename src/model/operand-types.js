// @flow

export type OperandType =
    'any' |
    'string' |
    'number' |
    'boolean' |
    {| type: 'array', itemType: OperandType |} |
    {| type: 'wrapped', inputType: OperandType[], outputType: OperandType[] |} |
    {| type: 'tuple', itemTypes: OperandType[] |};


