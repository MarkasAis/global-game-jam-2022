import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";



export default class Tank {
    constructor(position=Vec3(0,0,0), material) {
        this._position = position;
        this._material = material;
    }

    update(dt) { }

    render(renderer) {
        renderer.drawQuad(this._material, this._position);
    }
}