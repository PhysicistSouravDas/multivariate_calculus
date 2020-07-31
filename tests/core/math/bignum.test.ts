import { BigNum } from "../../../src/core/math/bignum";
import { Component } from "../../../src/core/math/component";
import { mathenv } from "../../../src/core/env";
import { MathContext, RoundingMode } from "../../../src/core/math/context";
import { DivisionByZero, UndefinedValue } from "../../../src/core/errors";

const mock_add = jest.fn(BigNum.prototype.add);
const mock_sub = jest.fn(BigNum.prototype.sub);
const mock_mul = jest.fn(BigNum.prototype.mul);
const mock_div = jest.fn(BigNum.prototype.div);
const mock_inv = jest.fn(BigNum.prototype.inv);
const mock_norm = jest.fn(BigNum.prototype.norm);
const mock_abs = jest.fn(BigNum.abs);
const mock_absSq = jest.fn(BigNum.absSq);

const mocks = [
	mock_add,
	mock_sub,
	mock_mul,
	mock_div,
	mock_inv,
	mock_norm,
	mock_abs,
	mock_absSq
];
BigNum.prototype.add = mock_add;
BigNum.prototype.sub = mock_sub;
BigNum.prototype.mul = mock_mul;
BigNum.prototype.div = mock_div;
BigNum.prototype.inv = mock_inv;
BigNum.prototype.norm = mock_norm;
BigNum.abs = mock_abs;
BigNum.absSq = mock_absSq;

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

describe("Creates numbers", function() {
	describe("from constructor", function() {
		it("from 1 real", function() {
			const a = new BigNum(Component.create("5"));
			expect(a.dim).toBe(1);
			expect(a.components.length).toBe(1);
			expect(a.components).toEqual([Component.create("5")]);
		});
	
		it("from 2 reals", function() {
			const comps = [Component.create("5"), Component.create("1")];
			const a = new BigNum(Component.create("5"), Component.create("1"));
			expect(a.dim).toBe(2);
			expect(a.components.length).toBe(2);
			expect(a.components).toEqual(comps);
		});
	
		it("from 3 reals", function() {
			const comps = [Component.create("5"), Component.create("4"), Component.create("1")];
			const a = new BigNum(comps);
			expect(a.dim).toBe(4);
			expect(a.components.length).toBe(4);
			expect(a.components).toEqual(comps.concat(Component.create("0")));
		});
	});

	describe("from wrapper functions", function() {
		it("from 1 real", function() {
			const a = BigNum.real("5");
			expect(a.dim).toBe(1);
			expect(a.components.length).toBe(1);
			expect(a.components).toEqual([Component.create("5")]);
		});
	
		it("from 2 reals", function() {
			const comps = [Component.create("5"), Component.create("1")];
			const a = BigNum.complex("5", "1");
			expect(a.dim).toBe(2);
			expect(a.components.length).toBe(2);
			expect(a.components).toEqual(comps);
		});
	
		it("from 3 reals", function() {
			const comps = [Component.create("5"), Component.create("4"), Component.create("1")];
			const a = BigNum.hyper(comps.map(x => x.toString()));
			expect(a.dim).toBe(4);
			expect(a.components.length).toBe(4);
			expect(a.components).toEqual(comps.concat(Component.create("0")));
		});
	});
});

describe("Negates", function() {
	it("Creates additive inverse", function() {
		const a = new BigNum(Component.create("5"), Component.create("1"), Component.create("4"));
		expect(a.add(a.neg)).toEqual(new BigNum(Component.create("0")));
	});
});

