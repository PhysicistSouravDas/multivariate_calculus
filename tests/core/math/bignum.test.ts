import { BigNum } from "../../../src/core/math/bignum";
import { Component } from "../../../src/core/math/component";

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
		const a = new BigNum(Component.create("5"));
		expect(a.norm()).toEqual(a);
		expect(a.neg.norm()).toEqual(a);
	});

	it("for 3 reals", function() {
		const a = new BigNum(Component.create("1"), Component.create("2"), Component.create("2"));
		const norm = new BigNum(Component.create("3"));
		expect(a.norm()).toEqual(norm);
	});

	it("equality with absolute value function", function() {
		const a = new BigNum(Component.create("1"), Component.create("2"), Component.create("2"), Component.create("1"), Component.create("2"), Component.create("2"));
		expect(a.norm()).toEqual(BigNum.abs(a));
	});
});

describe("Inverse", function() {
	it("for 1 real", function() {
		const a = BigNum.real("5");
		const inv = BigNum.real("0.2");
		expect(a.inv()).toEqual(inv);
	});

	it("for 2 reals", function() {
		const a = BigNum.complex("3", "4");
		const inv = BigNum.complex("0.12", "-0.16");
		expect(a.inv()).toEqual(inv);
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
	it("exp", function() {
		expect(BigNum.exp(BigNum.real("0"))).toEqual(BigNum.real("1"));
		expect(BigNum.exp(BigNum.real("1"))).toEqual(new BigNum(Component.round(Component.E, Component.MODE)));
		expect(BigNum.exp(BigNum.real("2"))).toEqual(new BigNum(Component.E.mul(Component.E)));
	});
});