import { VAO, VBO, IBO, BufferLayout, BufferElement, ShaderDataType } from './buffer.js';
import { Mat4 } from '../math/mat.js';
import { Vec3, Vec4 } from '../math/vec.js';

class Renderer {
    constructor(width=100, height=100) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl = this.canvas.getContext('webgl2', { premultipliedAlpha: false, antialias: true });
        
        // this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // Init Quad VAO
        this.quadVAO = new VAO(this.gl);

        let squareVertices = [
            -0.5, -0.5, 0.0, 0.0, 1.0,
			 0.5, -0.5, 0.0, 1.0, 1.0,
			 0.5,  0.5, 0.0, 1.0, 0.0,
			-0.5,  0.5, 0.0, 0.0, 0.0
        ];

        let squareVBO = new VBO(this.gl, new Float32Array(squareVertices), new BufferLayout(
            new BufferElement(ShaderDataType.Float3, 'a_Position'),
            new BufferElement(ShaderDataType.Float2, 'a_TexCoord')
        ));

        this.quadVAO.addVBO(squareVBO);

        let squareIndices = [ 0, 1, 2, 2, 3, 0 ];

        let squareIBO = new IBO(this.gl, new Int32Array(squareIndices));
        this.quadVAO.setIBO(squareIBO);

        this.queue = [];
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    shutdown() {
        if (this.quadVAO) this.quadVAO.delete();
    }

    clear(r=0, g=0, b=0, a=1) {
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    beginScene() {
        this.queue = [];
    }

    endScene(camera) {
        let groups = {};
        for (let item of this.queue) {
            if (!item.material) continue;
            let shader = item.material.name;

            if (!groups[shader]) groups[shader] = [];
            groups[shader].push(item);
        }

        for (let items of Object.values(groups)) {
            let shader = items[0].material.shader;
            shader.bind();
            shader.setMat4('u_ViewProjection', camera.viewProjectionMatrix);

            for (let item of items) {
                let transform = Mat4.scale(Mat4.rotateZ(Mat4.translation(item.position), item.rotation), item.size);
                shader.setMat4('u_Transform', transform);

                item.material.apply();
                item.vao.bind();
                this.gl.drawElements(this.gl.TRIANGLES, item.vao.ibo.count, this.gl.UNSIGNED_INT, 0);
            }
        }
    }

    drawQuad(material, position=Vec3(0,0,0), rotation=0, size=Vec3(1,1,1)) {
        this.queue.push({ material, position, rotation, size, vao: this.quadVAO });
    }
}

export default Renderer;