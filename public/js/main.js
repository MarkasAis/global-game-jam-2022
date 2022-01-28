import Renderer from './webgl/renderer.js';
import Texture from './webgl/texture.js';
import { BasicMaterial } from './webgl/material.js';
import Camera from './webgl/camera.js';

import { Vec3, Vec4 } from './math/vec.js';
import Timer from './other/timer.js';

const gameContainer = document.getElementById('game-container');

const renderer = new Renderer(gameContainer.offsetWidth, gameContainer.offsetHeight);
const camera = new Camera(gameContainer.offsetWidth / gameContainer.offsetHeight, 1);

gameContainer.appendChild(renderer.canvas);

window.addEventListener('resize', onResize);

let material = null;

const timer = new Timer(120, update, render);

let position = Vec3(0, 0, 0);

Texture.load(renderer.gl, '../images/circle.png').then((tex) => {
    material = new BasicMaterial(renderer.gl, tex, Vec4(0, 0, 0, 1));

    timer.start();
});

function onResize() {
    renderer.resize(gameContainer.offsetWidth, gameContainer.offsetHeight);
    camera.aspectRatio = gameContainer.offsetWidth / gameContainer.offsetHeight;
}

function update(deltatime) {
    console.log(deltatime);

    position[0] += deltatime;
}

function render() {
    renderer.beginScene();
    renderer.drawQuad(material, position, 0, Vec3(1, 1, 1));
    renderer.endScene(camera);
}