export function Mat4(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33) {
    return [ v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33 ];
}

Mat4.identity = () => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

Mat4.translate = (mat, vec) => {
    return Mat4.multiply(mat, Mat4.translation(vec));
}

Mat4.rotateX = (mat, angle) => {
    return Mat4.multiply(mat, Mat4.xRotation(angle));
}

Mat4.rotateY = (mat, angle) => {
    return Mat4.multiply(mat, Mat4.yRotation(angle));
}

Mat4.rotateZ = (mat, angle) => {
    return Mat4.multiply(mat, Mat4.zRotation(angle));
}

Mat4.scale = (mat, vec) => {
    return Mat4.multiply(mat, Mat4.scaling(vec));
}

// Matrix inversion adapted from: https://github.com/toji/gl-matrix/blob/master/src/mat4.js
Mat4.invert = (a) => {
    let b0  = a[ 0] * a[ 5] - a[ 1] * a[ 4];
    let b1  = a[ 0] * a[ 6] - a[ 2] * a[ 4];
    let b2  = a[ 0] * a[ 7] - a[ 3] * a[ 4];
    let b3  = a[ 1] * a[ 6] - a[ 2] * a[ 5];
    let b4  = a[ 1] * a[ 7] - a[ 3] * a[ 5];
    let b5  = a[ 2] * a[ 7] - a[ 3] * a[ 6];
    let b6  = a[ 8] * a[13] - a[ 9] * a[12];
    let b7  = a[ 8] * a[14] - a[10] * a[12];
    let b8  = a[ 8] * a[15] - a[11] * a[12];
    let b9  = a[ 9] * a[14] - a[10] * a[13];
    let b10 = a[ 9] * a[15] - a[11] * a[13];
    let b11 = a[10] * a[15] - a[11] * a[14];

    let det = b0 * b11 - b1 * b10 + b2 * b9 + b3 * b8 - b4 * b7 + b5 * b6;
    if (det === 0) return null;

    det = 1 / det;

    return [
        (a[ 5] * b11 - a[ 6] * b10 + a[ 7] * b9) * det,
        (a[ 2] * b10 - a[ 1] * b11 - a[ 3] * b9) * det,
        (a[13] * b5  - a[14] * b4  + a[15] * b3) * det,
        (a[10] * b4  - a[ 9] * b5  - a[11] * b3) * det,

        (a[ 6] * b8  - a[ 4] * b11 - a[ 7] * b7) * det,
        (a[ 0] * b11 - a[ 2] * b8  + a[ 3] * b7) * det,
        (a[14] * b2  - a[12] * b5  - a[15] * b1) * det,
        (a[ 8] * b5  - a[10] * b2  + a[11] * b1) * det,

        (a[ 4] * b10 - a[ 5] * b8  + a[ 7] * b6) * det,
        (a[ 1] * b8  - a[ 0] * b10 - a[ 3] * b6) * det,
        (a[12] * b4  - a[13] * b2  + a[15] * b0) * det,
        (a[ 9] * b2  - a[ 8] * b4  - a[11] * b0) * det,

        (a[ 5] * b7  - a[ 4] * b9  - a[ 6] * b6) * det,
        (a[ 0] * b9  - a[ 1] * b7  + a[ 2] * b6) * det,
        (a[13] * b1  - a[12] * b3  - a[14] * b0) * det,
        (a[ 8] * b3  - a[ 9] * b1  + a[10] * b0) * det
    ];
}

Mat4.multiply = (a, b) => {
    return [
        b[ 0] * a[0] + b[ 1] * a[4] + b[ 2] * a[ 8] + b[ 3] * a[12],
        b[ 0] * a[1] + b[ 1] * a[5] + b[ 2] * a[ 9] + b[ 3] * a[13],
        b[ 0] * a[2] + b[ 1] * a[6] + b[ 2] * a[10] + b[ 3] * a[14],
        b[ 0] * a[3] + b[ 1] * a[7] + b[ 2] * a[11] + b[ 3] * a[15],
        b[ 4] * a[0] + b[ 5] * a[4] + b[ 6] * a[ 8] + b[ 7] * a[12],
        b[ 4] * a[1] + b[ 5] * a[5] + b[ 6] * a[ 9] + b[ 7] * a[13],
        b[ 4] * a[2] + b[ 5] * a[6] + b[ 6] * a[10] + b[ 7] * a[14],
        b[ 4] * a[3] + b[ 5] * a[7] + b[ 6] * a[11] + b[ 7] * a[15],
        b[ 8] * a[0] + b[ 9] * a[4] + b[10] * a[ 8] + b[11] * a[12],
        b[ 8] * a[1] + b[ 9] * a[5] + b[10] * a[ 9] + b[11] * a[13],
        b[ 8] * a[2] + b[ 9] * a[6] + b[10] * a[10] + b[11] * a[14],
        b[ 8] * a[3] + b[ 9] * a[7] + b[10] * a[11] + b[11] * a[15],
        b[12] * a[0] + b[13] * a[4] + b[14] * a[ 8] + b[15] * a[12],
        b[12] * a[1] + b[13] * a[5] + b[14] * a[ 9] + b[15] * a[13],
        b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14],
        b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15]
    ];
}

Mat4.translation = (vec) => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        vec[0], vec[1], vec[2], 1
    ];
}

Mat4.xRotation = (angle) => {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    ];
}
 
Mat4.yRotation = (angle) => {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
}
 
Mat4.zRotation = (angle) => {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}
 
Mat4.scaling = (vec) => {
    return [
        vec[0], 0, 0, 0,
        0, vec[1], 0, 0,
        0, 0, vec[2], 0,
        0, 0, 0, 1,
    ];
}

Mat4.orthographic = (minX, maxX, minY, maxY, minZ, maxZ) => {
    let x = 1 / (minX - maxX);
    let y = 1 / (minY - maxY);
    let z = 1 / (minZ - maxZ);

    return [
        -2 * x, 0, 0, 0,
        0, -2 * y, 0, 0,
        0, 0, 2 * z, 0,
        (minX + maxX) * x, (minY + maxY) * y, (minZ + maxZ) * z, 1
    ];
}