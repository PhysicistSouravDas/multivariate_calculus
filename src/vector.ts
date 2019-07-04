import { Token, Evaluable, Constant as _Constant, Variable as _Variable, Expression as _Expression, Operator, isConstant, isVariable } from "./core/definitions";
import { BinaryOperator, isBinaryOperator } from "./core/operators/binary";
import { UnaryOperator, isUnaryOperator } from "./core/operators/unary";
import { ExpressionBuilder } from "./core/expression";
import { Scalar } from "./scalar";

/**
 * Base class to work with vector quantities.
 */
export abstract class Vector implements Token, Evaluable {
	readonly abstract type: "constant" | "variable" | "expression";
	readonly quantity = "vector";

	/**
	 * Adds two `Vector`s together. If `this` and `that` are both constants
	 * then vectorially adds the two and returns a new `Vector.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Vector} The scalar to add `this` with.
	 * @return {Vector} The result of algebraic addition.
	 */
	public abstract add(that: Vector): Vector;

	/**
	 * Subtracts `that` from `this`. If `this` and `that` are both constants
	 * then vectorially subtracts one from the other and returns a new
	 * `Vector.Constant` object otherwise creates an `Expression` out of them
	 * and returns the same.
	 * @param that {Scalar} The scalar to subtract from `this`.
	 * @return {Scalar} The result of algebraic subtraction.
	 */
	public abstract sub(that: Vector): Vector;

	/**
	 * Evaluates the scalar product of `this` and `that`. If both are constants
	 * then numerically computes the product and returns a `Scalar.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Vector} The scalar to subtract from `this`.
	 * @return {Scalar}
	 */
	public abstract dot(that: Vector): Scalar;

	/**
	 * Evaluates the vector product of `this` and `that`. If both are constants
	 * then numerically computes the product and returns a `Vector.Constant` object
	 * otherwise creates an `Expression` out of them and returns the same.
	 * @param that {Vector} The scalar to subtract from `this`.
	 * @return {Vector}
	 */
	public abstract cross(that: Vector): Vector;

	/**
	 * Scales, or multiplies the "size" (magnitude) of, `this` vector by given
	 * amount. If `this` and `k` are both constants then numerically calculates
	 * the scaled vector otherwise creates an `Expression` out of them and
	 * returns the same.
	 * @param k {Scalar} The scale factor.
	 * @return {Vector} The scaled vector.
	 */
	public abstract scale(k: Scalar): Vector;

	/**
	 * Computes the magnitude of a given vector. If `A` vector is a constant
	 * vector then numerically calculates the magnitude otherwise creates a
	 * scalar `Expression` and returns the same.
	 * @param A {Vector}
	 */
	public static mag(A: Vector.Constant): Scalar.Constant;
	public static mag(A: Vector): Scalar.Expression;
	public static mag(A: Vector) {
		if(A instanceof Vector.Constant) {
			let m = 0;
			for(let i = 1; i <= A.value.length; i++)
				m += Math.pow(A.X(i).value, 2);
			return Scalar.constant(Math.sqrt(m));
		}
		return new Scalar.Expression(BinaryOperator.MAG, <Evaluable><unknown>Vector, A);
	}

	/**
	 * For any given vector `A`, evaluates the unit vector along `A`. If `A` is
	 * a constant then directly calculates the unit vector and returns the same
	 * otherwise creates and returns a scalar `Expression`.
	 * @param A {Vector}
	 */
	public static unit(A: Vector.Constant): Vector.Constant;
	public static unit(A: Vector): Vector.Expression;
	public static unit(A: Vector) {
		if(A instanceof Vector.Constant)
			return A.scale(Scalar.constant(1).div(Vector.mag(A)));
		return new Vector.Expression(BinaryOperator.UNIT, <Evaluable><unknown>Vector, A);
	}
}

export namespace Vector {
	const CONSTANTS = new Map<string, Vector.Constant>();
	const NAMED_CONSTANTS = new Map<string, Vector.Constant>();
	const VARIABLES = new Map<string, Vector.Variable>();

	export class Constant extends Vector implements _Constant {
		readonly type = "constant";
		private dimesion: number;
		readonly value: Scalar.Constant[] = [];
		readonly name: string;

