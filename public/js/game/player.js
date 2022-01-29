import Maths from "../math/maths.js";
import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";
import Utils from "../other/utils.js";
import Game from "./game.js";

import Tank from './tank.js';

export default class Player extends Tank {
    constructor(position=Vec3(0,0,0)) {
        super(position);

        this._moveSpeed = 5;
        this._rotationSpeed = 5;
    }

    update(dt) {
        let input = Vec3(0,0,0);

        if (Input.getKeyDown('a')) input[0] -= 1;
        if (Input.getKeyDown('d')) input[0] += 1;
        if (Input.getKeyDown('s')) input[1] -= 1;
        if (Input.getKeyDown('w')) input[1] += 1;

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
    }
}