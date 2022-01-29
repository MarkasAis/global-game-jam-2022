import Texture from "../webgl/texture.js";

export default class AssetManager {
    static _textureCache = {};

    static async loadTexture(gl, url) {
        let path = url.split("/");
        let name = path[path.length-1].split('.')[0];

        let texture = await Texture.load(gl, url);
        AssetManager._textureCache[name] = texture;
    }

    static getTexture(name) {
        return AssetManager._textureCache[name];
    }
}