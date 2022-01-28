import Utils, { assert } from "../other/utils.js";

export default class Shader {
    constructor(gl, source) {
        this.gl = gl;

        let sources = this._preprocess(source);
        this._compile(sources);
    }

    bind() {
        this.gl.useProgram(this.id);
    }

    unbind() {
        this.gl.useProgram(0);
    }

    setFloat(name, x) {
        let location = this.gl.getUniformLocation(this.id, name);
        this.gl.uniform1f(location, x);
    }

    setFloat2(name, x, y) {
        let location = this.gl.getUniformLocation(this.id, name);
        this.gl.uniform2f(location, x, y);
    }

    setFloat4(name, vec) { // TODO: make param vec consistant
        let location = this.gl.getUniformLocation(this.id, name);
        this.gl.uniform4f(location, vec[0], vec[1], vec[2], vec[3]);
    }

    setMat4(name, mat) {
        let location = this.gl.getUniformLocation(this.id, name);
        this.gl.uniformMatrix4fv(location, false, mat);
    }

    _shaderTypeFromString(str) {
        switch (str) {
            case 'vertex': return this.gl.VERTEX_SHADER;
            case 'fragment': return this.gl.FRAGMENT_SHADER;
        }

        assert(false, 'Invalid shader type');
        return 0;
    }

    _preprocess(source) {
        let sources = {};
        const typeToken = '#type';

        let pos = source.indexOf(typeToken, 0);
        while (pos != -1) {
            let eol = Utils.regexIndexOf(source, '[\r\n]', pos);
            assert(eol != -1, 'Shader syntax error');

            let begin = pos + typeToken.length + 1;
            let type = source.substr(begin, eol-begin);

            let nextLinePos = Utils.regexIndexOf(source, '[^\r\n]', eol);
            assert(nextLinePos != -1, 'Shader syntax error');

            pos = source.indexOf(typeToken, nextLinePos);
            sources[this._shaderTypeFromString(type)] = (pos == -1) ? source.substr(nextLinePos) : source.substr(nextLinePos, pos - nextLinePos);
        }

        return sources;
    }

    _compile(sources) {
        let program = this.gl.createProgram();

        let shaderIDs = [];

        for (let [type, source] of Object.entries(sources)) {
            let shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);

            let success = this.gl.getShaderParameter(shader , this.gl.COMPILE_STATUS);
            if (!success) {
                assert(false, 'Shader compilation failure');
                assert(false, this.gl.getShaderInfoLog(shader));
                this.gl.deleteShader(shader);
                break;
            }

            this.gl.attachShader(program, shader);
            shaderIDs.push(shader);
        }

        this.gl.linkProgram(program);

        let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!success) {
            assert(false, 'Shader linking failure');
            assert(false, this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);

            for (let id of shaderIDs)
                this.gl.deleteShader(id);

            return;
        }

        for (let id of shaderIDs) {
            this.gl.detachShader(program, id);
            this.gl.deleteShader(id);
        }

        this.id = program;
    }
}