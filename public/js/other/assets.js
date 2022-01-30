import Texture from "../webgl/texture.js";

export default class AssetManager {
    static _textureCache = {};
    static _audioCache = {};

    static _extractName(url) {
        let path = url.split("/");
        return path[path.length-1].split('.')[0];
    }

    static async loadTexture(gl, url) {
        let name = AssetManager._extractName(url);
        let texture = await Texture.load(gl, url);
        AssetManager._textureCache[name] = texture;
    }

    static getTexture(name) {
        return AssetManager._textureCache[name];
    }

    static loadAudio(url) {
        let name = AssetManager._extractName(url);
        this._audioCache[name] = new Audio(url);
    }

    static playAudio(name, { volume=1, loop=false, delay=0, force=false }={}) {
        let audio = AssetManager._audioCache[name];
        if (!audio) return;

        setTimeout(() => {
            audio = audio.cloneNode(true);
            audio.volume = volume;
            audio.loop = loop;

            let attemptToPlay = () => {
                audio.play().catch(() => {
                    if (force) setTimeout(attemptToPlay, 1000);
                });
            }

            attemptToPlay();
        }, delay);
    }
}