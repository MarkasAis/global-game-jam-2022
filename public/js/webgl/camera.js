import { Mat4 } from "../math/mat.js";
import { Vec3, Vec4 } from "../math/vec.js";

export default class Camera {
    constructor(aspectRatio=1, size=1) {
        this._aspectRatio = aspectRatio;
        this._size = size;

        this._position = Vec3(0, 0, 0);
        this._rotation = 0;
    }

    get position() {
        return this._position;
    }

    set position(v) {
        this._position = v;
        this._viewMatrix = null;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(a) {
        this._rotation = a;
        this._viewMatrix = null;
    }

    get viewProjectionMatrix() {
        let shouldUpdate = !this._projectionMatrix || !this._viewMatrix;
        if (!this._projectionMatrix) this._recalculateProjectionMatrix();
        if (!this._viewMatrix) this._recalculateViewMatrix();
        if (shouldUpdate) this._viewProjectionMatrix = Mat4.multiply(this._projectionMatrix, this._viewMatrix);

        return this._viewProjectionMatrix;
    }

    set aspectRatio(ratio) {
        this._aspectRatio = ratio;
        this._projectionMatrix = null;
    }

    _recalculateProjectionMatrix() {
        let bottom = -this._size;
        let top = this._size;
        let left = bottom * this._aspectRatio;
        let right = top * this._aspectRatio;
    
        this._projectionMatrix = Mat4.orthographic(left, right, bottom, top, -1000, 1000);
    }

    _recalculateViewMatrix() {
        let transform = Mat4.rotateZ(Mat4.translation(this._position), (this._rotation));
        this._viewMatrix = Mat4.invert(transform);
    }

    screenToWorldPosition(screenPos) {
        let pos = Vec4(screenPos[0], screenPos[1], 0, 1);
        let inv = Mat4.invert(this._viewProjectionMatrix);
        pos = Vec4.transform(pos, inv);

        return Vec3(pos[0], pos[1], pos[2]);
    }
}