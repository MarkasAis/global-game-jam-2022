import Renderer from './webgl/renderer.js';
import Texture from './webgl/texture.js';
import { BasicMaterial } from './webgl/material.js';
import Camera from './webgl/camera.js';

import { Vec3, Vec4 } from './math/vec.js';
import Timer from './other/timer.js';
import Input from './other/input.js';

import Player from './game/player.js';

const gameContainer = document.getElementById('game-container');

const renderer = new Renderer(gameContainer.offsetWidth, gameContainer.offsetHeight);
const camera = new Camera(gameContainer.offsetWidth / gameContainer.offsetHeight, 5);

gameContainer.appendChild(renderer.canvas);

window.addEventListener('resize', onResize);

let playerMaterial = null;

const timer = new Timer(120, update, render);

let player = null; 

Input.init();

Texture.load(renderer.gl, '../images/circle.png').then((tex) => {
    playerMaterial = new BasicMaterial(renderer.gl, tex, Vec4(0, 0, 0, 1));
    player = new Player(Vec3(0,0,0), playerMaterial);

    timer.start();
});

function onResize() {
    renderer.resize(gameContainer.offsetWidth, gameContainer.offsetHeight);
    camera.aspectRatio = gameContainer.offsetWidth / gameContainer.offsetHeight;
}

function update(dt) {
    player.update(dt);
}

function render() {
    renderer.beginScene();
    player.render(renderer);
    renderer.endScene(camera);
}