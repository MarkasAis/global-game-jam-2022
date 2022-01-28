import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";

import Tank from './tank.js';

export default class Player extends Tank {
    constructor(position=Vec3(0,0,0), material) {
        super();
        this._position = position;
        this._material = material;

        this._moveSpeed = 5;
    }

    update(dt) {
        let input = Vec3(0,0,0);

        if (Input.getKeyDown('a')) input[0] -= 1;
        if (Input.getKeyDown('d')) input[0] += 1;

        if (Input.getKeyDown('s')) input[1] -= 1;
        if (Input.getKeyDown('w')) input[1] += 1;

        let velocity = Vec3.normalize(input);
        velocity = Vec3.multiply(velocity, this._moveSpeed * dt);

        this._position = Vec3.add(this._position, velocity);
    }

    render(renderer) {
        renderer.drawQuad(this._material, this._position);
    }
}