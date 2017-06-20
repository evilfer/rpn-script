// @flow

/**
 * ExecutionContext:
 * a context where operators can be applied, resulting in a Stack of Operands
 */


/**
 * Stack:
 * An ordered list of Operands
 */


/**
 * OperandType:
 * a representation of a value inside a Stack
 */


/**
 * OperandType:
 * a description of the value hold by an OperandType
 */

/**
 * Operator:
 * a description of a manipulation of an ExecutionContext Stack
 */



/**
 * OperatorInstance:
 * an instance of an Operator, linked to the application of an Expression to an ExecutionContext
 */


/**
 * Expression:
 * a description of series of manipulations that can be applied to an ExecutionContext
 * composed by (at least) a list of Operands
 * requires * operands as input
 * produces * operands as output
 */

/**
 * ExpressionInstance:
 * an instance of an Expression, applied to an ExecutionContext at a given time
 */



