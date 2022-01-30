import Renderer from '../webgl/renderer.js';
import { BasicMaterial } from '../webgl/material.js';
import Camera from '../webgl/camera.js';

import { Vec2, Vec3, Vec4 } from '../math/vec.js';
import Timer from '../other/timer.js';
import Input from '../other/input.js';
import Maths from '../math/maths.js';

import Player from './player.js';
import AssetManager from '../other/assets.js';
import GameManager, { Stat, Bar } from './manager.js';
import Enemy from './enemy.js';
import ScoreManager from './score.js';

export default class Game {
    static _canvasContainer = null;
    static _renderer = null;
    static _camera = null;
    static _timer = null;

    static _player = null;
    static _debugMaterial = null;

    static _objects = null;

    static _spawnCooldown = 0;

    static _firstGame = true;

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
        Game._setup();
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

        GameManager.init();
        GameManager.defineStat('playerMoveSpeed', new Stat('Move Speed', 5, '#84ff57'));
        GameManager.defineStat('playerShootRate', new Stat('Shoot Rate', 5, '#57ffc8'));
        GameManager.defineStat('playerBulletSpeed', new Stat('Bullet Speed', 5, '#ff5757'));
        GameManager.defineStat('playerBulletDamage', new Stat('Bullet Damage', 5, '#ff5757'));
        GameManager.defineStat('playerBulletPenetration', new Stat('Bullet Penetration', 5, '#ff5757'));
        GameManager.defineStat('playerMaxHealth', new Stat('Maximum Health', 5, '#ff5757'));

        GameManager.defineBar('health', new Bar('Health', 0, 0, 'var(--secondary-dark)', 'var(--secondary-bright)', function() {
            if (this.value < 0) {
                this.setValue(0, false);
            }
        }));

        GameManager.defineBar('xp', new Bar('XP', 10, 0, 'var(--primary-dark)', 'var(--primary-bright)', function() {
            if (this.value >= this.maxValue) {
                let prevMaxValue = this.maxValue;
                this.maxValue = Math.floor(1.1 * this.maxValue);
                this.setValue(this._value - prevMaxValue, true);
                Game._onLevelUp();
            }
        }));

        Game.restart();
        Game._timer.start();
    }

    static _spawnPlayer() {
        if (Game._firstGame) {
            var position = Vec3(0, 0, 0);
        } else {
            let { min, max } = Game.getCameraBounds();
            let center = Vec3.lerp(min, max, 0.5);

            let distance = Vec3.distance(center, max);

            let angle = Maths.random(0, 2*Math.PI);
            let offset = Vec3(Math.cos(angle) * distance, Math.sin(angle) * distance, 0);

            var position = Vec3.add(center, offset);
        }

        Game._player = Game.addObject(new Player(position));
    }

    static restart() {
        Game._objects = new Set();

        GameManager.reset();
        ScoreManager.reset();

        Game._spawnPlayer();

        Game._timer.transitionTimescale(1, 1);

        Game._firstGame = false;
    }

    static _onResize() {
        Game._renderer.resize(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._camera.aspectRatio = Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight;
    }

    static _onLevelUp() {
        Game._timer.transitionTimescale(0, 1, () => {
            GameManager.upgrade(() => {
                Game._timer.transitionTimescale(1, 1);
            });
        });
    }

    static _spawnEnemy() {
        let { min: minBound, max: maxBound } =  Game.getCameraBounds();

        let width = maxBound[0] - minBound[0];
        let height = maxBound[1] - minBound[1];

        for (let i = 0; i < 10; i++) {
            let x = Maths.random(minBound[0] - width, maxBound[0] + width);
            let y = Maths.random(minBound[1] - height, maxBound[1] + height);

            if (x >= minBound[0] && x <= maxBound[0] && y >= minBound[1] && y <= maxBound[1]) continue;

            let enemy = new Enemy(Vec3(x, y, 0));
            Game.addObject(enemy);
            return enemy;
        }

        return null;
    }

    static _update(dt) {
        // Spawn enemy
        Game._spawnCooldown -= dt;
        if (Game._spawnCooldown <= 0) {
            Game._spawnCooldown += 1;
            Game._spawnEnemy();
        }

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

    static finish() {
        Game._timer.transitionTimescale(0, 1, () => {
            GameManager.endScreen();
        });
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