import Tank from "./tank.js";
import { Vec3, Vec4 } from "../math/vec.js";
import Game from "./game.js";
import StatsManager from "./stats.js";
import AssetManager from "../other/assets.js";
import Particle from "./particle.js";
import { BasicMaterial } from "../webgl/material.js";

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

    _onDeath() {
        super._onDeath();
        StatsManager.changeBar('xp', 1);

        Game.addObject(new Particle(
            new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('xp'), Vec4(1, 1, 1, 1)),
            Game.RenderLayers.OVERLAY, 1.5, 1.5,
            Vec3.clone(this._position), Vec3.add(this._position, Vec3(0, 1, 0)),
            0, 0,
            Vec3(0.7, 0.7, 1), Vec3(0.3, 0.3, 1)
        ));
    }
}