import { Vec3, Vec4 } from "../math/vec.js";
import AssetManager from "../other/assets.js";
import { BasicMaterial } from "../webgl/material.js";

import Game from './game.js';

export default class Tank {
    constructor(position=Vec3(0,0,0)) {
        this._position = position;
        this._baseRotation = 0;
        this._topRotation = 0;
        this._shadowMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('circle'), Vec4(0, 0, 0, 0.3));
        this._baseMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('tank_base'));
        this._topMaterial = new BasicMaterial(Game.renderer.gl, AssetManager.getTexture('tank_top'));
    }

    update(dt) { }

    render() {
        Game.renderer.drawQuad(this._shadowMaterial, this._position, 0, Vec3(0.7, 0.7, 1));
        Game.renderer.drawQuad(this._baseMaterial, this._position, this._baseRotation);
        Game.renderer.drawQuad(this._topMaterial, this._position, this._topRotation);
    }
}