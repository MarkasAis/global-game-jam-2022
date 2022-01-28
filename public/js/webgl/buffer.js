// Overall design inspired by: https://hazelengine.com/

export class ShaderDataType {
    static None = 0;
    static Float = 1;
    static Float2 = 2;
    static Float3 = 3;
    static Float4 = 4;
    static Mat3 = 5;
    static Mat4 = 6;
    static Int = 7;
    static Int2 = 8;
    static Int3 = 9;
    static Int4 = 10;
    static Bool = 11;
}

function shaderDataTypeSize(type) {
    switch (type) {
        case ShaderDataType.Float:    return 4;
        case ShaderDataType.Float2:   return 4 * 2;
        case ShaderDataType.Float3:   return 4 * 3;
        case ShaderDataType.Float4:   return 4 * 4;
        case ShaderDataType.Mat3:     return 4 * 3 * 3;
        case ShaderDataType.Mat4:     return 4 * 4 * 4;
        case ShaderDataType.Int:      return 4;
        case ShaderDataType.Int2:     return 4 * 2;
        case ShaderDataType.Int3:     return 4 * 3;
        case ShaderDataType.Int4:     return 4 * 4;
        case ShaderDataType.Bool:     return 1;
    }

    assert(false, "Unknown ShaderDataType!");
    return 0;
}

function shaderDataTypeToGLBaseType(gl, type) {
    switch (type) {
        case ShaderDataType.Float:    return gl.FLOAT;
        case ShaderDataType.Float2:   return gl.FLOAT;
        case ShaderDataType.Float3:   return gl.FLOAT;
        case ShaderDataType.Float4:   return gl.FLOAT;
        case ShaderDataType.Mat3:     return gl.FLOAT;
        case ShaderDataType.Mat4:     return gl.FLOAT;
        case ShaderDataType.Int:      return gl.INT;
        case ShaderDataType.Int2:     return gl.INT;
        case ShaderDataType.Int3:     return gl.INT;
        case ShaderDataType.Int4:     return gl.INT;
        case ShaderDataType.Bool:     return gl.BOOL;
    }

    assert(false, "Unknown ShaderDataType!");
    return 0;
}

function shaderDataTypeComponentCount(type) {
    switch (type) {
        case ShaderDataType.Float:   return 1;
        case ShaderDataType.Float2:  return 2;
        case ShaderDataType.Float3:  return 3;
        case ShaderDataType.Float4:  return 4;
        case ShaderDataType.Mat3:    return 3 * 3;
        case ShaderDataType.Mat4:    return 4 * 4;
        case ShaderDataType.Int:     return 1;
        case ShaderDataType.Int2:    return 2;
        case ShaderDataType.Int3:    return 3;
        case ShaderDataType.Int4:    return 4;
        case ShaderDataType.Bool:    return 1;
    }

    assert(false, "Unknown ShaderDataType!");
    return 0;
}

export class BufferElement {
    constructor(type, name, normalized=false) {
        this.type = type;
        this.name = name;
        this.normalized = normalized;
        this.offset = 0;
        this.size = shaderDataTypeSize(type);
    }

    get componentCount() { return shaderDataTypeComponentCount(this.type); }
}

export class BufferLayout {
    constructor(...elements) {
        this._elements = elements;
        this._stride = 0;
        this._calculateOffsetsAndStride();
    }

    get stride() { return this._stride; }
    get elements() { return this._elements; }

    _calculateOffsetsAndStride() {
        let offset = 0;
        this._stride = 0;
        for (let element of this._elements) {
            element.offset = offset;
            offset += element.size;
            this._stride += element.size;
        }
    }
}

export class VBO {
    constructor(gl, vertices, layout) {
        this.gl = gl;
        this.layout = layout;

        this.id = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.id);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    }

    delete() {
        this.gl.deleteBuffer(this.id);
    }

    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.id);
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, 0);
    }
}

export class IBO {
    constructor(gl, indices) {
        this.gl = gl;

        this.id = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.id);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        this._count = indices.length;
    }

    get count() { return this._count; }

    delete() {
        this.gl.deleteBuffer(this.id);
    }

    bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.id);
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, 0);
    }
}

export class VAO {
    constructor(gl) {
        this.gl = gl;
        this.id = this.gl.createVertexArray();

        this._vbos = [];
        this._elementIndex = 0;

        this._ibo = null;
    }

    get ibo() { return this._ibo; }

    delete() {
        this.gl.deleteVertexArray(this.id);
    }

    bind() {
        this.gl.bindVertexArray(this.id);
    }

    unbind() {
        this.gl.bindVertexArray(0);
    }

    addVBO(vbo) {
        this.bind();
        vbo.bind();

        for (let element of vbo.layout.elements) {
            this.gl.enableVertexAttribArray(this._elementIndex);
			this.gl.vertexAttribPointer(this._elementIndex,
				element.componentCount,
				shaderDataTypeToGLBaseType(this.gl, element.type),
				element.normalized,
				vbo.layout.stride,
				element.offset);
            this._elementIndex++;
        }

        this._vbos.push(vbo);
    }

    setIBO(ibo) {
        this.bind();
        ibo.bind();

        this._ibo = ibo;
    }
}