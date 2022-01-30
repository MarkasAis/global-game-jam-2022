import { Vec3 } from "../math/vec.js";
import Input from "../other/input.js";
import Game from "./game.js";
import GameManager from "./manager.js";

import Tank from './tank.js';

export default class Player extends Tank {
    constructor(position=Vec3(0,0,0)) {
        super('player', position);
    }

    update(dt) {
        super.update(dt);

        // Update stats
        this._moveSpeed = GameManager.getStat('playerMoveSpeed');
        this._bulletSpeed = GameManager.getStat('playerBulletSpeed');
        this._bulletDamage = GameManager.getStat('playerBulletDamage');
        this._bulletPenetration = GameManager.getStat('playerBulletPenetration')+1;
        this._shootDelay = 1 / (GameManager.getStat('playerShootRate')+1);

        this.maximumHealth = GameManager.getStat('playerMaxHealth');

        GameManager.setBar('health', this._health, this._maximumHealth);

        // Movement
        let input = Vec3(0,0,0);
        if (Input.getKey('a')) input[0] -= 1;
        if (Input.getKey('d')) input[0] += 1;
        if (Input.getKey('s')) input[1] -= 1;
        if (Input.getKey('w')) input[1] += 1;

        this._move(input, dt);
        this._faceTowards(Game.mouseWorldPos);

        if (Input.getMouseButton(Input.MouseButton.LEFT)) {
            this._attemptShoot();
        }
    }

    _onHit(bullet) {
        super._onHit(bullet);
        GameManager.setBar('health', this._health, this._maximumHealth);
    }

    _onDeath() {
        super._onDeath();
        Game.finish();
    }
}