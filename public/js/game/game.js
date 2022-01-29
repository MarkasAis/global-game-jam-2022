import Renderer from '../webgl/renderer.js';
import Texture from '../webgl/texture.js';
import { BasicMaterial } from '../webgl/material.js';
import Camera from '../webgl/camera.js';

import { Vec2, Vec3, Vec4 } from '../math/vec.js';
import Timer from '../other/timer.js';
import Input from '../other/input.js';
import Maths from '../math/maths.js';

import Player from './player.js';
import AssetManager from '../other/assets.js';
import StatsManager, { Stat } from './stats.js';

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

    static init() {
        Game._setup().then(Game._start);
    }

    static addObject(obj) {
        Game._objects.push(obj);
        return obj;
    }

    static async _setup() {
        Game._canvasContainer = document.getElementById('game-container');;
        Game._renderer = new Renderer(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._canvasContainer.appendChild(Game._renderer.canvas);

        Input.init();
        window.addEventListener('resize', Game._onResize);

        await Promise.all([
            AssetManager.loadTexture(Game._renderer.gl, '../images/circle.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/square.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/tank_base.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/tank_top.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/crosshair.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/grid.png')
        ]);

        Game._camera = new Camera(Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight, 3);
        Game._timer = new Timer(80, Game._update, Game._render);

        StatsManager.init();
        StatsManager.defineStat('playerMoveSpeed', new Stat('Player Move Speed', 5, '#84ff57'));
        StatsManager.defineStat('playerBulletSpeed', new Stat('Player Bullet Speed', 5, '#ff5757'));

        StatsManager.upgrade();
    }

    static _onResize() {
        Game._renderer.resize(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._camera.aspectRatio = Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight;
    }

    static _start() {
        Game._debugMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('circle'), Vec4(1, 0, 0, 1));
        Game._crosshairMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('crosshair'), Vec4(1, 1, 1, 1));
        Game._gridMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('grid'));
        Game._player = Game.addObject(new Player(Vec3(0,0,0)));
        
        Game._timer.start(); 
    }

    static _update(dt) {
        for (let obj of Game._objects)
            obj.update(dt);

        // Camera follow
        Game._camera.position = Vec3.lerp(Game._camera.position, Game._player.position, 5 * dt);
    }

    static _render() {
        Game._renderer.beginScene();

        // Draw background
        let tileSize = 7;
        let minBound = Game._camera.screenToWorldPosition(Vec2(-1, -1));
        let maxBound = Game._camera.screenToWorldPosition(Vec2(1, 1));

        minBound[0] = Maths.floorToNearest(minBound[0], tileSize);
        minBound[1] = Maths.floorToNearest(minBound[1], tileSize);
        maxBound[0] = Maths.ceilToNearest(maxBound[0], tileSize);
        maxBound[1] = Maths.ceilToNearest(maxBound[1], tileSize);

        let startX = Maths.floorToNearest(minBound[0], tileSize) + tileSize/2;
        let startY = Maths.floorToNearest(minBound[1], tileSize) + tileSize/2;
        let endX = Maths.ceilToNearest(maxBound[0], tileSize) - tileSize/2;
        let endY = Maths.ceilToNearest(maxBound[1], tileSize) - tileSize/2;

        for (let x = startX; x <= endX; x += tileSize) {
            for (let y = startY; y <= endY; y += tileSize) {
                Game._renderer.drawQuad(Game._gridMaterial, Vec3(x, y, 0), 0, Vec3(tileSize, tileSize, 1));
            }
        }
        for (let obj of Game._objects)
            obj.render();

        Game._renderer.drawQuad(Game._crosshairMaterial, Game.mouseWorldPos, 0, Vec3(0.2, 0.2, 1));

        Game._renderer.endScene(Game._camera);
    }
}