import { Component } from "../../../src/core/math/component";
import { IndeterminateForm, DivisionByZero } from "../../../src/core/errors";
import { RoundingMode, MathContext } from "../../../src/core/math/context";
import { mathenv } from "../../../src/core/env";

const mock_add = jest.fn(Component.prototype.add);
const mock_sub = jest.fn(Component.prototype.sub);
const mock_mul = jest.fn(Component.prototype.mul);
const mock_div = jest.fn(Component.prototype.div);
const mock_pow = jest.fn(Component.prototype.pow);
const mock_mod = jest.fn(Component.prototype.mod);
const mock_abs = jest.fn(Component.abs);

const mocks = [
	mock_add,
	mock_sub,
	mock_mul,
	mock_div,
	mock_pow,
	mock_mod,
	mock_abs
];
Component.prototype.add = mock_add;
Component.prototype.sub = mock_sub;
Component.prototype.mul = mock_mul;
Component.prototype.div = mock_div
Component.prototype.pow = mock_pow;
Component.prototype.mod = mock_mod;
Component.abs = mock_abs;

beforeEach(() => mocks.forEach(fn => fn.mockClear()));

function properContext() {
	mocks.forEach(fn => {
		if(fn.mock.calls.length === 0) return;
		fn.mock.calls.some(call => {
			const contextPassed = call.some(argument => {
				const arg = <MathContext>argument;
				return arg.precision !== undefined && arg.rounding !== undefined;
			});
			expect(contextPassed).toBe(true);
		});
	});
	// debugger
	// mocks.forEach(fn => console.log((<any[]>fn.mock.calls).map((call: any[]) => call.length)));
}

describe("Checks method definitions", function() {
	it("Instance methods", function() {
		const obj = Component.ONE;
		expect(obj.getDefinition("add")).toBe("instance");
		expect(obj.getDefinition("sub")).toBe("instance");
	});

	it("Class methods", function() {
		const obj = Component.ONE;
		expect(obj.getDefinition("exp")).toBe("static");
		expect(obj.getDefinition("sin")).toBe("static");
	});

	it("Non methods", function() {
		const obj = Component.ONE;
		expect(obj.getDefinition("abc")).toBe("undefined");
		expect(obj.getDefinition("foo")).toBe("undefined");
	});
});

describe("Integer numbers", function() {
	const a = Component.create("144");
	const b = Component.create("-12");
	describe("Creates new numbers", function() {
		const st = "100.0";
		it("from number", function() {
			const num = 100;
			const bnum = Component.create(num);
			expect(bnum.toString()).toBe(st);
		});
		
		describe("from string", function() {
			it("Decimal form", function() {
				const num = "100";
				const bnum = Component.create(num);
				expect(bnum.toString()).toBe(st);
			});

			it("Scientific form", function() {
				const num = "1e2";
				const bnum = Component.create(num);
				expect(bnum.toString()).toBe(st);
			});
		});

		it("from integer and fractional parts", function() {
			const bnum = Component.create("100", "0");
			expect(bnum.toString()).toBe(st);
		});
	});

	it("Checks for equality", function() {
		const A = Component.create("20");
		const B = Component.create("20.1");
		expect(A.equals(B)).toBe(false);
		expect(A.equals(B, {
			precision: 0,
			rounding: RoundingMode.HALF_UP
		})).toBe(true);
	});

	it("Adds numbers", function() {
		expect(a.add(b)).toEqual(Component.create("132"));
	});

	it("Subtracts numbers", function() {
		expect(a.sub(b)).toEqual(Component.create("156"));
	});

	it("Multiplies numbers", function() {
		expect(a.mul(b)).toEqual(Component.create("-1728"));
	});

	it("Divides numbers", function() {
		expect(a.div(b)).toEqual(Component.create("-12"));
	});

	it("Raises to integer powers", function() {
		expect(Component.intpow(b, 2)).toEqual(a);
		expect(Component.intpow(b, 3)).toEqual(Component.create("-1728"));
	});

	it("Computes absolute value", function() {
		expect(Component.abs(a)).toEqual(a);
		expect(Component.abs(b)).toEqual(Component.create("12"));
	});
});

