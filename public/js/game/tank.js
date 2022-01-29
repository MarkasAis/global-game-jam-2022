import { Vec3, Vec4 } from "../math/vec.js";
import AssetManager from "../other/assets.js";
import { BasicMaterial } from "../webgl/material.js";
import Bullet from "./bullet.js";
import Maths from "../math/maths.js";

import Game from './game.js';
import Collidable from "./collidable.js";
import Particle from "./particle.js";

export default class Tank extends Collidable {
    constructor(type, position=Vec3(0,0,0), hue=0) {
        super(position, 0.35);
        this._baseRotation = 0;
        this._topRotation = 0;

        this._moveSpeed = 1;
        this._rotationSpeed = 5;

        this._bulletSpeed = 6;
        this._bulletDamage = 1;
        this._bulletPenetration = 1;

        this._shootDelay = 0.75;
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
        Game.renderer.drawQuad(this._shadowMaterial, this._position, 0, Vec3(0.7, 0.7, 1), Game.RenderLayers.SHADOW);
        Game.renderer.drawQuad(this._baseMaterial, this._position, this._baseRotation, Vec3(1, 1, 1), Game.RenderLayers.TANK_BASE);
        Game.renderer.drawQuad(this._topMaterial, this._position, this._topRotation, Vec3(1, 1, 1), Game.RenderLayers.TANK_TOP);
    }

    _onCollision(other) {
        if (other instanceof Bullet) {
            if (other.registerHit(this)) {
                this._onHit(other);
            }
        }
    }

    _onHit(bullet) {
        this._health = Math.max(0, this._health - bullet.damage);
        if (this._health <= 0) this._onDeath();
    }

    _onDeath() {
        Game.removeObject(this);

        const randomOffset = (magnitude=1) => {
            let angle = Maths.random(0, Math.PI*2);
            return Vec3(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude, 0);
        }

        Game.addObject(new Particle(
            new BasicMaterial(this._baseMaterial.gl, this._baseMaterial.texture, this._baseMaterial.tint, this._baseMaterial.hue, 0),
            Game.RenderLayers.DEAD, 1, 5,
            Vec3.clone(this._position), Vec3.add(this._position, randomOffset(0.5)),
            this._topRotation, this._topRotation + Maths.random(-Math.PI, Math.PI),
            Vec3(1, 1, 1), Vec3(1, 1, 1),
            Maths.easeOutExpo
        ));

        Game.addObject(new Particle(
            new BasicMaterial(this._topMaterial.gl, this._topMaterial.texture, this._topMaterial.tint, this._topMaterial.hue, 0),
            Game.RenderLayers.DEAD, 1, 5,
            Vec3.clone(this._position), Vec3.add(this._position, randomOffset(1)),
            this._topRotation, this._topRotation + Maths.random(-Math.PI, Math.PI),
            Vec3(1, 1, 1), Vec3(0.9, 0.9, 1),
            Maths.easeOutExpo
        ));
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

        Game.addObject(new Bullet(this._type, this._bulletDamage, this._bulletPenetration, shotPosition, this._topRotation, this._bulletSpeed));
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