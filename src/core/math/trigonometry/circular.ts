import { Component } from "../component";
import { MathContext } from "../context";
import { UndefinedValue } from "../../errors";
import { Numerical } from "../../definitions";

export namespace TrigCyclic {
	/**
	 * Calculates the trigonometric sine with rounding according to the given
	 * context.
	 * 
	 * **Method**:
	 * 
	 * For \\( x < 2\pi \\)
	 * The Taylor series converges for all \\( x \\).
	 * 
	 * \\[ \sin x = \sum_{n=0}^{\infty} (-1)^n \frac{x^{2n+1}}{(2n+1)!} \\]
	 * 
	 * For \\( x \geqslant 2\pi \\), range reduction can be performed.
	 * The \\( \sin x \\) function has a periodicity of \\( 2\pi \\).
	 * 
	 * \\[ x \equiv f \pmod{2\pi} \\]
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function sin(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		x = x.mod(Component.TWO.mul(Component.PI, ctx), ctx);
		if(Component.abs(x, context).equals(Component.PI, context))
			return Component.ZERO;
		const x_sq = x.mul(x, ctx);
		let sum = Component.ZERO;
		let term = x;
		let n = 0;
		while(true) {
			sum = sum.add(term, ctx);
			const f = Component.create((2 * n + 2) * (2 * n + 3));
			const term1 = term.mul(x_sq, ctx).div(f, ctx).neg;
			if(term1.equals(Component.ZERO, ctx))
				return Component.round(sum, context);
			term = term1;
			n++;
		}
	}
	
	/**
	 * Calculates the trigonometric cosine with rounding according to the given
	 * context.
	 * 
	 * **Method**:
	 * 
	 * For \\( x < 2\pi \\)
	 * The Taylor series converges for all \\( x \\).
	 * 
	 * \\[ \cos x = \sum_{n=0}^{\infty} (-1)^n \frac{x^{2n}}{(2n)!} \\]
	 * 
	 * For \\( x \geqslant 2\pi \\), range reduction can be performed.
	 * The \\( \cos x \\) function has a periodicity of \\( 2\pi \\).
	 * 
	 * \\[ x \equiv f \pmod{2\pi} \\]
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function cos(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		x = x.mod(Component.TWO.mul(Component.PI, ctx), ctx);
		const x_sq = x.mul(x, ctx);
		let sum = Component.ZERO;
		let term = Component.ONE;
		let n = 0;
		while(true) {
			sum = sum.add(term, ctx);
			const f = Component.create((2*n+1) * (2*n+2));
			const term1 = term.mul(x_sq, ctx).div(f, ctx).neg;
			if(term1.equals(Component.ZERO, ctx))
				return Component.round(sum, context);
			term = term1;
			n++;
		}
	}

	/**
	 * Calculates the trigonometric tangent with rounding according to the given context.
	 * 
	 * **Method**:
	 *  
	 * \\[ \tan x = \frac{\sin x}{\cos x} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function tan(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const res = sin(x, ctx).div(cos(x, ctx), ctx);
		return Component.round(res, context);
	}
	
	/**
	 * Computes the inverse trigonometric sine for \\( x \\) (\\( |x| < 0.5 \\))
	 * with rounding according to the given context settings.
	 * @param x A number.
	 * @param context The context settings to use.
	 * @ignore
	 */
	function asin_less(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const x_sq = x.mul(x, ctx);
		let sum = Component.ZERO;
		let term = x;
		let temp = x;
		let f = Component.ONE;
		let n = 0;
		while(true) {
			sum = sum.add(temp, ctx);
			const f1 = Component.create(2*n + 3);
			const fac = f.div(Component.create(2*n+2), ctx);
			const term1 = term.mul(x_sq, ctx).mul(fac, ctx);
			const temp1 = term1.div(f1, ctx);
			if(temp1.equals(Component.ZERO, ctx))
				return Component.round(sum, context);
			f = f1;
			term = term1;
			temp = temp1;
			n++;
		}
	}
	
