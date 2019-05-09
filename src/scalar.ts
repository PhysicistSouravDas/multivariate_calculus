import { Token, Evaluable, Constant, Variable } from "./definitions";
import { Expression } from "./expression";
import { ADD } from "./operators";

export abstract class Scalar implements Token, Evaluable {
	readonly abstract type: "variable" | "constant";

	public add(that: Scalar): Evaluable {
		if(this instanceof Scalar.Constant && that instanceof Scalar.Constant)
			return new Scalar.Constant(this.value + that.value);
		return new Expression(ADD, this, that);
	}
	abstract mul(that: Scalar): Scalar;

	public static Constant = class extends Scalar implements Constant {
		readonly type = "constant";
		constructor(readonly value: number) {
			super();
		}

		mul(that: Scalar): Scalar {
			throw new Error("Method not implemented.");
		}
	}

	public static Variable = class extends Scalar implements Variable {
		readonly type = "variable";
		constructor() {
			super();
		}

		mul(that: Scalar): Scalar {
			throw new Error("Method not implemented.");
		}
	}
}
