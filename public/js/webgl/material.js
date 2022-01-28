import Shader from "./shader.js";
import { Vec4 } from "../math/vec.js";

import basicSource from '../../shaders/basic.js';
import highlightSource from '../../shaders/highlight.js';


class Material {
    static SHADER_CACHE = {};
    
    constructor (gl, name, source) {
        this.shader = Material._getSharedShader(gl, name, source);
        this.name = name;
    }

    static _getSharedShader(gl, name, source) {
        if (!this.SHADER_CACHE[gl]) this.SHADER_CACHE[gl] = {};
        if (!this.SHADER_CACHE[gl][name]) {
            this.SHADER_CACHE[gl][name] = new Shader(gl, source);
        }

        return this.SHADER_CACHE[gl][name];
    }

    apply() {}
}

export class BasicMaterial extends Material {
    constructor(gl, texture, tint=Vec4(1,1,1,1), hue=0) {
        super(gl, 'basic', basicSource);
        this.texture = texture;
        this.tint = tint;
        this.hue = hue;
    }

    apply() {
        this.texture.bind();
        this.shader.setFloat4('u_Tint', this.tint);
        this.shader.setFloat('u_Hue', this.hue);
    }
}

export class HighlightMaterial extends Material {
    constructor (gl, highlightX=0, opacity=0) {
        super(gl, 'highlight', highlightSource);
        this.highlightX = highlightX;
        this.opacity = opacity;
    }

    apply() {
        this.shader.setFloat('u_HighlightX', this.highlightX);
        this.shader.setFloat('u_Opacity', this.opacity);
    }
}