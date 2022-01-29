import { Vec3 } from "../math/vec.js";
import Collidable from "./collidable.js";
import Maths from "../math/maths.js";
import Game from "./game.js";

const LINEAR_INTERPOLATION = (t) => { return t; }

export default class Particle extends Collidable {
    constructor(material, layer, duration=1, startPosition=Vec3(0,0,0), endPosition=Vec3(0,0,0), startRotation=0, endRotation=0, startSize=Vec3(1,1,1), endSize=Vec3(1,1,1), interpolation=LINEAR_INTERPOLATION) {
        super(startPosition, 0, true);
        this._material = material;
        this._layer = layer;

        this._duration = duration;
        this._startPosition = startPosition;
        this._endPosition = endPosition;
        this._startRotation = startRotation;
        this._endRotation = endRotation;
        this._startSize = startSize;
        this._endSize = endSize;

        this._interpolation = interpolation;

        this._position = startPosition;
        this._rotation = startRotation;
        this._size = startSize;

        this._t = 0;
    }

    update(dt) {
        this._t += dt / this._duration;
        this._t = Maths.clamp(this._t, 0, 1);

        let t = this._interpolation(this._t);

        this._position = Vec3.lerp(this._startPosition, this._endPosition, t);
        this._rotation = Maths.lerp(this._startRotation, this._endRotation, t);
        this._size = Vec3.lerp(this._startSize, this._endSize, t);
    }

    render() {
        Game.renderer.drawQuad(this._material, this._position, this._rotation, this._size, this._layer);
    }
}