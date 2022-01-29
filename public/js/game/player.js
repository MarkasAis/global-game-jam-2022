import Maths from "../math/maths.js";
import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";
import Utils from "../other/utils.js";
import Bullet from "./bullet.js";
import Game from "./game.js";

import Tank from './tank.js';

export default class Player extends Tank {
    constructor(position=Vec3(0,0,0)) {
        super(position);

        this._moveSpeed = 5;
        this._rotationSpeed = 5;

        this._shotDelay = 0.5;
        this._bulletSpeed = 5;
        this._lastShotTime = null;
    }

    update(dt) {
        let input = Vec3(0,0,0);
        if (Input.getKey('a')) input[0] -= 1;
        if (Input.getKey('d')) input[0] += 1;
        if (Input.getKey('s')) input[1] -= 1;
        if (Input.getKey('w')) input[1] += 1;

        if (input[0] != 0 || input[1] != 0) {
            let direction = Vec3.normalize(input);
            let velocity = Vec3.multiply(direction, this._moveSpeed * dt);

            this._position = Vec3.add(this._position, velocity);

            // Base rotation
            let targetRotation = Math.atan2(direction[1], direction[0]);
            let totalAngle = Maths.angleBetween(this._baseRotation, targetRotation);
            let partialAngle = Math.sign(totalAngle) * dt * 5;
            if (Math.abs(partialAngle) > Math.abs(totalAngle)) partialAngle = totalAngle;
            this._baseRotation += partialAngle;
        }

        // Top rotation
        let targetPos = Game.mouseWorldPos;
        let deltaPos = Vec3.subtract(targetPos, this._position);
        this._topRotation = Math.atan2(deltaPos[1], deltaPos[0]);

        // Shooting
        if (Input.getMouseButton(Input.MouseButton.LEFT)) {
            let time = Date.now() / 1000;
            if (time - this._lastShotTime >= this._shotDelay) {
                this._lastShotTime = time;
                console.log('shot');
                Game.addObject(new Bullet(Vec3.clone(this._position), this._topRotation, this._bulletSpeed));
            }
        }
    }
}