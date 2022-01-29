import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";
import Game from "./game.js";
import StatsManager from "./stats.js";

import Tank from './tank.js';

export default class Player extends Tank {
    constructor(position=Vec3(0,0,0)) {
        super(position);
    }

    update(dt) {
        super.update(dt);

        // Update stats
        this._moveSpeed = StatsManager.getStat('playerMoveSpeed');
        this._bulletSpeed = StatsManager.getStat('playerBulletSpeed');

        // Movement
        let input = Vec3(0,0,0);
        if (Input.getKey('a')) input[0] -= 1;
        if (Input.getKey('d')) input[0] += 1;
        if (Input.getKey('s')) input[1] -= 1;
        if (Input.getKey('w')) input[1] += 1;

        this._move(input, dt);
        this._faceTowards(Game.mouseWorldPos);

        if (Input.getMouseButton(Input.MouseButton.LEFT)) {
            if (this._attemptShoot()) StatsManager.changeBar('xp', 1);
        }
    }
}