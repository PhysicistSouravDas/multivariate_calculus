import { math } from "./math";
import { Numerical } from "../definitions";

/** The negative value of its argument. */
export function neg(x: number): number;
export function neg<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function neg<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return -<number>x;
	const def = x.getDefinition("neg");
	if(def === "undefined")
		throw new TypeError("Operation neg not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).neg;
	return x.classRef.neg(x, ...args);
}


/** The trigonometric sine function. */
export function sin(x: number): number;
export function sin<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function sin<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.sin(<number>x);
	const def = x.getDefinition("sin");
	if(def === "undefined")
		throw new TypeError("Operation sin not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).sin(...args);
	return x.classRef.sin(x, ...args);
}

/** The trigonometric cosine function. */
export function cos(x: number): number;
export function cos<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function cos<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.cos(<number>x);
	const def = x.getDefinition("cos");
	if(def === "undefined")
		throw new TypeError("Operation cos not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).cos(...args);
	return x.classRef.cos(x, ...args);
}

/** The trigonometric tangent function. */
export function tan(x: number): number;
export function tan<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function tan<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.tan(<number>x);
	const def = x.getDefinition("tan");
	if(def === "undefined")
		throw new TypeError("Operation tan not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).tan(...args);
	return x.classRef.tan(x, ...args);
}

/** The inverse trigonometric sine function. */
export function asin(x: number): number;
export function asin<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function asin<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.asin(<number>x);
	const def = x.getDefinition("asin");
	if(def === "undefined")
		throw new TypeError("Operation asin not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).asin(...args);
	return x.classRef.asin(x, ...args);
}

/** The inverse trigonometric cosine function. */
export function acos(x: number): number;
export function acos<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function acos<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.acos(<number>x);
	const def = x.getDefinition("acos");
	if(def === "undefined")
		throw new TypeError("Operation acos not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).acos(...args);
	return x.classRef.acos(x, ...args);
}

/** The inverse trigonometric tangent function. */
export function atan(x: number): number;
export function atan<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function atan<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.atan(<number>x);
	const def = x.getDefinition("atan");
	if(def === "undefined")
		throw new TypeError("Operation atan not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).atan(...args);
	return x.classRef.atan(x, ...args);
}

/** The hyperbolic sine function. */
export function sinh(x: number): number;
export function sinh<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function sinh<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.sinh(<number>x);
	const def = x.getDefinition("sinh");
	if(def === "undefined")
		throw new TypeError("Operation sinh not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).sinh(...args);
	return x.classRef.sinh(x, ...args);
}

/** The hyperbolic cosine function. */
export function cosh(x: number): number;
export function cosh<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function cosh<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.cosh(<number>x);
	const def = x.getDefinition("cosh");
	if(def === "undefined")
		throw new TypeError("Operation cosh not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).cosh(...args);
	return x.classRef.cosh(x, ...args);
}

/** The hyperbolic tangent function. */
export function tanh(x: number): number;
export function tanh<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function tanh<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.tanh(<number>x);
	const def = x.getDefinition("tanh");
	if(def === "undefined")
		throw new TypeError("Operation tanh not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).tanh(...args);
	return x.classRef.tanh(x, ...args);
}

/** The inverse hyperbolic sine function. */
export function asinh(x: number): number;
export function asinh<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function asinh<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.asinh(<number>x);
	const def = x.getDefinition("asinh");
	if(def === "undefined")
		throw new TypeError("Operation asinh not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).asinh(...args);
	return x.classRef.asinh(x, ...args);
}

/** The inverse hyperbolic cosine function. */
export function acosh(x: number): number;
export function acosh<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function acosh<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.acosh(<number>x);
	const def = x.getDefinition("acosh");
	if(def === "undefined")
		throw new TypeError("Operation acosh not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).acosh(...args);
	return x.classRef.acosh(x, ...args);
}

/** The inverse hyperbolic tangent function. */
export function atanh(x: number): number;
export function atanh<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function atanh<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.atanh(<number>x);
	const def = x.getDefinition("atanh");
	if(def === "undefined")
		throw new TypeError("Operation atanh not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).atanh(...args);
	return x.classRef.atanh(x, ...args);
}

/** The common logarithm function (to the base 10). */
export function log(x: number): number;
export function log<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function log<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.log10(<number>x);
	const def = x.getDefinition("log");
	if(def === "undefined")
		throw new TypeError("Operation log not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).log(...args);
	return x.classRef.log(x, ...args);
}

/** The natural logarithm function (to the base `e`). */
export function ln(x: number): number;
export function ln<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function ln<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.log(<number>x);
	const def = x.getDefinition("ln");
	if(def === "undefined")
		throw new TypeError("Operation ln not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).ln(...args);
	return x.classRef.ln(x, ...args);
}

/** The exponentiation function. */
export function exp(x: number): number;
export function exp<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function exp<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.exp(<number>x);
	const def = x.getDefinition("exp");
	if(def === "undefined")
		throw new TypeError("Operation exp not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).exp(...args);
	return x.classRef.exp(x, ...args);
}

/** The square root function. */
export const sqrt = math.sqrt;

/** The absolute value function. */
export function abs(x: number): number;
export function abs<T>(x: T & Numerical, ...args: any[]): T & Numerical;
export function abs<T>(x: number | (T & Numerical), ...args: any[]) {
	if(typeof x === "number")
		return Math.abs(<number>x);
	const def = x.getDefinition("abs");
	if(def === "undefined")
		throw new TypeError("Operation abs not defined for object of type " + x.classRef.name);
	if(def === "instance")
		return (<any>x).abs(...args);
	return x.classRef.abs(x, ...args);
}

/** The greatest integer function. */
export const floor = math.floor;
/** The smallest integer function. */
export const ceil = math.ceil;

/**
 * Prints the string representation of an object to the default console.
 * @param obj Object to print.
 */
export function print(obj: any) {
	const proto = Object.getPrototypeOf(obj);
	const props = Object.getOwnPropertyNames(proto);
	if(props.indexOf("toString") !== -1)
		console.log(obj.toString());
	else console.log(obj);
}