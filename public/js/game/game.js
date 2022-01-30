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

    static _currentEnemyCount = 0;

    static _firstGame = true;
    static _waitingToStart = true;
    static _isFinished = false;

    static RenderLayers = {
        BACKGROUND: -100,
        GROUND: -1,
        SHADOW: 0,
        DEAD: 1,
        TANK_BASE: 2,
        TANK_TOP: 3,
        BULLET: 4,
        OVERLAY: 5
    };

    static get renderer() { return Game._renderer; }
    static get player() { return Game._player; }
    static get camera() { return Game._camera; }
    static get mouseWorldPos() {
        return Game._camera.screenToWorldPosition(Input.getMousePosNormalized(Game._renderer.canvas));
    }

    static init() {
        Game._setup();
    }

    static addObject(obj) {
        Game._objects.add(obj);
        if (obj instanceof Enemy) Game._currentEnemyCount++;
        return obj;
    }

    static removeObject(obj) {
        let deleted = Game._objects.delete(obj);
        if (deleted && obj instanceof Enemy) Game._currentEnemyCount--;
        return deleted;
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
            AssetManager.loadTexture(Game._renderer.gl, '../images/xp.png'),
            AssetManager.loadTexture(Game._renderer.gl, '../images/controls.png')
        ]);

        AssetManager.loadAudio('../sounds/explosion.mp3');
        AssetManager.loadAudio('../sounds/hit_player.mp3');
        AssetManager.loadAudio('../sounds/hit_enemy.wav');
        AssetManager.loadAudio('../sounds/shoot.wav');
        AssetManager.loadAudio('../sounds/music.mp3');
        AssetManager.loadAudio('../sounds/level.wav');

        Game._camera = new Camera(Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight, 3);
        Game._timer = new Timer(60, Game._update, Game._render, 0);

        Game._crosshairMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('crosshair'), Vec4(1, 1, 1, 1));
        Game._controlsMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('controls'), Vec4(1, 1, 1, 0.3));
        Game._gridMaterial = new BasicMaterial(Game._renderer.gl, AssetManager.getTexture('grid'));

        GameManager.init();
        GameManager.defineStat('playerMoveSpeed', new Stat('Move Speed', true, 3, '#84ff57'));
        GameManager.defineStat('playerShootRate', new Stat('Shoot Rate', true, 5, '#00dbff'));
        GameManager.defineStat('playerBulletSpeed', new Stat('Bullet Speed', true, 2, '#ffd500'));
        GameManager.defineStat('playerBulletDamage', new Stat('Bullet Damage', true, 5, '#ff7300'));
        GameManager.defineStat('playerBulletPenetration', new Stat('Bullet Penetration', true, 2, '#ff5757'));
        GameManager.defineStat('playerMaxHealth', new Stat('Maximum Health', true, 6, '#ff0037'));

        GameManager.defineStat('enemyMoveSpeed', new Stat('Enemy Move Speed', false, 3, '#84ff57'));
        GameManager.defineStat('enemyShootRate', new Stat('Enemy Shoot Rate', false, 2, '#00dbff'));
        GameManager.defineStat('enemyBulletSpeed', new Stat('Enemy Bullet Speed', false, 4, '#ffd500'));
        GameManager.defineStat('enemyBulletDamage', new Stat('Enemy Bullet Damage', false, 1, '#ff7300'));
        GameManager.defineStat('enemyMaxHealth', new Stat('Enemy Maximum Health', false, 2, '#ff0037'));
        GameManager.defineStat('enemyCount', new Stat('Enemy Count', false, 3, '#ffffff'));

        GameManager.defineBar('health', new Bar('Health', 300, 7, 'var(--secondary-transparent)', 'var(--secondary-bright)', function() {
            if (this.value < 0) {
                this.setValue(0, false);
            }
        }));

        GameManager.defineBar('xp', new Bar('XP', 6, 0, 'var(--primary-transparent)', 'var(--primary-bright)', function() {
            if (this.value >= this.maxValue) {
                let prevMaxValue = this.maxValue;
                this.maxValue = Math.floor(1.2 * this.maxValue + 2);
                if (this.maxValue == prevMaxValue) this.maxValue++;

                this.setValue(this._value - prevMaxValue, true);
                Game._onLevelUp();
                AssetManager.playAudio('level', { volume: 0.5, delay: 1 });
            }
        }));

        ScoreManager.init();

        AssetManager.playAudio('music', { volume: 0.5, loop: true, force: true });

        GameManager.hideBlank();

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
        Game._currentEnemyCount = 0;
        Game._isFinished = false;

        GameManager.reset();
        ScoreManager.reset();

        Game._spawnPlayer();
        Game._firstGame = false;

        if (!Game._waitingToStart)
            Game._timer.transitionTimescale(1, 1);
    }

    static _onResize() {
        Game._renderer.resize(Game._canvasContainer.offsetWidth, Game._canvasContainer.offsetHeight);
        Game._camera.aspectRatio = Game._canvasContainer.offsetWidth / Game._canvasContainer.offsetHeight;
    }

    static _onLevelUp() {
        if (Game._isFinished) return;

        Game._timer.transitionTimescale(0, 1, () => {
            GameManager.upgrade(() => {
                Game._timer.transitionTimescale(1, 1);
            });
        });
    }

    static _spawnEnemy() {
        let { min: invalidMin, max: invalidMax } =  Game.getCameraBounds();
        let { min: validMin, max: validMax } =  Game.getActiveBounds();

        for (let i = 0; i < 10; i++) {
            let pos = Vec3.lerp(validMin, validMax, Maths.random(0, 1));

            if (pos[0] >= invalidMin[0] && pos[0] <= invalidMax[0] && pos[1] >= invalidMin[1] && pos[1] <= invalidMax[1]) continue;

            let enemy = new Enemy(pos);
            Game.addObject(enemy);
            return enemy;
        }

        return null;
    }

    static _update(dt) {
        if (Game._waitingToStart) {
            if (Input.getKey('w') || Input.getKey('a') || Input.getKey('s') || Input.getKey('d') || Input.getMouseButton(Input.MouseButton.LEFT)) {
                Game._timer.transitionTimescale(1, 0);
                Game._waitingToStart = false;
            }
        }

        while (Game._currentEnemyCount < GameManager.getStat('enemyCount') * 3 + 1)
            Game._spawnEnemy();

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
        Game._isFinished = true;
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

    static getActiveBounds() {
        let { min: minBound, max: maxBound } =  Game.getCameraBounds();

        let width = (maxBound[0] - minBound[0]) / 2;
        let height = (maxBound[1] - minBound[1]) / 2;

        return {
            min: Vec3(minBound[0] - width, minBound[1] - height, 0),
            max: Vec3(maxBound[0] + width, maxBound[1] + height, 0)
        };
    }

    static isOutOfBounds(position) {
        let { min, max } = Game.getActiveBounds();
        return position[0] < min[0] || position[0] > max[0] ||
               position[1] < min[1] || position[1] > max[1];
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

        Game._renderer.drawQuad(Game._controlsMaterial, Vec3(0, 1, 0), 0, Vec3(3, 3, 1), Game.RenderLayers.GROUND);

        for (let obj of Game._objects)
            obj.render();

        Game._renderer.drawQuad(Game._crosshairMaterial, Game.mouseWorldPos, 0, Vec3(0.2, 0.2, 1), Game.RenderLayers.OVERLAY);

        Game._renderer.endScene(Game._camera);
    }
}