	/**
	 * Calculates the inverse trigonometric sine of a number with rounding
	 * according to the given context.
	 * 
	 * **Method**:
	 * 
	 * If \\( x < 0.5 \\)
	 * use the definition from integration:
	 * 
	 * \\[ \sin^{-1} x = \int_0^x \frac{dt}{\sqrt{1-t^2}} \\]
	 * 
	 * Since \\( x < 1 \\)
	 * 
	 * \\[ \sin^{-1} = \sum_{n=0}^\infty \frac{(2n-1)!!}{2^n n!} \cdot \frac{x^{2n+1}}{2n+1} \\]
	 * 
	 * If \\( x \geqslant 0.5 \\)
	 * 
	 * \\[ \sin^{-1} x = \frac{\pi}{2} - \sin^{-1} \sqrt{\frac{1-x}{2}} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function asin(x: Component, context: MathContext): Component {
		if(Component.abs(x, context).moreThan(Component.ONE))
			throw new UndefinedValue("asin (for reals)", x);
		if(x.lessThan(Component.ZERO))
			return asin(x.neg, context).neg;
		const half = Component.create("0.5");
		if(x.lessThan(half))
			return asin_less(x, context);
		const ctx: MathContext = {
			precision: context.precision + 5,
			rounding: context.rounding
		};
		const piBy2 = Component.PI.div(Component.TWO, ctx);
		const z = Component.ONE.sub(x, ctx).div(Component.TWO, ctx);
		const s = z.pow(half, ctx);
		const temp = asin_less(s, ctx);
		const res = piBy2.sub(Component.TWO.mul(temp, ctx), ctx);
		return Component.round(res, context);
	}

	/**
	 * Calculates the inverse trigonometric cosine of a number with rounding
	 * according to the given context.
	 * 
	 * **Method**:
	 * 
	 * If \\( \lvert x \rvert < 0.5 \\),
	 * \\[ \cos^{-1} x = \frac{\pi}{2} - \sin^{-1} x \\]
	 * 
	 * otherwise,
	 * \\[ \cos^{-1} x = 2 \sin^{-1} \sqrt{\frac{1-x}{2}} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 * @see {@link asin}
	 */
	export function acos(x: Component, context: MathContext) {
		if(Component.abs(x, context).moreThan(Component.ONE))
			throw new UndefinedValue("acos (for reals)", x);
		const ctx: MathContext = {
			precision: context.precision + 5,
			rounding: context.rounding
		};
		const half = Component.create("0.5");
		if(Component.abs(x, context).lessThan(half)) {
			const res = Component.PI.mul(half, ctx).sub(asin_less(x, ctx), ctx);
			return Component.round(res, context);
		}
		const z = Component.ONE.sub(x, ctx).div(Component.TWO, ctx);
		const s = z.pow(half, ctx);
		const temp = asin(s, ctx);
		const res = Component.TWO.mul(temp, ctx);
		return Component.round(res, context);
	}

	/**
	 * Calculates the inverse trigonometric tangent of a number (\\( x < 1 \\)).
	 * 
	 * **Method**:
	 * 
	 * \\[ \tan^{-1} x = \int_0^x \frac{1}{1+t^2} dt \\]
	 * Since \\( x < 1 \\)
	 * \\[ \tan^{-1} = \sum_{n=0}^{\infty} (-1)^n \frac{x^{2n+1}}{2n+1} \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 * @ignore
	 */
	function atan_less(x: Component, context: MathContext) {
		const ctx: MathContext = {
			precision: 2 * context.precision,
			rounding: context.rounding
		};
		const x_sq = x.mul(x, ctx);
		let sum = Component.ZERO;
		let temp = x;
		let term = x;
		let n = 0;
		while(true) {
			sum = sum.add(term, ctx);
			const temp1 = temp.mul(x_sq, ctx).neg;
			const f = Component.create(2*n + 3);
			const term1 = temp1.div(f, ctx);
			if(term1.equals(Component.ZERO, ctx))
				return Component.round(sum, context);
			temp = temp1;
			term = term1;
			n++;
		}
	}