describe("Conjugates", function() {
	describe("Real", function() {
		it("Zero", function() {
			const a = new BigNum(Component.ZERO);
			expect(a.conj).toEqual(a);
		});

		it("Non-zero", function() {
			for(let i = 1; i <= 10; i++) {
				const sa = "" + i;
				const sna = "-" + i;
				const a = new BigNum(Component.create(sa));
				const na = new BigNum(Component.create(sna));
				expect(a.conj).toEqual(a);
				expect(na.conj).toEqual(na);
			}
		});
	});

	describe("Complex", function() {
		it("Purely imaginary", function() {
			for(let i = 1; i <= 10; i++) {
				const sa = "" + i;
				const sna = "-" + i;
				const a = new BigNum(Component.ZERO, Component.create(sa));
				const na = new BigNum(Component.ZERO, Component.create(sna));
				expect(a.conj).toEqual(na);
			}
		});

		it("Real and imaginary", function() {
			const a = Component.create("5");
			for(let i = 1; i <= 10; i++) {
				const b = Component.create("" + i);
				const nb = Component.create("-" + i);
				const z = new BigNum(a, b);
				const z_ = new BigNum(a, nb);
				expect(z.conj).toEqual(z_);
			}
		});

		it("Involution", function() {
			const a = Component.create("5");
			for(let i = 1; i <= 10; i++) {
				const b = Component.create("" + i);
				const z = new BigNum(a, b);
				expect(z.conj.conj).toEqual(z);
			}
		});
	});
});

