export default class Texture {
    constructor(gl, image) {
        this.gl = gl;
        this.id = this.gl.createTexture();
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    static async load(gl, url) {
        const img = new Image();
        img.src = url;
        await img.decode();

        return new Texture(gl, img);
    }

    bind(slot=0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + slot);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    }
}