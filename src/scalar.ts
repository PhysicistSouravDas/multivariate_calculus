import { Token, Evaluable, Constant as _Constant, Variable as _Variable, Expression as _Expression, isConstant, isVariable, Operator } from "./core/definitions";
import { BinaryOperator } from "./core/operators/binary";
import { ExpressionBuilder } from "./core/expression";
import { UnaryOperator } from "./core/operators/unary";

/**
 * Base class to works with scalar quantities.
 */
export abstract class Scalar implements Token, Evaluable {
	readonly abstract type: "constant" | "variable" | "expression";
	readonly quantity = "scalar";

	/**
	 * Adds two `Scalar`s together. If `this` and `that` are both constants
	 * then numerically adds the two and returns a new `Scalar.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Scalar} The scalar to add `this` with.
	 * @returns {Evaluable} The result of algebraic addition.
	 */
	public abstract add(that: Scalar): Scalar;

	/**
	 * Subtracts `that` from `this`. If `this` and `that` are both constants
	 * then numerically subtracts one from the other and returns a new
	 * `Scalar.Constant` object otherwise creates an `Expression` out of them
	 * and returns the same.
	 * @param that {Scalar} The scalar to subtract from `this`.
	 * @returns {Evaluable} The result of algebraic subtraction.
	 */
	public abstract sub(that: Scalar): Scalar;

	/**
	 * Multiplies two `Scalar`s together. If `this` and `that` are both constants
	 * then numerically multiplies the two and returns a new `Scalar.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Scalar} The scalar to multiply `this` with.
	 * @returns {Evaluable} The result of algebraic multiplication.
	 */
	public abstract mul(that: Scalar): Scalar;

	/**
	 * Divides `this` scalar by `that`. If `this` and `that` are both constants
	 * then numerically divides the two and returns a new `Scalar.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Scalar} The scalar to divide `this` by.
	 * @returns {Evaluable} The result of algebraic division.
	 */
	public abstract div(that: Scalar): Scalar;

	/**
	 * Raises `this` scalar to the power of `that`. If `this` and `that` are both constants
	 * then numerically evaluates the exponentiation and returns a new `Scalar.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Scalar} The scalar to divide `this` by.
	 * @returns {Evaluable} The result of algebraic division.
	 */
	public abstract pow(that: Scalar): Scalar;
}

export namespace Scalar {
	const VARIABLES = new Map<string, Scalar.Variable>();
	/**
	 * Represents a constant scalar quantity with a fixed value.
	 * @class
	 * @extends Scalar
	 */
	export class Constant extends Scalar implements _Constant {
		readonly type = "constant";
		/**
		 * Creates a constant scalar value.
		 * @param value {number} The fixed value of this `Constant`.
		 */
		constructor(readonly value: number) {
			super();
		}

		public add(that: Scalar.Constant): Scalar.Constant;
		public add(that: Scalar.Variable | Scalar.Expression): Scalar.Expression;
		public add(that: Scalar) {
			if(that instanceof Scalar.Constant)
				return new Scalar.Constant(this.value + that.value);
			return new Scalar.Expression(BinaryOperator.ADD, this, that);
		}

		public sub(that: Scalar.Constant): Scalar.Constant;
		public sub(that: Scalar.Variable | Scalar.Expression): Scalar.Expression;
		public sub(that: Scalar) {
			if(that instanceof Scalar.Constant)
				return new Scalar.Constant(this.value - that.value);
			return new Scalar.Expression(BinaryOperator.SUB, this, that);
		}

		public mul(that: Scalar.Constant): Scalar.Constant;
		public mul(that: Scalar.Variable | Scalar.Expression): Scalar.Expression;
		public mul(that: Scalar) {
			if(that instanceof Scalar.Constant)
				return new Scalar.Constant(this.value * that.value);
			return new Scalar.Expression(BinaryOperator.MUL, this, that);
		}

		public div(that: Scalar.Constant): Scalar.Constant;
		public div(that: Scalar.Variable | Scalar.Expression): Scalar.Expression;
		public div(that: Scalar) {
			if(that instanceof Scalar.Constant) {
				if(that.value === 0)
					throw "Division by zero error";
				return new Scalar.Constant(this.value / that.value);
			}
			return new Scalar.Expression(BinaryOperator.DIV, this, that);
		}

