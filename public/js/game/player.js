import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";
import Game from "./game.js";

import Tank from './tank.js';

export default class Player extends Tank {
    constructor(position=Vec3(0,0,0)) {
        super(position);

        this._lastShotTime = null;
    }

    update(dt) {
        let input = Vec3(0,0,0);
        if (Input.getKey('a')) input[0] -= 1;
        if (Input.getKey('d')) input[0] += 1;
        if (Input.getKey('s')) input[1] -= 1;
        if (Input.getKey('w')) input[1] += 1;

        this._move(input, dt);
        this._faceTowards(Game.mouseWorldPos);

        // Shooting
        if (Input.getMouseButton(Input.MouseButton.LEFT)) {
            let time = Date.now() / 1000;
            if (time - this._lastShotTime >= this._shotDelay) {
                this._lastShotTime = time;
                this._shoot();
            }
        }
    }
}