describe("Rounding", function() {
	describe("round up", function() {
		test("rounding for real", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.UP
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.real(s));
			const rounded = [
				"5.1", "5.0", "-5.1", "-5.0", "5", "-5"
			].map(s => BigNum.real(s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for imaginary", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.UP
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.complex("0", s));
			const rounded = [
				"5.1", "5.0", "-5.1", "-5.0", "5", "-5"
			].map(s => BigNum.complex("0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for hyper-complex", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.UP
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.hyper(s, "0", s));
			const rounded = [
				"5.1", "5.0", "-5.1", "-5.0", "5", "-5"
			].map(s => BigNum.hyper(s, "0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});
	});

	describe("round down", function() {
		test("rounding for real", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.DOWN
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.real(s));
			const rounded = [
				"5.0", "5.0", "-5.0", "-5.0", "5", "-5"
			].map(s => BigNum.real(s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for imaginary", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.DOWN
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.complex("0", s));
			const rounded = [
				"5.0", "5.0", "-5.0", "-5.0", "5", "-5"
			].map(s => BigNum.complex("0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for hyper-complex", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.DOWN
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.hyper(s, "0", s));
			const rounded = [
				"5.0", "5.0", "-5.0", "-5.0", "5", "-5"
			].map(s => BigNum.hyper(s, "0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});
	});

	describe("round ceil", function() {
		test("rounding for real", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.CEIL
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.real(s));
			const rounded = [
				"5.1", "5.1", "-5.0", "-5.0", "5", "-5"
			].map(s => BigNum.real(s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for imaginary", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.CEIL
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.complex("0", s));
			const rounded = [
				"5.1", "5.1", "-5.0", "-5.0", "5", "-5"
			].map(s => BigNum.complex("0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for hyper-complex", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.CEIL
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.hyper(s, "0", s));
			const rounded = [
				"5.1", "5.1", "-5.0", "-5.0", "5", "-5"
			].map(s => BigNum.hyper(s, "0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});
	});

	describe("round floor", function() {
		test("rounding for real", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.FLOOR
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.real(s));
			const rounded = [
				"5.0", "5.0", "-5.1", "-5.1", "5", "-5"
			].map(s => BigNum.real(s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for imaginary", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.FLOOR
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.complex("0", s));
			const rounded = [
				"5.0", "5.0", "-5.1", "-5.1", "5", "-5"
			].map(s => BigNum.complex("0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});

		test("rounding for hyper-complex", function() {
			const ctx: MathContext = {
				precision: 1,
				rounding: RoundingMode.FLOOR
			}
			const decimal = [
				"5.01", "5.001", "-5.01", "-5.001", "5.0", "-5.0"
			].map(s => BigNum.hyper(s, "0", s));
			const rounded = [
				"5.0", "5.0", "-5.1", "-5.1", "5", "-5"
			].map(s => BigNum.hyper(s, "0", s));
			decimal.forEach((n, i) => expect(BigNum.round(n, ctx)).toEqual(rounded[i]));
		});
	});
});

describe("Adds", function() {
	it("for 1 real", function() {
		const a = new BigNum(Component.create("5"));
		const b = new BigNum(Component.create("2"));
		const sum = new BigNum(Component.create("7"));
		expect(a.add(b)).toEqual(sum);
	});

	it("for 2 reals", function() {
		const a = new BigNum(Component.create("5"), Component.create("1"));
		const b = new BigNum(Component.create("2"), Component.create("3"));
		const sum = new BigNum(Component.create("7"), Component.create("4"));
		expect(a.add(b)).toEqual(sum);
	});

	it("for 3 reals", function() {
		const a = new BigNum(Component.create("5"), Component.create("1"), Component.create("4"));
		const b = new BigNum(Component.create("2"), Component.create("3"), Component.create("1"));
		const sum = new BigNum(Component.create("7"), Component.create("4"), Component.create("5"));
		expect(a.add(b)).toEqual(sum);
	});

	it("for mixed number of reals", function() {
		const a = new BigNum(Component.create("5"));
		const b = new BigNum(Component.create("2"), Component.create("4"));
		const sum = new BigNum(Component.create("7"), Component.create("4"));
		expect(() => a.add(b)).not.toThrow();
		expect(a.add(b)).toEqual(sum);
	});
});


describe("Subtracts", function() {
	it("for 1 real", function() {
		const a = new BigNum(Component.create("5"));
		const b = new BigNum(Component.create("2"));
		const diff = new BigNum(Component.create("3"));
		expect(a.sub(b)).toEqual(diff);
	});

	it("for 2 reals", function() {
		const a = new BigNum(Component.create("5"), Component.create("1"));
		const b = new BigNum(Component.create("2"), Component.create("3"));
		const diff = new BigNum(Component.create("3"), Component.create("-2"));
		expect(a.sub(b)).toEqual(diff);
	});

	it("for 3 reals", function() {
		const a = new BigNum(Component.create("5"), Component.create("1"), Component.create("4"));
		const b = new BigNum(Component.create("2"), Component.create("3"), Component.create("1"));
		const diff = new BigNum(Component.create("3"), Component.create("-2"), Component.create("3"));
		expect(a.sub(b)).toEqual(diff);
	});

	it("for mixed number of reals", function() {
		const a = new BigNum(Component.create("5"));
		const b = new BigNum(Component.create("2"), Component.create("4"));
		const diff = new BigNum(Component.create("3"), Component.create("-4"));
		expect(() => a.sub(b)).not.toThrow();
		expect(a.sub(b)).toEqual(diff);
	});
});

describe("Multiplies", function() {
	it("for 1 real", function() {
		const a = new BigNum(Component.create("5"));
		const b = new BigNum(Component.create("7"));
		const prod = new BigNum(Component.create("35"));
		expect(a.mul(b)).toEqual(prod);
	});

	it("for 2 reals", function() {
		const a = new BigNum(Component.create("5"), Component.create("1"));
		const b = new BigNum(Component.create("7"), Component.create("3"));
		const prod = new BigNum(Component.create("32"), Component.create("22"));
		expect(a.mul(b)).toEqual(prod);
	});

	it("for 3 reals", function() {
		const a = new BigNum(Component.ZERO, Component.create("1"), Component.create("2"));
		const b = new BigNum(Component.ZERO, Component.create("2"), Component.create("1"));
		const prod = new BigNum(Component.create("-4"), Component.ZERO, Component.ZERO, Component.create("-3"));
		expect(() => a.mul(b)).not.toThrow();
		expect(a.mul(b)).toEqual(prod);
	});

	it("for 5 reals", function() {
		const A = new Array(5).fill(0).map(() => Component.ZERO);
		const B = new Array(5).fill(0).map(() => Component.ZERO);
		A[4] = Component.ONE;
		B[1] = Component.ONE;
		const a = new BigNum(A);
		const b = new BigNum(B);
		const p = new Array(5).fill(0).map(() => Component.ZERO);
		p.push(Component.ONE.neg);
		const prod = new BigNum(p);
		expect(a.mul(b)).toEqual(prod);
	});

	it("i^2 = -1", function() {
		for(let i = 1; i < 10; i++) {
			const A = new Array(10).fill(0).map(() => Component.ZERO);
			A[i] = Component.ONE;
			const a = new BigNum(A);
			expect(a.mul(a)).toEqual(new BigNum(Component.ONE.neg));
		}
	});
});

describe("Absolute value", function() {
	it("for 1 real", function() {
		const a = new BigNum(Component.create("5"));
		expect(BigNum.abs(a)).toEqual(a);
		expect(BigNum.abs(a.neg)).toEqual(a);
	});

	it("for 2 reals", function() {
		const a = new BigNum(Component.THREE, Component.FOUR);
		const abs = new BigNum(Component.FIVE);
		expect(BigNum.abs(a)).toEqual(abs);
		expect(BigNum.abs(a.conj)).toEqual(abs);
	});

	it("zz* = |z|^2", function() {
		const a = new BigNum(Component.THREE, Component.FOUR);
		const mag = BigNum.abs(a);
		expect(mag.mul(mag)).toEqual(a.mul(a.conj));
	});
});

describe("Normalises", function() {
	it("for 1 real", function() {
		const a = new BigNum(Component.FIVE);
		expect(a.norm()).toEqual(a.mul(a));
		expect(a.neg.norm()).toEqual(a.mul(a));
	});

	it("for 3 reals", function() {
		const a = new BigNum(Component.ONE, Component.TWO, Component.TWO);
		const norm = new BigNum(Component.NINE);
		expect(a.norm()).toEqual(norm);
	});

	it("equality with absolute value function", function() {
		const a = new BigNum(Component.ONE, Component.TWO, Component.TWO, Component.ONE, Component.TWO, Component.TWO);
		expect(a.norm()).toEqual(BigNum.absSq(a));
	});
});

describe("Inverse", function() {
	test("for 1 real", function() {
		const a = BigNum.real("5");
		const inv = BigNum.real("0.2");
		expect(a.inv()).toEqual(inv);
	});

	test("for 2 reals", function() {
		const a = BigNum.complex("3", "4");
		const inv = BigNum.complex("0.12", "-0.16");
		expect(a.inv()).toEqual(inv);
	});

	it("throws appropriate errors", function() {
		expect(() => BigNum.real(0).inv()).toThrow(DivisionByZero);
	});
});

describe("Divides", function() {
	describe("for 1 real", function() {
		const a = BigNum.real("5");
		it("right division", function() {
			expect(a.div(a, "right")).toEqual(BigNum.real("1"));
		});

		it("left division", function() {
			expect(a.div(a, "left")).toEqual(BigNum.real("1"));
		});
	});

	describe("for 2 reals", function() {
		const a = BigNum.complex("3", "4");
		it("right division", function() {
			expect(a.div(a, "right")).toEqual(BigNum.real("1"));
		});

		it("left division", function() {
			expect(a.div(a, "left")).toEqual(BigNum.real("1"));
		});
	});

	describe("for 6 reals", function() {
		const a = BigNum.hyper("3", "3", "2", "1", "1", "1");
		it("right division", function() {
			expect(a.div(a, "right")).toEqual(BigNum.real("1"));
		});

		it("left division", function() {
			expect(a.div(a, "left")).toEqual(BigNum.real("1"));
		});
	});
});

describe("Exponential", function() {
	test("calls with proper context", function() {
		BigNum.exp(BigNum.hyper([1, 0, 5, 2]));
		properContext();
	});

	it("for 1 real", function() {
		expect(BigNum.exp(BigNum.real("0"))).toEqual(BigNum.real("1"));
		expect(BigNum.exp(BigNum.real("1"))).toEqual(new BigNum(Component.round(Component.E, mathenv.mode)));
		expect(BigNum.exp(BigNum.real("2"))).toEqual(new BigNum(Component.E.mul(Component.E)));
	});

	it("for 2 reals", function() {
		const i_pi = new BigNum(Component.ZERO, Component.PI);
		expect(BigNum.exp(i_pi)).toEqual(BigNum.real("1").neg);
	});

	it("for 4 reals", function() {
		const v = BigNum.hyper("0", "1", "2", "2");
		const abs = BigNum.abs(v);
		const [c, s] = BigNum.exp(new BigNum(Component.ZERO, abs.components[0])).components;
		const cos = new BigNum(c);
		const sin = new BigNum(s);
		const exp = cos.add(v.div(abs).mul(sin));
		expect(BigNum.exp(v)).toEqual(exp);
	});
});

describe("Logarithm", function() {

	describe("ln", function() {
		test("calls with proper context", function() {
			BigNum.ln(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		test("for positive reals", function() {
			for(let i = 1; i < 10; i++) {
				const x = BigNum.real(i);
				const x_ = Component.create(i);
				expect(BigNum.ln(x).components[0]).toEqual(Component.ln(x_))
			}
		});

		test("for negative reals", function() {
			for(let i = 1; i < 10; i++) {
				const x = BigNum.real(i).neg;
				const x_ = Component.create(i);
				const ln = BigNum.ln(x);
				expect(ln.dim).toBe(2);
				expect(ln.components[0]).toEqual(Component.ln(x_));
				expect(ln.components[1]).toEqual(Component.round(Component.PI, mathenv.mode));
			}
		});

		test("for 2 reals", function() {
			const lnRoot2 = Component.ln(Component.TWO.pow(Component.create("0.5")));
			const piBy4 = Component.PI.mul(Component.create("0.25"));
			const pi3by4 = Component.PI.mul(Component.create("0.75"));
			const values = [
				BigNum.complex("1", "1"),
				BigNum.complex("1", "-1"),
				BigNum.complex("-1", "1"),
				BigNum.complex("-1", "-1")
			];
			const logs = [
				new BigNum(lnRoot2, piBy4),
				new BigNum(lnRoot2, piBy4.neg),
				new BigNum(lnRoot2, pi3by4),
				new BigNum(lnRoot2, pi3by4.neg)
			];
			for(let i = 0; i < values.length; i++)
				expect(BigNum.ln(values[i])).toEqual(logs[i]);
		});

		test("for 6 reals", function() {
			const piBy2 = Component.PI.div(Component.TWO);
			const x = BigNum.hyper("0", "3", "2", "1", "1", "1").div(BigNum.real("4"));
			const log = new BigNum(piBy2).mul(x);
			expect(BigNum.ln(x)).toEqual(log);
		});

		it("throws appropriate errors", function() {
			expect(() => BigNum.ln(BigNum.real(0))).toThrow(UndefinedValue);
		});
	});
});

describe("Trigonometry", function() {
	describe("sine", function() {
		test("calls with proper context", function() {
			BigNum.sin(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});
	
		it("for 1 real", function() {
			for(let i = 0; i < 10; i++) {
				const x = BigNum.real(i);
				const x_ = Component.create(i);
				const res = BigNum.sin(x);
				expect(res.dim).toBe(1);
				expect(res.components[0]).toEqual(Component.sin(x_));
			}
		});

		it("for complex", function() {
			const values = [
				BigNum.complex("0", "1"),
				BigNum.complex("0", "-1"),
				BigNum.complex("1", "1")
			];
			const sins = [
				new BigNum(Component.ZERO, Component.sinh(Component.ONE)),
				new BigNum(Component.ZERO, Component.sinh(Component.ONE.neg)),
				(function(x: BigNum) {
					const ctx = {
						precision: 2 * mathenv.mode.precision,
						rounding: mathenv.mode.rounding
					};
					const a = x.mul(BigNum.complex("0", "1"), ctx);
					const num = BigNum.exp(a, ctx).sub(BigNum.exp(a.neg, ctx), ctx);
					const res = num.div(BigNum.complex("0", "2"), ctx);
					return BigNum.round(res, mathenv.mode);
				})(values[2])
			];
			for(let i = 0; i < values.length; i++) {
				const res = BigNum.sin(values[i]);
				expect(res.dim).toBe(2);
				expect(res).toEqual(sins[i]);
			}
		});
	});

	describe("cosine", function() {
		test("calls with proper context", function() {
			BigNum.cos(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});
	
		it("for 1 real", function() {
			for(let i = 0; i < 10; i++) {
				const x = BigNum.real(i);
				const x_ = Component.create(i);
				const res = BigNum.cos(x);
				expect(res.dim).toBe(1);
				expect(res.components[0]).toEqual(Component.cos(x_));
			}
		});

		it("for complex", function() {
			const values = [
				BigNum.complex("0", "1"),
				BigNum.complex("0", "-1"),
				BigNum.complex("1", "1")
			];
			const coss = [
				new BigNum(Component.cosh(Component.ONE)),
				new BigNum(Component.cosh(Component.ONE)),
				(function(x: BigNum) {
					const ctx = {
						precision: 2 * mathenv.mode.precision,
						rounding: mathenv.mode.rounding
					}
					const a = x.mul(BigNum.complex("0", "1"));
					const num = BigNum.exp(a, ctx).add(BigNum.exp(a.neg, ctx), ctx);
					const res = num.div(BigNum.real("2"));
					return BigNum.round(res, mathenv.mode);
				})(values[2])
			];
			for(let i = 0; i < values.length; i++) {
				const res = BigNum.cos(values[i]);
				expect(res).toEqual(coss[i]);
			}
		});
	});
});

describe("Inverse trigonometry", function() {
	describe("asin", function() {
		test("calls with proper context", function() {
			BigNum.asin(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});
	
		test("for real", function() {
			const three = Component.THREE, two = Component.TWO, half = Component.create("0.5");
			const values = [
				BigNum.real("1"),
				BigNum.real("-1"),
				BigNum.real("2")
			];
			const asin = [
				new BigNum(Component.PI.div(two)),
				new BigNum(Component.PI.div(two)).neg,
				new BigNum(Component.PI.div(two), Component.ln(two.add(three.pow(half))))
			];
			for(let i = 0; i < values.length; i++)
				expect(BigNum.asin(values[i])).toEqual(asin[i]);
		});

		test("for imaginary", function() {
			const values = new Array(10).fill(0)
										.map((_, i) => `${10 * i}`)
										.map(x => BigNum.complex("0", x));
			const asin = new Array(10).fill(0)
										.map((_, i) => `${10 * i}`)
										.map(x => Component.create(x))
										.map(x => new BigNum(Component.ZERO, Component.asinh(x)));
			for(let i = 0; i < values.length; i++) {
				const x = values[i];
				expect(BigNum.asin(x)).toEqual(asin[i]);
			}
		});
	});

	describe("acos", function() {
		test("calls with proper context", function() {
			BigNum.acos(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});
	
		test("for real", function() {
			const three = Component.THREE, two = Component.TWO, half = Component.create("0.5");
			const values = [
				BigNum.real("1"),
				BigNum.real("-1"),
				BigNum.real("2")
			];
			const acos = [
				new BigNum(Component.ZERO),
				new BigNum(Component.round(Component.PI, mathenv.mode)),
				new BigNum(Component.ZERO, Component.ln(two.add(three.pow(half))).neg)
			];
			for(let i = 0; i < values.length; i++)
				expect(BigNum.acos(values[i])).toEqual(acos[i]);
		});

		test("for imaginary", function() {
			const pi = Component.PI, two = Component.TWO;
			const values = new Array(10).fill(0)
										.map((_, i) => `${10 * (i+1)}`)
										.map(x => BigNum.complex("0", x));
			const acos = new Array(10).fill(0)
										.map((_, i) => `${10 * (i+1)}`)
										.map(x => Component.create(x))
										.map(x => new BigNum(pi.div(two), Component.asinh(x).neg));
			for(let i = 0; i < values.length; i++) {
				const x = values[i];
				expect(BigNum.acos(x)).toEqual(acos[i]);
			}
		});
	});

	describe("atan", function() {
		test("calls with proper context", function() {
			BigNum.atan(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});
	
		it("for real", function() {
			const values = [
				"1", "-1", "2", "-2", "1000000", "10000000000"
			].map(x => BigNum.real(x));
			const atan = [
				"0.78539816339744831",
				"-0.78539816339744831",
				"1.10714871779409051",
				"-1.10714871779409051",
				"1.57079532679489662",
				"1.57079632669489662"
			].map(x => BigNum.real(x));
			for(let i = 0; i < values.length; i++)
				expect(BigNum.atan(values[i])).toEqual(atan[i]);
		});

		it("imaginary", function() {
			const strings = [
				"0.5",
				"-0.5",
				"0.9",
				"-0.9",
			];
			for(let s of strings) {
				const x = BigNum.complex("0", s);
				const atan = new BigNum(Component.ZERO, Component.atanh(Component.create(s)));
				expect(BigNum.atan(x)).toEqual(atan);
			}
			expect(() => BigNum.atan(BigNum.complex("0", "2"))).toThrow();
		});

		it("throws appropriate errors", function() {
			expect(() => BigNum.atan(BigNum.complex(0, 2))).toThrow(UndefinedValue);
		});
	});
});

describe("Hyperbolic trigonometry", function() {
	describe("sinh", function() {
		test("calls with proper context", function() {
			BigNum.sinh(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		it("for real", function() {
			const values = new Array(6).fill(0).map((_, i) => i.toString()).map(x => BigNum.real(x));
			const sinhs = [
				"0",
				"1.17520119364380146",
				"3.62686040784701877",
				"10.01787492740990190",
				"27.28991719712775245",
				"74.20321057778875898"
			].map(x => BigNum.real(x));
			values.forEach((x, i) => expect(BigNum.sinh(x)).toEqual(sinhs[i]));
			values.forEach((x, i) => expect(BigNum.sinh(x.neg)).toEqual(sinhs[i].neg));
		});

		it("for imaginary", function() {
			const values = new Array(10).fill(0).map((_, i) => BigNum.complex("0", i.toString()));
			const sinhs = new Array(10).fill(0)
									.map((_, i) => Component.create(`${i}`))
									.map(x => new BigNum(Component.ZERO, Component.sin(x)));
			values.forEach((x, i) => expect(BigNum.sinh(x)).toEqual(sinhs[i]));
		});
	});

	describe("cosh", function() {
		test("calls with proper context", function() {
			BigNum.cosh(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		it("for real", function() {
			const values = new Array(6).fill(0).map((_, i) => i.toString()).map(x => BigNum.real(x));
			const cosh = [
				"1",
				"1.54308063481524378",
				"3.76219569108363146",
				"10.06766199577776585",
				"27.30823283601648663",
				"74.20994852478784445"
			].map(x => BigNum.real(x));
			values.forEach((x, i) => expect(BigNum.cosh(x)).toEqual(cosh[i]));
			values.forEach((x, i) => expect(BigNum.cosh(x.neg)).toEqual(cosh[i]));
		});

		it("for imaginary", function() {
			const values = new Array(10).fill(0).map((_, i) => BigNum.complex("0", i.toString()));
			const cosh = new Array(10).fill(0)
									.map((_, i) => Component.create(`${i}`))
									.map(x => new BigNum(Component.cos(x)));
			values.forEach((x, i) => expect(BigNum.cosh(x)).toEqual(cosh[i]));
		});
	});

	describe("tanh", function() {
		test("calls with proper context", function() {
			BigNum.tanh(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		it("for real", function() {
			const values = new Array(10).fill(0).map((_, i) => BigNum.real(i));
			const tanh = [
				"0",
				"0.76159415595576489",
				"0.96402758007581689",
				"0.99505475368673046",
				"0.99932929973906705",
				"0.99990920426259514",
				"0.99998771165079557",
				"0.99999833694394468",
				"0.99999977492967589",
				"0.99999996954004098"
			].map(x => BigNum.real(x));
			values.forEach((x, i) => expect(BigNum.tanh(x)).toEqual(tanh[i]));
			values.forEach((x, i) => expect(BigNum.tanh(x.neg)).toEqual(tanh[i].neg));
		});

		it("for imaginary", function() {
			const values = new Array(10).fill(0).map((_, i) => BigNum.complex("0", i.toString()));
			const tanh = new Array(10).fill(0)
									.map((_, i) => Component.create(`${i}`))
									.map(x => new BigNum(Component.ZERO, Component.tan(x)));
			values.forEach((x, i) => expect(BigNum.tanh(x)).toEqual(tanh[i]));
		});
	});

	describe("asinh", function() {
		test("calls with proper context", function() {
			BigNum.asinh(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		test("for real", function() {
			const values = [
				"0",
				"100",
				"10000",
				"1000000"
			].map(x => BigNum.real(x));
			const asinh = [
				"0",
				"5.29834236561058876",
				"9.90348755503612804",
				"14.50865773852446942"
			].map(x => BigNum.real(x));
			values.forEach((x, i) => expect(BigNum.asinh(x)).toEqual(asinh[i]));
			values.forEach((x, i) => expect(BigNum.asinh(x.neg)).toEqual(asinh[i].neg));
		});

		test("for imaginary", function() {
			const values = new Array(10).fill(0).map((_, i) => BigNum.complex("0", `0.${i}`));
			const asinh = new Array(10).fill(0)
										.map((_, i) => Component.create(`0.${i}`))
										.map(x => Component.asin(x))
										.map(x => new BigNum(Component.ZERO, x));
			values.forEach((x, i) => expect(BigNum.asinh(x)).toEqual(asinh[i]));
		});
	});

	describe("acosh", function() {
		test("calls with proper context", function() {
			BigNum.acosh(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		test("for real", function() {
			const values = [
				"1",
				"100",
				"10000",
				"1000000"
			].map(x => BigNum.real(x));
			const acosh = [
				"0",
				"5.29829236561048459",
				"9.90348755003612804",
				"14.50865773852396942"
			].map(x => BigNum.real(x));
			values.forEach((x, i) => expect(BigNum.acosh(x)).toEqual(acosh[i]));
		});

		test("for imaginary", function() {
			const values = new Array(10).fill(0).map((_, i) => BigNum.complex("0", `0.${i+1}`));
			const acosh = new Array(10).fill(0)
										.map((_, i) => Component.create(`0.${i+1}`))
										.map(x => Component.acos(x))
										.map(x => new BigNum(Component.ZERO, x));
			values.forEach((x, i) => expect(BigNum.acosh(x)).toEqual(acosh[i]));
			expect(() => BigNum.acosh(BigNum.real("0"))).not.toThrow();
			expect(BigNum.acosh(BigNum.real("0"))).toEqual(new BigNum(
				Component.ZERO,
				Component.PI.div(Component.TWO)
			));
		});
	});

	describe("atanh", function() {
		test("calls with proper context", function() {
			BigNum.atanh(BigNum.hyper([1, 0, 5, 2]));
			properContext();
		});

		describe("for real", function() {
			test("less than 1", function() {
				const values = new Array(10).fill(0).map((_,i) => BigNum.real(`0.${i}`));
				const atanh = [
					"0",
					"0.10033534773107558",
					"0.20273255405408219",
					"0.30951960420311172",
					"0.42364893019360181",
					"0.54930614433405485",
					"0.69314718055994531",
					"0.86730052769405320",
					"1.09861228866810970",
					"1.47221948958322023"
				].map(x => BigNum.real(x));
				for(let i = 0; i < values.length; i++)
					expect(BigNum.atanh(values[i])).toEqual(atanh[i]);
			});

			test("more than 1", function() {
				const ctx: MathContext = {
					precision: 2 * mathenv.mode.precision,
					rounding: mathenv.mode.rounding
				}
				const values = new Array(10).fill(0).map((_, i) => BigNum.real(10*(i+1)));
				const atanh = new Array(10).fill(0)
								.map((_, i) => Component.create(10*(i+1)))
								.map(x => Component.ONE.div(x, ctx))
								.map(x => Component.atanh(x))
								.map(x => new BigNum(x, Component.PI.div(Component.TWO)));
				for(let i = 0; i < values.length; i++)
					expect(BigNum.atanh(values[i])).toEqual(atanh[i]);
			});
		});

		test("for imaginary", function() {
			const values = new Array(10).fill(0)
							.map((_, i) => Component.create(10).pow(Component.create(i+1)))
							.map(x => new BigNum(Component.ZERO, x));
			const atanh = new Array(10).fill(0)
							.map((_, i) => Component.create(10).pow(Component.create(i+1)))
							.map(x => Component.atan(x))
							.map(x => new BigNum(Component.ZERO, x));
			for(let i = 0; i < values.length; i++)
				expect(BigNum.atanh(values[i])).toEqual(atanh[i]);
		});
	});
});