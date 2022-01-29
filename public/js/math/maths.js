export default class Maths {
    static random(min, max) {
        return this.lerp(min, max, Math.random());
    }

    // Adapted from: https://stackoverflow.com/a/1527820/16787998
    static randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max) + 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static lerp(a, b, t) {
        return (b - a) * t + a;
    }

    static lerpClamped(a, b, t) {
        return Maths.lerp(a, b, Maths.clamp(t, 0, 1));
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

    static easeOutExpo(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    // Adapted from: https://stackoverflow.com/a/28037434/16787998
    static angleBetween(a, b) {
        let angle = (b - a + Math.PI) % (2*Math.PI) - Math.PI;
        return angle < -Math.PI ? angle + 2*Math.PI : angle;
    }

    static floorToNearest(x, n) {
        return n * Math.floor(x / n);
    }

    static ceilToNearest(x, n) {
        return n * Math.ceil(x / n);
    }
}