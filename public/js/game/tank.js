import { Vec3, Vec4 } from "../math/vec.js";
import AssetManager from "../other/assets.js";
import { BasicMaterial } from "../webgl/material.js";
import Bullet from "./bullet.js";
import Maths from "../math/maths.js";

import Game from './game.js';

export default class Tank {
    constructor(position=Vec3(0,0,0)) {
        this._position = position;
        this._baseRotation = 0;
        this._topRotation = 0;

        this._moveSpeed = 5;
        this._rotationSpeed = 5;

        this._shotDelay = 0.1;
        this._bulletSpeed = 6;
        this._shotOffset = 0.5;

        this._shadowMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('circle'), Vec4(0, 0, 0, 0.5));
        this._baseMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('tank_base'));
        this._topMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('tank_top'));
    }

    get position() {
        return this._position;
    }

    update(dt) { }

    render() {
        Game.renderer.drawQuad(this._shadowMaterial, this._position, 0, Vec3(0.7, 0.7, 1));
        Game.renderer.drawQuad(this._baseMaterial, this._position, this._baseRotation);
        Game.renderer.drawQuad(this._topMaterial, this._position, this._topRotation);
    }

    _move(direction, dt) {
        if (direction[0] == 0 && direction[1] == 0) return;
        direction = Vec3.normalize(direction);

        // Position
        let velocity = Vec3.multiply(direction, this._moveSpeed * dt);
        this._position = Vec3.add(this._position, velocity);

        // Base rotation
        let targetRotation = Math.atan2(direction[1], direction[0]);
        let totalAngle = Maths.angleBetween(this._baseRotation, targetRotation);
        let partialAngle = Math.sign(totalAngle) * dt * 5;
        if (Math.abs(partialAngle) > Math.abs(totalAngle)) partialAngle = totalAngle;
        this._baseRotation += partialAngle;
    }

    _faceTowards(target) {
        let direction = Vec3.subtract(target, this._position);
        this._topRotation = Math.atan2(direction[1], direction[0]);
    }

    _shoot() {
        let direction = Vec3.normalize(Vec3(Math.cos(this._topRotation), Math.sin(this._topRotation), 0));
        let offset = Vec3.multiply(direction, this._shotOffset);
        let shotPosition = Vec3.add(this._position, offset);

        Game.addObject(new Bullet(shotPosition, this._topRotation, this._bulletSpeed));
    }
}