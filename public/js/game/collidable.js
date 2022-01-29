import { Vec3 } from "../math/vec.js";

export default class Collidable {
    constructor(position, radius, trigger=false) {
        this._position = position;
        this._radius = radius;
        this._trigger = trigger;
    }

    get position() { return this._position; }

    colide(other) {
        let perpendicular = Vec3.subtract(other._position, this._position);
        let sqrMagnitude = Vec3.squareMagnitude(perpendicular);

        let totalRadius = this._radius + other._radius;
        if (sqrMagnitude >= totalRadius*totalRadius) return false;

        if (!this._trigger && !other._trigger) {
            let magnitude = Math.sqrt(sqrMagnitude);
            perpendicular = Vec3.divide(perpendicular, magnitude);

            let overlap = magnitude - totalRadius;

            let thisParticipation = this._radius / totalRadius;
            let thisPushback = overlap * thisParticipation;
            let otherPushback = overlap - thisPushback;

            this._position = Vec3.add(this._position, Vec3.multiply(perpendicular, thisPushback));
            other._position = Vec3.add(other._position, Vec3.multiply(perpendicular, -otherPushback));
        }

        this._onCollision(other);
        other._onCollision(this);

        return true;
    }

    _onCollision(other) { }
}