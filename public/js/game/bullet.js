import { Vec3, Vec4 } from "../math/vec.js";
import AssetManager from "../other/assets.js";
import { BasicMaterial } from "../webgl/material.js";

import Game from './game.js';

export default class Bullet {
    constructor(position=Vec3(0,0,0), direction=0, speed=0) {
        this._position = position;
        this._direction = direction;
        this._speed = speed;

        this._bulletMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('square'), Vec4(0.8, 0.8, 0.8, 1));
    }

    update(dt) {
        let directionVector = Vec3(Math.cos(this._direction), Math.sin(this._direction), 0);
        let velocity = Vec3.multiply(directionVector, this._speed * dt);
        this._position = Vec3.add(this._position, velocity);
    }

    render() {
        Game.renderer.drawQuad(this._bulletMaterial, this._position, 0, Vec3(0.1, 0.1, 1));
    }
}