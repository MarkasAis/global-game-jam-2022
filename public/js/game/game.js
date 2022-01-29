import Renderer from '../webgl/renderer.js';
import { BasicMaterial } from '../webgl/material.js';
import Camera from '../webgl/camera.js';

import { Vec2, Vec3, Vec4 } from '../math/vec.js';
import Timer from '../other/timer.js';
import Input from '../other/input.js';
import Maths from '../math/maths.js';

import Player from './player.js';
import AssetManager from '../other/assets.js';
import StatsManager, { Stat, Bar } from './stats.js';
import Enemy from './enemy.js';

export default class Game {
    static _canvasContainer = null;
    static _renderer = null;
    static _camera = null;
    static _timer = null;

    static _player = null;
    static _debugMaterial = null;

    static _objects = new Set();

    static _pauseAnimationTime = 0;
    static _pauseSpeed = 1;

    static RenderLayers = {
        BACKGROUND: -100,
        SHADOW: 0,
        DEAD: 1,
        TANK_BASE: 2,
        TANK_TOP: 3,
        BULLET: 4,
        OVERLAY: 5
    };

    static get renderer() { return Game._renderer; }
    static get player() { return Game._player; }
    static get mouseWorldPos() {
        return Game._camera.screenToWorldPosition(Input.getMousePosNormalized(Game._renderer.canvas));
    }

    static init() {
        Game._setup().then(Game._start);
    }

    static addObject(obj) {
        Game._objects.add(obj);
        return obj;
    }

    static removeObject(obj) {
        return Game._objects.delete(obj);
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
            AssetManager.loadTexture(Game._renderer.gl, '../images/grid.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/xp.png')
        ]);

        Game._camera = new Camera(Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight, 3);
        Game._timer = new Timer(80, Game._update, Game._render);

        Game._crosshairMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('crosshair'), Vec4(1, 1, 1, 1));
        Game._gridMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('grid'));
        Game._player = Game.addObject(new Player(Vec3(0,0,0)));

        StatsManager.init();
        StatsManager.defineStat('playerMoveSpeed', new Stat('Player Move Speed', 5, '#84ff57'));
        StatsManager.defineStat('playerShootRate', new Stat('Player Shoot Rate', 5, '#57ffc8'));
        StatsManager.defineStat('playerBulletSpeed', new Stat('Player Bullet Speed', 5, '#ff5757'));
        StatsManager.defineStat('playerBulletDamage', new Stat('Player Bullet Damage', 5, '#ff5757'));
        StatsManager.defineStat('playerBulletPenetration', new Stat('Player Bullet Penetration', 5, '#ff5757'));

        StatsManager.defineBar('health', new Bar('Health', 10, Game._player.health, '#8d001f', '#ff0037', function() {
            if (this.value <= 0) {
                this.setValue(0, false);
                // alert('u ded lol');
            }
        }));

        StatsManager.defineBar('xp', new Bar('XP', 10, 0, '#425900', '#bf0', function() {
            if (this.value >= this.maxValue) {
                let prevMaxValue = this.maxValue;
                this.maxValue = Math.floor(1.1 * this.maxValue);
                this.setValue(this._value - prevMaxValue, true);
                Game._onLevelUp();
            }
        }));
    }

    static _onResize() {
        Game._renderer.resize(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._camera.aspectRatio = Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight;
    }

    static _start() {
        Game.addObject(new Enemy(Vec3(2, 2, 0)));

        Game._timer.start();
    }

    static _onLevelUp() {
        Game._timer.transitionTimescale(0, 1, () => {
            StatsManager.upgrade(() => {
                Game._timer.transitionTimescale(1, 1);
            });
        });
    }

    static _update(dt) {
        for (let obj of Game._objects)
            obj.update(dt);

        let objects = Array.from(Game._objects.values());
        // Check collision for all pairs of objects
        for (let i = 0; i < objects.length; i++) {
            for (let j = i+1; j < objects.length; j++) {
                objects[i].colide(objects[j]);
            }
        }

        // Camera follow
        Game._camera.position = Vec3.lerpClamped(Game._camera.position, Game._player.position, 5 * dt);
            
    }

    static getCameraBounds() {
        return {
            min: Game._camera.screenToWorldPosition(Vec2(-1, -1)),
            max: Game._camera.screenToWorldPosition(Vec2(1, 1))
        }
    }

    static _render() {
        Game._renderer.beginScene();

        // Draw background
        let tileSize = 7;
        let { min: minBound, max: maxBound } = Game.getCameraBounds();

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
                Game._renderer.drawQuad(Game._gridMaterial, Vec3(x, y, 0), 0, Vec3(tileSize, tileSize, 1), Game.RenderLayers.BACKGROUND);
            }
        }

        for (let obj of Game._objects)
            obj.render();

        Game._renderer.drawQuad(Game._crosshairMaterial, Game.mouseWorldPos, 0, Vec3(0.2, 0.2, 1), Game.RenderLayers.OVERLAY);

        Game._renderer.endScene(Game._camera);
    }
}