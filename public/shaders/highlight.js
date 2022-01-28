export default `
#type vertex
#version 300 es
in vec3 a_Position;
in vec2 a_TexCoord;

uniform mat4 u_ViewProjection;
uniform mat4 u_Transform;

out vec4 o_WorldPos;

void main() {
    o_WorldPos = u_Transform * vec4(a_Position, 1);
    gl_Position = u_ViewProjection * o_WorldPos;
}

#type fragment
#version 300 es
precision highp float;

float bezier(float t) {
    t = clamp(t, 0.0, 1.0);
    return t*t*(3.0 - 2.0*t);
}

in vec4 o_WorldPos;

uniform float u_HighlightX;
uniform float u_Opacity;

out vec4 o_Color;

void main() {
    float dist = abs(u_HighlightX - o_WorldPos.x);
    float value = 1.0 - bezier(dist);
    float opacity = (1.0 - value) * u_Opacity;

    o_Color = vec4(value, value, value, opacity);
}
`;