		constructor(value: Scalar.Constant[], name?: string);
		constructor(value: number[], name?: string);
		constructor(value: Scalar.Constant[] | number[], name = "") {
			super();
			this.name = name;
			value.forEach((x: any) => this.value.push(x instanceof Scalar.Constant? x: Scalar.constant(x)));
			this.dimesion = this.value.length;
		}

		/**
		 * Returns the components of `this` vector. The index values start
		 * from `1` instead of the commonly used starting index `0`.
		 * @param i {number} The index of the desired component.
		 */
		public get X() {
			const value = this.value;
			return function(i: number) {
				if(i <= 0)
					throw "Indexing starts from `1`";
				return (i <= value.length)?value[i - 1]: Scalar.constant(0);
			}
		}

		/**
		 * Checks for equality of two vector constants. Allows a tolerance of
		 * `1e-14` for floating point numbers.
		 * @param that {Vector.Constant} The value to check equality with.
		 */
		public equals(that: Vector.Constant): boolean;
		/**
		 * Checks for equality of two vector constants.
		 * @param that {Vector.Constant} The value to check equality with.
		 * @param tolerance {number} The tolerance permitted for floating point numbers.
		 */
		public equals(that: Vector.Constant, tolerance: number): boolean;
		public equals(that: Vector.Constant, tolerance = 1e-14) {
			const m = Math.max(this.value.length, that.value.length);
			for(let i = 1; i <= m; i++)
				if(Math.abs(this.X(i).value - that.X(i).value) >= tolerance)
					return false;
			return true;
		}

		public add(that: Vector.Constant): Vector.Constant;
		public add(that: Vector.Variable | Vector.Expression): Vector.Expression;
		public add(that: Vector) {
			if(that instanceof Vector.Constant) {
				const m = Math.max(this.value.length, that.value.length);
				const vec: number[] = [];
				for(let i = 1; i <= m; i++)
					vec.push(this.X(i).value + that.X(i).value);
				return Vector.constant(vec);
			}
			return new Vector.Expression(BinaryOperator.ADD, this, that);
		}

		public sub(that: Vector.Constant): Vector.Constant;
		public sub(that: Vector.Variable | Vector.Expression): Vector.Expression;
		public sub(that: Vector) {
			if(that instanceof Vector.Constant) {
				const m = Math.max(this.value.length, that.value.length);
				const vec: number[] = [];
				for(let i = 1; i <= m; i++)
					vec.push(this.X(i).value - that.X(i).value);
				return Vector.constant(vec);
			}
			return new Vector.Expression(BinaryOperator.SUB, this, that);
		}

		public dot(that: Vector.Constant): Scalar.Constant;
		public dot(that: Vector.Variable | Vector.Expression): Scalar.Expression;
		public dot(that: Vector) {
			if(that instanceof Vector.Constant) {
				let parallel = 0;
				const m = Math.max(this.value.length, that.value.length);
				for(let i = 1; i <= m; i++)
					parallel += this.X(i).value * that.X(i).value;
				return Scalar.constant(parallel);
			}
			return new Scalar.Expression(BinaryOperator.DOT, this, that);
		}

		public cross(that: Vector.Constant): Vector.Constant;
		public cross(that: Vector.Variable | Vector.Expression): Vector.Expression;
		public cross(that: Vector) {
			if(this.dimesion > 3)
				throw "Cross product defined only in 3 dimensions.";
			if(that instanceof Vector.Constant) {
				if(that.dimesion > 3)
					throw "Cross product defined only in 3 dimensions.";
				const a1 = this.X(1).value, a2 = this.X(2).value, a3 = this.X(3).value;
				const b1 = that.X(1).value, b2 = that.X(2).value, b3 = that.X(3).value;
				return Vector.constant([
					a2 * b3 - a3 * b2,
					a3 * b1 - a1 * b3,
					a1 * b2 - a2 * b1
				]);
			}
			return new Vector.Expression(BinaryOperator.CROSS, this, that);
		}

		public scale(k: Scalar.Constant): Vector.Constant;
		public scale(k: Scalar.Variable | Scalar.Expression): Vector.Expression;
		public scale(k: Scalar) {
			if(k instanceof Scalar.Constant)
				return Vector.constant(this.value.map(x => k.mul(x).value));
			return new Vector.Expression(BinaryOperator.SCALE, this, k);
		}
	}

	export class Variable extends Vector implements _Variable {
		readonly type = "variable";