describe("Decimal numbers", function() {
	const a = Component.create("0.144");
	const b = Component.create("1.2");
	describe("Creates new numbers", function() {
		const st = "40.01";
		it("from number", function() {
			const num = 40.01;
			const bnum = Component.create(num);
			expect(bnum.toString()).toBe(st);
		});

		describe("from string", function() {
			it("Decimal form", function() {
				const num = "40.01";
				const bnum = Component.create(num);
				expect(bnum.toString()).toBe(st);
			});

			it("Scientific form", function() {
				const num1 = "4.001e1", num2 = "4001e-2";
				const bnum1 = Component.create(num1), bnum2 = Component.create(num2);
				expect(bnum1.toString()).toBe(st);
				expect(bnum2.toString()).toBe(st);
			});
		});

		it("from integer and fractional parts", function() {
			const bnum = Component.create("40", "01");
			expect(bnum.toString()).toBe(st);
		});
	});

	it("Adds numbers", function() {
		expect(a.add(b)).toEqual(Component.create("1.344"));
	});

	it("Subtracts numbers", function() {
		expect(a.sub(b)).toEqual(Component.create("-1.056"));
	});

	it("Multiplies numbers", function() {
		expect(a.mul(b)).toEqual(Component.create("0.1728"));
	});

	it("Divides numbers", function() {
		expect(a.div(b)).toEqual(Component.create("0.12"));
	});

	it("Raises to integer powers", function() {
		expect(Component.intpow(b, 2)).toEqual(Component.create("1.44"));
		expect(Component.intpow(b, 3)).toEqual(Component.create("1.728"));
	});
});

describe("Mixed values", function() {
	it("Addition", function() {
		const a = Component.create("120");
		const b = Component.create("0.123");
		expect(a.add(b)).toEqual(Component.create("120.123"));
	});

	it("Division", function() {
		const a = Component.create("10000");
		const b = Component.create("1");
		expect(b.div(a)).toEqual(Component.create("0.0001"));
		const a1 = Component.create("0.0001");
		const b1 = Component.create("1");
		expect(a1.div(b1, {
			precision: 2,
			rounding: RoundingMode.HALF_UP
		})).toEqual(Component.create("0"));
	});
});

describe("Throws appropriate errors", function() {
	const zero = Component.create("0");
	it("Division by zero", function() {
		expect(() => Component.create("1").div(zero)).toThrowError(new DivisionByZero("Cannot divide by zero."));
		expect(() => zero.div(zero)).toThrowError(new IndeterminateForm("Cannot determine 0/0."));
	});

	it("Illegal number format", function() {
		expect(() => Component.create("1.1.1")).toThrowError(TypeError);
	});

	it("Negative number to fractional power", function() {
		expect(() => Component.TWO.neg.pow(Component.create("0.5"))).toThrowError(TypeError);
	});
});

/*
 * These tests have been based on the rounding algorithms defined by JAVA.
 * To see all the rounding possibilities and read more about them go to
 * https://docs.oracle.com/javase/8/docs/api/java/math/RoundingMode.html
 */