	/**
	 * Calculates the inverse trigonometric tangent of a number with rounding
	 * according to the given context.
	 * 
	 * **Method**:
	 * 
	 * The input can be divided into 4 regions for fast convergence.
	 * 
	 * 1. \\( 0 \leqslant x < \sqrt{2}-1 \\):
	 * 
	 * \\[ \tan^{-1} = \sum_{n=0}^{\infty} (-1)^n \frac{x^{2n+1}}{2n+1} \\]
	 * 
	 * 2. \\( \sqrt{2}-1 \leqslant x < 1 \\):
	 * 
	 * \\[ \tan^{-1} x = \frac{\pi}{4} - \tan^{-1} \left( \frac{1-x}{1+x} \right) \\]
	 * 
	 * 3. \\( 1 \leqslant x < \sqrt{2}+1 \\):
	 * 
	 * \\[ \tan^{-1} x = \frac{\pi}{4} + \tan^{-1} \left( \frac{x-1}{x+1} \right) \\]
	 * 
	 * 4. \\( x \geqslant \sqrt{2}+1 \\):
	 * 
	 * \\[ \tan^{-1} x = \frac{\pi}{4} + \tan^{-1} \left( \frac{1}{x} \right) \\]
	 * 
	 * @param x A number.
	 * @param context The context settings to use.
	 */
	export function atan(x: Component, context: MathContext): Component {
		if(x.equals(Component.ZERO, context))
			return Component.ZERO;
		if(x.lessThan(Component.ZERO))
			return atan(x.neg, context).neg;
		const ctx: MathContext = {
			precision: context.precision + 5,
			rounding: context.rounding
		};
		const limit1 = Component.create("0.414213562373");
		const limit2 = Component.ONE;
		const limit3 = Component.create("2.414213562373");
		let referenceValue: Component;
		let less: Component;
		let sign: -1 | 1;
		if(x.lessThan(limit1)) {
			less = x;
			referenceValue = Component.ZERO;
			sign = 1;
		} else if(x.lessThan(limit2)) {
			const num = Component.ONE.sub(x, ctx);
			const den = Component.ONE.add(x, ctx);
			less = num.div(den, ctx);
			referenceValue = Component.PI.div(Component.FOUR, ctx);
			sign = -1;
		} else if(x.lessThan(limit3)) {
			const num = x.sub(Component.ONE, ctx);
			const den = x.add(Component.ONE, ctx);
			less = num.div(den, ctx);
			referenceValue = Component.PI.div(Component.FOUR, ctx);
			sign = 1;
		} else {
			less = Component.ONE.div(x, ctx);
			referenceValue = Component.PI.div(Component.TWO, ctx);
			sign = -1;
		}
		const res = sign === 1? referenceValue.add(atan_less(less, ctx), ctx):
			referenceValue.sub(atan_less(less, ctx), ctx);
		return Component.round(res, context);
	}

	/**
	 * Calculates the solution for \\( \theta \\) for the set of equations
	 * 
	 * \\[ \begin{align}
	 * 	x &= r \cos \theta \\\\
	 * 	y &= r \sin \theta
	 * 	\end{align} \\]
	 * 
	 * Put simply, the above boils down to
	 * \\[ \operatorname{atan2}(y, x) =
	 * \begin{cases}
	 * 	\arctan(\frac{y}{x}) &\text{if } x > 0, \\\\
	 * 	\arctan(\frac{y}{x}) + \pi &\text{if } x < 0 \text{ and } y \geqslant 0, \\\\
	 * 	\arctan(\frac{y}{x}) - \pi &\text{if } x < 0 \text{ and } y < 0, \\\\
	 * 	+\frac{\pi}{2} &\text{if } x = 0 \text{ and } y > 0, \\\\
	 * 	-\frac{\pi}{2} &\text{if } x = 0 \text{ and } y < 0, \\\\
	 * 	\text{undefined} &\text{if } x = 0 \text{ and } y = 0
	 * \end{cases} \\]
	 * 
	 * @param y The vertical component.
	 * @param x The horizontal component.
	 * @param context The context settings to use.
	 */
	export function atan2(y: Component, x: Component, context: MathContext) {
		const yComp = y.compareTo(Component.ZERO);
		const xComp = x.compareTo(Component.ZERO);
		if(xComp === 0 && yComp === 0)
			throw new UndefinedValue("atan2", <Numerical><unknown>[0, 0]);
		const pi = Component.PI;
		const two = Component.TWO;
		if(xComp === 0)
			return yComp === -1? pi.div(two, context).neg: pi.div(two, context);
		const ctx: MathContext = {
			precision: context.precision + 5,
			rounding: context.rounding
		};
		const arg = y.div(x, ctx);
		if(xComp === 1) return atan(arg, context);
		const value = atan(arg, ctx);
		const res = yComp === -1? value.sub(pi, ctx): value.add(pi, ctx);
		return Component.round(res, context);
	}
}