		constructor(readonly name: string) {
			super();
		}

		public add(that: Vector) {
			return new Vector.Expression(BinaryOperator.ADD, this, that);
		}

		public sub(that: Vector) {
			return new Vector.Expression(BinaryOperator.SUB, this, that);
		}

		public dot(that: Vector) {
			return new Scalar.Expression(BinaryOperator.DOT, this, that);
		}

		public cross(that: Vector) {
			return new Vector.Expression(BinaryOperator.CROSS, this, that);
		}

		public scale(k: Scalar) {
			return new Vector.Expression(BinaryOperator.SCALE, this, k);
		}
	}

	export class Expression extends Vector implements _Expression {
		readonly type = "expression";
		readonly arg_list: Set<_Variable>;
		readonly operands: Evaluable[] = [];

		constructor(op: BinaryOperator, lhs: Evaluable, rhs: Evaluable);
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
			if(isBinaryOperator(this.op))
				return this.operands[0];
			throw "Unary operators have no left hand argument.";
		}

		/**
		 * The right hand side operand for `this.op`.
		 * @throws If `this.op` is a `UnaryOperator`.
		 */
		public get rhs() {
			if(isBinaryOperator(this.op))
				return this.operands[1];
			throw "Unary operators have no right hand argument.";
		}

		/**
		 * The argument for `this.op`.
		 * @throws If `this.op` is a `BinaryOperator`.
		 */
		public get arg() {
			if(isUnaryOperator(this.op))
				return this.operands[0];
			throw "Binary operators have two arguments.";
		}

		public add(that: Vector) {
			return new Vector.Expression(BinaryOperator.ADD, this, that);
		}

		public sub(that: Vector) {
			return new Vector.Expression(BinaryOperator.SUB, this, that);
		}

		public dot(that: Vector) {
			return new Scalar.Expression(BinaryOperator.DOT, this, that);
		}

		public cross(that: Vector) {
			return new Vector.Expression(BinaryOperator.CROSS, this, that);
		}

		public scale(k: Scalar) {
			return new Vector.Expression(BinaryOperator.SCALE, this, k);
		}

		public isFunctionOf(v: _Variable) {
			return this.arg_list.has(v);
		}

		public at(values: Map<_Variable, _Constant>) {
			const res = ExpressionBuilder.evaluateAt(this, values);
			if(isConstant(res))
				return <Vector.Constant>res;
			if(isVariable(res))
				return <Vector.Variable>res;
			return <Vector.Expression>res;
		}
	}

	/**
	 * Creates a new `Vector.Constant` object if it has not been created before.
	 * Otherwise just returns the previously created object.
	 * @param value {number[]}
	 */
	export function constant(value: number[]): Vector.Constant;
	/**
	 * Creates a named `Vector.Constant` object if it has not been created before.
	 * Otherwise just returns the previously created object.
	 * @param value {number}
	 * @param name {string}
	 */
	export function constant(value: number[], name: string): Vector.Constant;
	/**
	 * Returns a previously declared named `Scalar.Constant` object.
	 * @param name {string}
	 */
	export function constant(name: string): Vector.Constant;
	export function constant(a: number[] | string, b?: string) {
		let c;
		if(Array.isArray(a)) {
			let i = a.length - 1;
			for(; i >= 0; i--)
				if(a[i] !== 0)
					break;
			const key = a.slice(0, i+1).join();
			if(b === undefined) {
				c = CONSTANTS.get(key);
				if(c === undefined) {
					c = new Vector.Constant(a);
					CONSTANTS.set(key, c);
				}
			} else {
				c = NAMED_CONSTANTS.get(b);
				if(c !== undefined)
					throw "Attempt to redefine a constant: A constant with the same name already exists.";
				c = new Vector.Constant(a, b);
				NAMED_CONSTANTS.set(b, c);
			}
		} else {
			c = NAMED_CONSTANTS.get(a);
			if(c === undefined)
				throw "No such constant defined.";
		}
		return c;
	}

	/**
	 * Creates a new `Vector.Variable` object if it has not been created before.
	 * Otherwise just returns the previously created object.
	 * @param name {string}
	 */
	export function variable(name: string) {
		let v = VARIABLES.get(name);
		if(v === undefined) {
			v = new Vector.Variable(name);
			VARIABLES.set(name, v);
		}
		return v;
	}
}