describe("Rounds", function() {
	const a = ["5.5", "2.5", "1.6", "1.1", "1.0", "-1.0", "-1.1", "-1.6", "-2.5", "-5.5"];
	it("Up", function() {
		const b = ["6", "3", "2", "2", "1", "-1", "-2", "-2", "-3", "-6"];
		const context = {
			precision: 0,
			rounding: RoundingMode.UP
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Down", function() {
		const b = ["5", "2", "1", "1", "1", "-1", "-1", "-1", "-2", "-5"];
		const context = {
			precision: 0,
			rounding: RoundingMode.DOWN
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Ceiling", function() {
		const b = ["6", "3", "2", "2", "1", "-1", "-1", "-1", "-2", "-5"];
		const context = {
			precision: 0,
			rounding: RoundingMode.CEIL
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Floor", function() {
		const b = ["5", "2", "1", "1", "1", "-1", "-2", "-2", "-3", "-6"];
		const context = {
			precision: 0,
			rounding: RoundingMode.FLOOR
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Half up", function() {
		const b = ["6", "3", "2", "1", "1", "-1", "-1", "-2", "-3", "-6"];
		const context = {
			precision: 0,
			rounding: RoundingMode.HALF_UP
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Half down", function() {
		const b = ["5", "2", "2", "1", "1", "-1", "-1", "-2", "-2", "-5"];
		const context = {
			precision: 0,
			rounding: RoundingMode.HALF_DOWN
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Half even", function() {
		const b = ["6", "2", "2", "1", "1", "-1", "-1", "-2", "-2", "-6"];
		const context = {
			precision: 0,
			rounding: RoundingMode.HALF_EVEN
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.round(Component.create(a[i]), context);
			expect(x).toEqual(Component.create(b[i]));
		}
	});

	it("Unnecesary", function() {
		const context: MathContext = {
			precision: 0,
			rounding: RoundingMode.UNNECESSARY
		};
		for(let i = 0; i < 10; i++) {
			const x = Component.create(a[i]);
			if(a[i] == "1.0")
				expect(Component.round(x, context)).toEqual(Component.create("1"));
			else if(a[i] == "-1.0")
				expect(Component.round(x, context)).toEqual(Component.create("-1"));
			else
				expect(() => Component.round(x, context)).toThrow();
		}
	});
});

describe("Comparison", function() {
	it("Compares integers", function() {
		const a = Component.create("1");
		const b = Component.create("2");
		expect(a.compareTo(b)).toBe(-1);
		expect(b.compareTo(a)).toBe(1);
	});

	it("Compares fractions", function() {
		const a = Component.create("0.25");
		const b = Component.create("0.26");
		expect(a.compareTo(b)).toBe(-1);
		expect(b.compareTo(a)).toBe(1);
	});

	it("Compares mixed fractions", function() {
		const a = Component.create("1.23");
		const b = Component.create("1.234");
		expect(a.compareTo(b)).toBe(-1);
		expect(b.compareTo(a)).toBe(1);
	});

	it("Checks equality", function() {
		const a = Component.create("4.75");
		const b = Component.create("4.75");
		expect(a.compareTo(b)).toBe(0);
		expect(b.compareTo(a)).toBe(0);
	});

	it("Compares numerically equivalent values", function() {
		const a = Component.create("3.22");
		const b = Component.create("0.322");
		expect(a.compareTo(b)).not.toBe(0);
	});
});

describe("Modulus", function() {
	it("Integers", function() {
		for(let i = 1; i <= 100; i++) {
			const x = Component.create(i);
			expect(x.mod(Component.SEVEN)).toEqual(Component.create(i%7));
		}
	});

	it("Decimals", function() {
		let x = Component.FIVE.pow(Component.create("0.5"));
		const y = x.sub(Component.TWO);
		for(let i = 0; i < 10; i++) {
			expect(x.mod(Component.TWO)).toEqual(y);
			x = x.add(Component.TWO);
		}
	});
});

describe("Floor", function() {
	it("For positive numbers", function() {
		const values = new Array(10).fill(0).map((_, i) => `1.${i}`).map(n => Component.create(n));
		for(let v of values)
			expect(Component.floor(v)).toEqual(Component.ONE);
	});

	it("For negative numbers", function() {
		const values = new Array(10).fill(0).map((_, i) => `-1.${i+1}`).map(n => Component.create(n));
		for(let v of values)
			expect(Component.floor(v)).toEqual(Component.TWO.neg);
	});
});

describe("Ceil", function() {
	it("For positive numbers", function() {
		const values = new Array(10).fill(0).map((_, i) => `1.${i+1}`).map(n => Component.create(n));
		for(let v of values)
			expect(Component.ceil(v)).toEqual(Component.TWO);
	});

	it("For negative numbers", function() {
		const values = new Array(10).fill(0).map((_, i) => `-1.${i}`).map(n => Component.create(n));
		for(let v of values)
			expect(Component.ceil(v)).toEqual(Component.ONE.neg);
	});
});

describe("Exponential", function() {
	test("calls with correct context", function() {
		Component.exp(Component.THREE);
		properContext();
	});

	it("exp", function() {
		const E = Component.round(Component.E, mathenv.mode);
		const E2 = Component.E.mul(Component.E);
		expect(Component.exp(Component.ONE)).toEqual(E);
		expect(Component.exp(Component.TWO)).toEqual(E2);
		// expect(Component.exp(Component.ONE.neg)).toEqual(Component.ONE.div(Component.E));
		// expect(Component.exp(Component.TWO.neg)).toEqual(Component.ONE.div(E2));
	});

	it("pow", function() {
		expect(Component.TWO.pow(Component.TWO)).toEqual(Component.FOUR);
		expect(Component.create("25").pow(Component.create("0.5"))).toEqual(Component.FIVE);
	});
});

describe("Logarithm", function() {
	test("calls with correct context", function() {
		Component.ln(Component.THREE);
		properContext();
	});

	it("ln", function() {
		expect(() => Component.ln(Component.ZERO)).toThrow();
		expect(Component.ln(Component.ONE)).toEqual(Component.ZERO);
		expect(Component.ln(Component.create("10"))).toEqual(Component.round(Component.ln10, mathenv.mode));
		expect(Component.ln(Component.create("0.1"))).toEqual(Component.round(Component.ln10.neg, mathenv.mode));
	});
});

describe("Trigonometry", function() {
	const context = MathContext.HIGH_PRECISION;

	describe("sine", function() {
		test("calls with correct context", function() {
			Component.sin(Component.TWO);
			properContext();
		});

		test("odd multiples of pi/2", function() {
			const piby2 = Component.PI.div(Component.TWO);
			for(let i = 0; i < 10; i++) {
				const x = Component.create(2*i+1).mul(piby2);
				expect(Component.sin(x)).toEqual(i%2 == 0? Component.ONE: Component.ONE.neg);
			}
		});

		test("multiples of pi", function() {
			const pi = Component.PI;
			for(let i = 0; i < 10; i++) {
				const x = Component.create(i).mul(pi, context);;
				expect(Component.sin(x)).toEqual(Component.ZERO);
			}
		});

		it("is an odd function", function() {
			const values = new Array(10).fill(0)
							.map(() => Component.create(Math.random()));
			for(let x of values)
				expect(Component.sin(x.neg)).toEqual(Component.sin(x).neg);
		});
	});

	describe("cosine", function() {
		test("calls with correct context", function() {
			Component.cos(Component.TWO);
			properContext();
		});

		it("Multiples of pi", function() {
			const pi = Component.PI;
			for(let n = 0; n < 10; n++) {
				const x = Component.create(n).mul(pi);
				expect(Component.cos(x)).toEqual(n%2 == 0? Component.ONE: Component.ONE.neg);
			}
		});

		it("Odd multiples of pi/2", function() {
			const piby2 = Component.PI.div(Component.TWO, context);
			for(let n = 0; n < 10; n++) {
				const f = Component.create(2 * n + 1);
				const x = f.mul(piby2, context);
				expect(Component.cos(x)).toEqual(Component.ZERO);
			}
		});

		it("is an even function", function() {
			const values = new Array(10).fill(0)
							.map(() => Component.create(Math.random()));
			for(let x of values)
				expect(Component.cos(x.neg)).toEqual(Component.cos(x));
		});
	});
});

describe("Inverse trigonometry", function() {
	describe("arc sine", function() {
		test("calls with correct context", function() {
			Component.asin(Component.create("0.3"));
			properContext();
		});

		it("returns correct values", function() {
			const values = new Array(10).fill(0)
							.map((_, i) => `0.${i}`)
							.map(x => Component.create(x));
			const asins = [
				"0",
				"0.10016742116155980",
				"0.20135792079033080",
				"0.30469265401539751",
				"0.41151684606748802",
				"0.52359877559829888",
				"0.64350110879328439",
				"0.77539749661075307",
				"0.92729521800161224",
				"1.11976951499863419"
			].map(x => Component.create(x));
			for(let i = 0; i < asins.length; i++)
				expect(Component.asin(values[i])).toEqual(asins[i]);
		});

		test("identity property", function() {
			const ctx = {
				precision: mathenv.mode.precision + 5,
				rounding: mathenv.mode.rounding
			}
			const identity = (x: Component) => {
				const sin = Component.sin(x, ctx);
				const asin = Component.asin(sin, ctx);
				return Component.round(asin, mathenv.mode);
			}
			for(let i = 0; i < Math.PI/2; i += 0.1) {
				const x = Component.create(i);
				expect(identity(x)).toEqual(x);
			}
		});

		it("is an odd function", function() {
			const values = new Array(10).fill(0)
							.map(() => Math.random())
							.map(x => Component.create(x));
			for(let x of values)
				expect(Component.asin(x.neg)).toEqual(Component.asin(x).neg);
		});

		it("throws errors", function() {
			const values = new Array(10).fill(0)
							.map(() => 1.1 + Math.random())
							.map(x => Component.create(x));
			for(let x of values)
				expect(() => Component.asin(x)).toThrow();
			for(let x of values)
				expect(() => Component.asin(x.neg)).toThrow();
		});
	});

	describe("arc cosine", function() {
		test("calls with correct context", function() {
			Component.acos(Component.create("0.3"));
			properContext();
		});

		it("returns correct values", function() {
			const values = new Array(9).fill(0)
							.map((_, i) => Component.create(`0.${i+1}`))
							.concat([Component.ONE]);
			const acoss = [
				"1.47062890563333683",
				"1.36943840600456583",
				"1.26610367277949912",
				"1.15927948072740860",
				"1.04719755119659775",
				"0.92729521800161224",
				"0.79539883018414356",
				"0.64350110879328439",
				"0.45102681179626244",
				"0"
			].map(x => Component.create(x));
			for(let i = 0; i < acoss.length; i++)
				expect(Component.acos(values[i])).toEqual(acoss[i]);
		});

		test("identity property", function() {
			const ctx = {
				precision: mathenv.mode.precision + 5,
				rounding: mathenv.mode.rounding
			}
			const identity = (x: Component) => {
				const cos = Component.cos(x, ctx);
				const acos = Component.acos(cos, ctx);
				return Component.round(acos, mathenv.mode);
			}
			for(let i = 0; i < Math.PI/2; i += 0.1) {
				const x = Component.create(i);
				expect(identity(x)).toEqual(x);
			}
		});

		it("throws errors", function() {
			const values = new Array(10).fill(0)
							.map(() => 1.1 + Math.random())
							.map(x => Component.create(x));
			for(let x of values)
				expect(() => Component.acos(x)).toThrow();
			for(let x of values)
				expect(() => Component.acos(x.neg)).toThrow();
		});
	});

	describe("arc tan", function() {
		test("calls with correct context", function() {
			Component.atan(Component.THREE);
			properContext();
		});

		it("returns correct values", function() {
			const values = [
				"0.1",
				"0.5",
				"1",
				"1.5",
				"10",
				"15",
				"100",
				"150"
			].map(x => Component.create(x));
			const atans = [
				"0.09966865249116203",
				"0.46364760900080612",
				"0.78539816339744831",
				"0.98279372324732907",
				"1.4711276743037346",
				"1.50422816301907282",
				"1.56079666010823139",
				"1.56412975889102839"
			].map(x => Component.create(x));
			for(let i = 0; i < values.length; i++)
				expect(Component.atan(values[i])).toEqual(atans[i]);
		});

		test("identity property", function() {
			const ctx = {
				precision: mathenv.mode.precision + 5,
				rounding: mathenv.mode.rounding
			}
			const identity = (x: Component) => {
				const tan = Component.tan(x, ctx);
				const atan = Component.atan(tan, ctx);
				return Component.round(atan, mathenv.mode);
			}
			for(let i = 0; i < Math.PI/2; i += 0.1) {
				const x = Component.create(i);
				expect(identity(x)).toEqual(x);
			}
		});

		it("is an odd function", function() {
			const values = new Array(10).fill(0)
							.map(() => Math.random())
							.map(x => Component.create(x));
			for(let x of values)
				expect(Component.atan(x.neg)).toEqual(Component.atan(x).neg);
		});
	});

	describe("atan2", function() {
		test("calls with correct context", function() {
			Component.atan2(Component.THREE, Component.FIVE.neg);
			properContext();
		});

		describe("returns correct values", function() {
			const ctx = MathContext.HIGH_PRECISION;
			const piBy2 = Component.PI.div(Component.TWO, ctx);
			test("in Quadrant I", function() {
				const angles = new Array(9).fill(0)
								.map((_, i) => Component.create(`0.${i+1}`))
								.map(x => piBy2.mul(x));
				const X = angles.map(x => Component.cos(x, ctx));
				const Y = angles.map(x => Component.sin(x, ctx));
				for(let i = 0; i < angles.length; i++) {
					expect(Component.atan2(Y[i], X[i])).toEqual(angles[i]);
				}
			});

			test("in Quadrant II", function() {
				const angles = new Array(9).fill(0)
								.map((_, i) => Component.create(`0.${i+1}`))
								.map(x => piBy2.mul(x, ctx).add(piBy2));
				const X = angles.map(x => Component.cos(x, ctx));
				const Y = angles.map(x => Component.sin(x, ctx));
				for(let i = 0; i < angles.length; i++) {
					expect(Component.atan2(Y[i], X[i])).toEqual(angles[i]);
				}
			});

			test("in Quadrant III", function() {
				const angles = new Array(9).fill(0)
								.map((_, i) => Component.create(`0.${i+1}`))
								.map(x => piBy2.mul(x, ctx).add(Component.PI));
				const X = angles.map(x => Component.cos(x, ctx));
				const Y = angles.map(x => Component.sin(x, ctx));
				for(let i = 0; i < angles.length; i++) {
					expect(Component.atan2(Y[i], X[i])).toEqual(angles[i].sub(Component.TWO.mul(Component.PI)));
				}
			});

			test("in Quadrant IV", function() {
				const angles = new Array(9).fill(0)
								.map((_, i) => Component.create(`0.${i+1}`))
								.map(x => piBy2.mul(x, ctx).add(Component.THREE.mul(piBy2)));
				const X = angles.map(x => Component.cos(x, ctx));
				const Y = angles.map(x => Component.sin(x, ctx));
				for(let i = 0; i < angles.length; i++) {
					expect(Component.atan2(Y[i], X[i])).toEqual(angles[i].sub(Component.TWO.mul(Component.PI)));
				}
			});
		});
	});
});

describe("Hyperbolic trigonometry", function() {
		test("calls with correct context", function() {
			Component.sinh(Component.THREE);
			properContext();
		});

	describe("sinh", function() {
		it("returns correct values", function() {
			const alsosinh = (x: Component) => {
				const ctx: MathContext = {
					precision: 2 * mathenv.mode.precision,
					rounding: mathenv.mode.rounding
				}
				const res = Component.exp(x, ctx).sub(Component.exp(x.neg, ctx)).div(Component.TWO, ctx);
				return Component.round(res, mathenv.mode);
			}
			for(let i = 0; i < 10; i++) {
				const x = Component.create(i);
				expect(Component.sinh(x)).toEqual(alsosinh(x));
			}
		});
	});

	describe("cosh", function() {
		it("calls with correct context", function() {
			Component.cosh(Component.THREE);
			properContext();
		});

		it("returns correct values", function() {
			const alsocosh = (x: Component) => {
				const ctx: MathContext = {
					precision: 2 * mathenv.mode.precision,
					rounding: mathenv.mode.rounding
				}
				const res = Component.exp(x, ctx).add(Component.exp(x.neg, ctx)).div(Component.TWO, ctx);
				return Component.round(res, mathenv.mode);
			}
			for(let i = 0; i < 10; i++) {
				const x = Component.create(i);
				expect(Component.cosh(x)).toEqual(alsocosh(x));
			}
		});
	});

	describe("tanh", function() {
		it("calls with correct context", function() {
			Component.tanh(Component.THREE);
			properContext();
		});

		it("returns correct values", function() {
			const alsotanh = (x: Component) => {
				const ctx: MathContext = {
					precision: 2 * mathenv.mode.precision,
					rounding: mathenv.mode.rounding
				}
				const num = Component.exp(Component.TWO.mul(x, ctx), ctx).sub(Component.ONE, ctx);
				const den = Component.exp(Component.TWO.mul(x, ctx), ctx).add(Component.ONE, ctx);
				const res = num.div(den, ctx);
				return Component.round(res, mathenv.mode);
			}
			for(let i = 0; i < 10; i++) {
				const x = Component.create(i);
				expect(Component.tanh(x)).toEqual(alsotanh(x));
			}
		});
	});
});

describe("Inverse hyperbolic trigonometry", function() {
	const ctx = {
		precision: 2 * mathenv.mode.precision,
		rounding: mathenv.mode.rounding
	}

	describe("asinh", function() {
		it("calls with correct context", function() {
			Component.asinh(Component.THREE);
			properContext();
		});

		test("identity property", function() {
			const identity = (x: Component) => {
				const sinh = Component.sinh(x, ctx);
				const asinh = Component.asinh(sinh, ctx);
				return Component.round(asinh, mathenv.mode);
			}
			for(let i = 0; i < 10; i++) {
				const x = Component.create(i);
				expect(identity(x)).toEqual(x);
			}
		});
	});

	describe("acosh", function() {
		it("calls with correct context", function() {
			Component.acosh(Component.THREE);
			properContext();
		});

		test("identity property", function() {
			const identity = (x: Component) => {
				const cosh = Component.cosh(x, ctx);
				const acosh = Component.acosh(cosh, ctx);
				return Component.round(acosh, mathenv.mode);
			}
			for(let i = 0; i < 10; i++) {
				const x = Component.create(i);
				expect(identity(x)).toEqual(x);
			}
		});

		it("throws appropriate errors", function() {
			for(let i = 0; i < 10; i++) {
				const x = Component.create(Math.random()-0.1);
				expect(() => Component.acosh(x)).toThrow();
			}
		});
	});

	describe("atanh", function() {
		it("calls with correct context", function() {
			Component.atanh(Component.create("0.5"));
			properContext();
		});

		test("identity property", function() {
			const identity = (x: Component) => {
				const tanh = Component.tanh(x, ctx);
				const atanh = Component.atanh(tanh, ctx);
				return Component.round(atanh, mathenv.mode);
			}
			for(let i = 0; i < 10; i++) {
				const x = Component.create(`0.${i}`);
				expect(identity(x)).toEqual(x);
			}
		});

		it("throws appropriate errors", function() {
			for(let i = 0; i < 10; i++) {
				const x = Component.create(1.1 + Math.random());
				expect(() => Component.atanh(x)).toThrow();
			}
		});
	});
});