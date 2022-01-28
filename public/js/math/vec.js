import Maths from "./maths.js";

export function Vec2(x=0, y=0, z=0) {
    return [ x, y ];
}

Vec2.lerp = (a, b, t) => {
    return [
        Utils.lerp(a[0], b[0], t),
        Utils.lerp(a[1], b[1], t)
    ];
}

export function Vec3(x=0, y=0, z=0) {
    return [ x, y, z ];
}

Vec3.add = (a, b) => {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
    ];
}

Vec3.subtract = (a, b) => {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ];
}

Vec3.multiply = (a, scalar) => {
    return [
        a[0] * scalar,
        a[1] * scalar,
        a[2] * scalar
    ];
}

Vec3.divide = (a, scalar) => {
    return [
        a[0] / scalar,
        a[1] / scalar,
        a[2] / scalar
    ];
}

Vec3.round = (a) => {
    return [
        Math.round(a[0]),
        Math.round(a[1]),
        Math.round(a[2])
    ];
}

Vec3.lerp = (a, b, t) => {
    return [
        Maths.lerp(a[0], b[0], t),
        Maths.lerp(a[1], b[1], t),
        Maths.lerp(a[2], b[2], t)
    ];
}

export function Vec4(x=0, y=0, z=0, w=0) {
    return [ x, y, z, w ];
}

Vec4.transform = (v, m) => {
    return [
        m[ 0] * v[0] + m[ 4] * v[1] + m[ 8] * v[2] + m[12] * v[3],
        m[ 1] * v[0] + m[ 5] * v[1] + m[ 9] * v[2] + m[13] * v[3],
        m[ 2] * v[0] + m[ 6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[ 3] * v[0] + m[ 7] * v[1] + m[11] * v[2] + m[15] * v[3]
    ];
} 