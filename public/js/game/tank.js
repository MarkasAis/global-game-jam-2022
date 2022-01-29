import { Vec3, Vec4 } from "../math/vec.js";
import AssetManager from "../other/assets.js";
import { BasicMaterial } from "../webgl/material.js";
import Bullet from "./bullet.js";
import Maths from "../math/maths.js";

import Game from './game.js';
import Collidable from "./collidable.js";

export default class Tank extends Collidable {
    constructor(type, position=Vec3(0,0,0), hue=0) {
        super(position, 0.35);
        this._baseRotation = 0;
        this._topRotation = 0;

        this._moveSpeed = 1;
        this._rotationSpeed = 5;

        this._shootDelay = 0.75;
        this._bulletSpeed = 6;
        this._shotOffset = 0.5;

        this._shootCooldown = 0;

        this._health = 10;
        this._type = type;

        this._shadowMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('circle'), Vec4(0, 0, 0, 0.5));
        this._baseMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('tank_base'), Vec4(1, 1, 1, 1), hue);
        this._topMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('tank_top'), Vec4(1, 1, 1, 1), hue);
    }

    get position() { return this._position; }
    get health() { return this._health; }
    get type() { return this._type; }

    update(dt) {
        this._shootCooldown -= dt;
    }

    render() {
        Game.renderer.drawQuad(this._shadowMaterial, this._position, 0, Vec3(0.7, 0.7, 1));
        Game.renderer.drawQuad(this._baseMaterial, this._position, this._baseRotation);
        Game.renderer.drawQuad(this._topMaterial, this._position, this._topRotation);
    }

    _onCollision(other) {
        if (other instanceof Bullet) {
            if (other.registerHit(this)) {
                this._onHit(other);
            }
        }
    }

    _onHit(bullet) {
        console.log('hit');
        this._health = Math.max(0, this._health - 1);
        if (this._health <= 0) this._onDeath();
    }

    _onDeath() {
        console.log('dead');
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

        Game.addObject(new Bullet(this._type, shotPosition, this._topRotation, this._bulletSpeed));
    }

    _attemptShoot() {
        if (this._shootCooldown <= 0) {
            this._shootCooldown = this._shootDelay;
            this._shoot();
            return true;
        }
        return false;
    }
}