import Tank from "./tank.js";
import { Vec3 } from "../math/vec.js";
import Game from "./game.js";

export default class Enemy extends Tank {
    constructor(position=Vec3(0,0,0)) {
        super('enemy', position, 2);

        this._seesPlayer = true;
        this._followRange = 2;
    }

    update(dt) {
        super.update(dt);

        if (this._seesPlayer) {
            let perpendicular = Vec3.normalize(Vec3.subtract(this._position, Game.player.position));
            let offset = Vec3.multiply(perpendicular, this._followRange);
            let targetPosition = Vec3.add(Game.player.position, offset);

            let direction = Vec3.subtract(targetPosition, this._position);
            if (Vec3.squareMagnitude(direction) >= this._moveSpeed*this._moveSpeed)
                this._move(direction, dt);

            this._faceTowards(Game.player.position);
            this._attemptShoot();
        }
        
    }
}