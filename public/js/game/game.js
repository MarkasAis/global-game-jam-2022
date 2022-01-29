import Renderer from '../webgl/renderer.js';
import Texture from '../webgl/texture.js';
import { BasicMaterial } from '../webgl/material.js';
import Camera from '../webgl/camera.js';

import { Vec3, Vec4 } from '../math/vec.js';
import Timer from '../other/timer.js';
import Input from '../other/input.js';

import Player from './player.js';
import AssetManager from '../other/assets.js';

export default class Game {
    static _canvasContainer = null;
    static _renderer = null;
    static _camera = null;
    static _timer = null;

    static _player = null;
    static _debugMaterial = null;

    static _objects = [];

    static get renderer() { return Game._renderer; }
    static get mouseWorldPos() {
        return Game._camera.screenToWorldPosition(Input.getMousePosNormalized(Game._renderer.canvas));
    }

    static init(container) {
        Game._setup(container).then(Game._start);
    }

    static addObject(obj) {
        Game._objects.push(obj);
        return obj;
    }

    static async _setup(container) {
        Game._canvasContainer = container;
        Game._renderer = new Renderer(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._canvasContainer.appendChild(Game._renderer.canvas);

        Input.init();
        window.addEventListener('resize', Game._onResize);

        await Promise.all([
            AssetManager.loadTexture(Game._renderer.gl, '../images/circle.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/tank_base.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/tank_top.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/crosshair.png'),
        ]);

        Game._camera = new Camera(Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight, 3);
        Game._timer = new Timer(120, Game._update, Game._render);
    }

    static _onResize() {
        Game._renderer.resize(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._camera.aspectRatio = Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight;
    }

    static _start() {
        Game._debugMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('circle'), Vec4(1, 0, 0, 1));
        Game._crosshairMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('crosshair'), Vec4(0, 0, 0, 1));
        Game._player = Game.addObject(new Player(Vec3(0,0,0)));
        
        Game._timer.start(); 
    }

    static _update(dt) {
        for (let obj of Game._objects)
            obj.update(dt);
    }

    static _render() {
        Game._renderer.beginScene();

        for (let obj of Game._objects)
            obj.render();

        Game._renderer.drawQuad(Game._crosshairMaterial, Game.mouseWorldPos, 0, Vec3(0.2, 0.2, 1));


        Game._renderer.endScene(Game._camera);
    }
}