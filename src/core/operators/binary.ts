/**
 * Represents any kind of operator that has a left hand operand and a right hand operand.
 */
export enum BinaryOperator {
	/** The operator for adding two values. */
	ADD = "add",
	/** The operator for subtracting one value from another. */
	SUB = "sub",
	/** The operator for multiplying two values. */
	MUL = "mul",
	/** The operator for dividing one value by another. */
	DIV = "div",
	/** The operator for raising a base to an exponent. */
	POW = "pow",
	/** The operator for evaluating dot (scalar) product of two vectors. */
	DOT = "dot",
	/** The operator to evaluate magnitude of a vector. */
	MAG = "mag",
	/** The operator to scale a vector. */
	SCALE = "scale"
}

/**
 * Checks whether the passed string has been defined as a BinaryOperator.
 */
export function isBinaryOperator(s: string): s is BinaryOperator {
	for(let k in BinaryOperator)
		if(BinaryOperator[k] === s)
			return true;
	return false;
}