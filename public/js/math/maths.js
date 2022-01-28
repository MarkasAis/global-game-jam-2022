export default class Maths {
    static random(min, max) {
        return this.lerp(min, max, Math.random());
    }

    static lerp(a, b, t) {
        return (b - a) * t + a;
    }

    static inverseLerp(a, b, v) {
        return (v - a) / (b - a);
    }

    static map(a1, b1, a2, b2, v) {
        return Maths.lerp(a2, b2, Maths.inverseLerp(a1, b1, v));
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    // Adapted from: https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts
    static easeOutBounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;
    
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }

    static easeInBounce(x) {
		return 1 - Maths.easeOutBounce(1 - x);
	}
}