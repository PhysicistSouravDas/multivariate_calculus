import { Component } from "../../../src/core/math/component";
import { IndeterminateForm, DivisionByZero } from "../../../src/core/errors";
import { RoundingMode, MathContext } from "../../../src/core/math/context";

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