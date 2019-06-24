const { Vector } = require("../build/vector");
const { isExpression } = require("../build/core/definitions");
const { Scalar } = require("../build/scalar");

describe("Vector constants", function() {
	const arr = [1, 1, 2];
	const A = Vector.constant([1, 1, 2]);
	const B = Vector.constant([1, 1, 1]);
	const a = Vector.constant([1, 1, 2], "A");
	const random = Vector.constant([
		100*Math.random(),
		100*Math.random(),
		100*Math.random(),
		100*Math.random(),
		100*Math.random()
	]);

	it("Checks naming system", function() {
		expect(Vector.constant("A")).toBe(a);
		expect(a).not.toBe(A);
		expect(A.equals(a)).toBe(true);
		expect(() => Vector.constant([1, 2], "A")).toThrow();
	});

	it("Gets components", function() {
		let i;
		for(i = 1; i <= arr.length; i++)
			expect(A.X(i)).toBe(arr[i - 1]);
		for(; i < 10; i++)
			expect(A.X(i)).toBe(0);
	});

	it("Checks equality", function() {
		expect(A.equals(Vector.constant(arr))).toBe(true);
	});

	it("Checks non-duplicacy", function() {
		expect(Vector.constant([arr])).toBe(A);
		expect(Vector.constant([1, 1, 1])).toBe(B);
	});

	it("Adds", function() {
		expect(A.add(B)).toBeInstanceOf(Vector);
		expect(A.add(B)).toEqual(Vector.constant([2, 2, 3]));
	});

	it("generalises dot", function() {
		expect(_=> A.dot(random)).not.toThrow();
	});

	it("Calculates magnitude", function() {
		expect(Vector.mag(random).value).toBeCloseTo(Math.sqrt(random.dot(random).value));
		expect(Vector.mag(B).value).toBe(Math.sqrt(3));
	});

	it("Scales", function() {
		const scaled = A.scale(Scalar.constant(2));
		expect(Vector.mag(scaled)).toBe(Vector.mag(A).mul(Scalar.constant(2)));
	});

	it("Unit vector", function() {
		expect(Vector.mag(Vector.unit(random)).value).toBeCloseTo(1);
		expect(Vector.mag(Vector.unit(B)).value).toBeCloseTo(1);
	});
});

describe("Vector variable", function() {
	const A = Vector.constant([1, 1, 2]);
	const B = new Vector.Variable("B");
	const C = A.dot(B);

	it("Creates vector variables", function() {
		expect(B).toBeInstanceOf(Vector);
	});

	it("Creates vector expressions", function() {
		expect(isExpression(C)).toBe(true);
	});

	it("Resolves expressions", function() {
		const c_ = C.at(new Map([
			[B, Vector.constant([1, 1, 1, 1, 1])]
		]));
		expect(c_).toBeInstanceOf(Scalar);
		expect(c_).toBe(Scalar.constant(4));
	});

	it("Evaluates magnitude", function() {
		const M = Vector.mag(B);
		expect(M).toBeInstanceOf(Scalar);
		expect(isExpression(M)).toBe(true);
		expect(M.at(new Map([
			[B, Vector.constant([1, 1, 1, 1, 1])]
		]))).toBe(Scalar.constant(Math.sqrt(5)));
	});

	it("Checks multiplication by scalar", function() {
		const x = Scalar.constant(2);
		const y = Scalar.variable("x");
		const a = new Vector.Variable("A");
		const expr1 = y.mul(A);
		const expr2 = B.scale(x);
		expect(expr1).toBeInstanceOf(Vector.Expression);
		expect(expr2).toBeInstanceOf(Vector.Expression);
		expect(expr1.at(new Map([
			[y, x]
		]))).toEqual(expr2.at(new Map([
			[B, A]
		])));
	});
});