		public pow(that: Scalar.Constant): Scalar.Constant;
		public pow(that: Scalar.Variable | Scalar.Expression): Scalar.Expression;
		public pow(that: Scalar) {
			if(that instanceof Scalar.Constant) {
				if(this.value === 0 && that.value === 0)
					throw "Cannot determine 0 to the power 0";
				return new Scalar.Constant(Math.pow(this.value, that.value));
			}
			return new Scalar.Expression(BinaryOperator.POW, this, that);
		}
	}

	/**
	 * Represents a variable scalar quantity with no fixed value.
	 * @class
	 * @extends Scalar
	 */
	export class Variable extends Scalar implements _Variable {
		readonly type = "variable";
		/**
		 * Creates a variable scalar object.
		 */
		constructor(readonly name: string) {
			super();
			if(!VARIABLES.has(this.name))
				VARIABLES.set(this.name, this);
			return VARIABLES.get(this.name) || this;
		}

		public add(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.ADD, this, that);
		}

		public sub(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.SUB, this, that);
		}

		public mul(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.MUL, this, that);
		}

		public div(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.DIV, this, that);
		}

		public pow(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.POW, this, that);
		}
	}

	export class Expression extends Scalar implements _Expression {
		readonly type = "expression";
		/** `Set` of `Variable` quantities `this` depends on. */
		readonly arg_list: Set<_Variable>;
		/** Array of `Evaluable` quantity/quantities `this.op` operates on. */
		readonly operands: Evaluable[] = [];

		/**
		 * Creates a scalar expression object using a root binary operation.
		 * @param op {BinaryOperator}
		 * @param lhs {Evaluable} The left hand side operand of the operator.
		 * @param rhs {Evaluable} The right hand side operand of the operator.
		 */
		constructor(op: BinaryOperator, lhs: Evaluable, rhs: Evaluable);
		/**
		 * Creates a scalar expression object using a root unary operation.
		 * @param op {UnaryOperator}
		 * @param arg {Evaluable} The argument of the operator.
		 */
		constructor(op: UnaryOperator, arg: Evaluable);
		constructor(readonly op: Operator, a: Evaluable, b?: Evaluable) {
			super();
			this.arg_list = ExpressionBuilder.createArgList(a, b);
			this.operands.push(a);
			if(b !== undefined)
				this.operands.push(b);
		}

		/**
		 * The left hand side operand for `this.op`.
		 * @throws If `this.op` is a `UnaryOperator`.
		 */
		public get lhs() {
			if(this.operands.length === 2)
				return this.operands[0];
			throw "Unary operators have no left hand argument.";
		}

		/**
		 * The right hand side operand for `this.op`.
		 * @throws If `this.op` is a `UnaryOperator`.
		 */
		public get rhs() {
			if(this.operands.length === 2)
				return this.operands[1];
			throw "Unary operators have no left hand argument.";
		}

		/**
		 * The argument for `this.op`.
		 * @throws If `this.op` is a `BinaryOperator`.
		 */
		public get arg() {
			if(this.operands.length === 1)
				return this.operands[0];
			throw "Binary operators have two arguments.";
		}

		public add(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.ADD, this, that);
		}

		public sub(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.SUB, this, that);
		}

		public mul(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.MUL, this, that);
		}

		public div(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.DIV, this, that);
		}

		public pow(that: Scalar) {
			return new Scalar.Expression(BinaryOperator.POW, this, that);
		}

		/**
		 * Checks whether `this` scalar expression depends on the given `Variable`;
		 * @param v {Variable}
		 */
		isFunctionOf(v: _Variable): boolean {
			return this.arg_list.has(v);
		}

		/**
		 * Evaluates `this` scalar expression at the given values of the `Variable` quantities.
		 * @param values {Map<Variable, Constant>} The map from variables to constant values.
		 */
		at(values: Map<_Variable, _Constant>) {
			const res = ExpressionBuilder.evaluateAt(this, values);
			if(isConstant(res))
				return <Scalar.Constant>res;
			if(isVariable(res))
				return <Scalar.Variable>res;
			return <Scalar.Expression>res;
		}
	}
}
