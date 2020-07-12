import { Component } from "../component";
import { MathContext } from "../context";
import { Exponent } from "../exponential/exponential";
import { UndefinedValue } from "../../errors";

const ln = Exponent.ln;

export namespace TrigHyperbolic {
	/**
	 * Calculates the hyperbolic sine with rounding according to the given context.
	 * 
	 * **Method**:
	 * 
	 * Use the standard series definition of \\( \sinh \\).
	 * 
	 * \\[ \sinh x = \sum_{n=0}^{\infty} \frac{x^{2n+1}}{(2n+1)!} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function sinh(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const x_sq = x.mul(x, ctx);
		let sum = Component.ZERO;
		let term = x;
		let n = 0;
		while(true) {
			sum = sum.add(term, ctx);
			const f = Component.create((2*n + 2) * (2*n + 3));
			const term1 = term.mul(x_sq, ctx).div(f, ctx);
			if(term1.equals(Component.ZERO, ctx))
				return Component.round(sum, context);
			term = term1;
			n++;
		}
	}

	/**
	 * Calculates the hyperbolic cosine with rounding according to the given context.
	 * 
	 * **Method**:
	 * 
	 * Use the standard series definition of \\( \cosh \\).
	 * 
	 * \\[ \cosh x = \sum_{n=0}^{\infty} \frac{x^{2n}}{(2n)!} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function cosh(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const x_sq = x.mul(x, ctx);
		let sum = Component.ZERO;
		let term = Component.ONE;
		let n = 0;
		while(true) {
			sum = sum.add(term, ctx);
			const f = Component.create((2*n + 1) * (2*n + 2));
			const term1 = term.mul(x_sq, ctx).div(f, ctx);
			if(term1.equals(Component.ZERO, ctx))
				return Component.round(sum, context);
			term = term1;
			n++;
		}
	}

	/**
	 * Calculates the hyperbolic tangent with rounding according to the given context.
	 * 
	 * **Method**:
	 *  
	 * \\[ \tanh x = \frac{\sinh x}{\cosh x} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function tanh(x: Component, context: MathContext): Component {
		if(x.lessThan(Component.ZERO))
			return tanh(x.neg, context).neg;
		if(x.equals(Component.ZERO, context))
			return Component.ZERO;
		const ctx: MathContext = {
			precision: context.precision + 5,
			rounding: context.rounding
		};
		const res = sinh(x, ctx).div(cosh(x, ctx), ctx);
		return Component.round(res, context);
	}

	/**
	 * Calculates the inverse hyperbolic sine with rounding according to the
	 * given context.
	 * 
	 * **Method**:
	 * 
	 * We know, \\( \sinh y = \frac{e^y - e^{-y}}{2} \\).
	 * Solving for \\( y \\) and substituting \\( \sinh y = x \\),
	 * \\[ \sinh^{-1} x = \ln \left( x + \sqrt{x^2+1} \right) \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function asinh(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const a = x;
		const b = x.pow(Component.TWO, ctx).add(Component.ONE, ctx).pow(Component.create("0.5"), ctx);
		const exp = a.add(b, ctx);
		const res = ln(exp, ctx);
		return Component.round(res, context);
	}

	/**
	 * Calculates the inverse hyperbolic cosine with rounding according to the
	 * given context.
	 * 
	 * **Method**:
	 * 
	 * We know, \\( \cosh y = \frac{e^y + e^{-y}}{2} \\).
	 * Solving for \\( y \\) and substituting \\( \cosh y = x \\),
	 * \\[ \cosh^{-1} x = \ln \left( x + \sqrt{x^2-1} \right) \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function acosh(x: Component, context: MathContext) {
		if(x.lessThan(Component.ONE))
			throw new UndefinedValue("acosh (for reals)", x);
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const a = x;
		const b = x.pow(Component.TWO, ctx).sub(Component.ONE, ctx).pow(Component.create("0.5"), ctx);
		const exp = a.add(b, ctx);
		const res = ln(exp, ctx);
		return Component.round(res, context);
	}

	/**
	 * Calculates the inverse hyperbolic tangent with rounding according to the
	 * given context.
	 * 
	 * **Method**:
	 * 
	 * We know, \\( \tanh y = \frac{e^{2y} - 1}{e^{2y} + 1} \\).
	 * Solving for \\( y \\) and substituting \\( \tanh y = x \\),
	 * \\[ \tanh^{-1} x = \frac{1}{2} \ln \left( \frac{1+x}{1-x} \right) \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function atanh(x: Component, context: MathContext): Component {
		if(Component.abs(x, context).moreThan(Component.ONE))
			throw new UndefinedValue("atanh (for reals)", x);
		if(x.lessThan(Component.ZERO))
			return atanh(x.neg, context).neg;
		if(x.equals(Component.ZERO, context))
			return Component.ZERO;
		const ctx: MathContext = {
			precision: context.precision + 5,
			rounding: context.rounding
		};
		const half = Component.create("0.5");
		const a = ln(Component.ONE.add(x, ctx), ctx);
		const b = ln(Component.ONE.sub(x, ctx), ctx);
		const res = half.mul(a.sub(b, ctx), ctx);
		return Component.round(res, context);
	}
}
