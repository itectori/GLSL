// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


vec2 rotate(vec2 v, float r) {
    float c = cos(r);
    float s = sin(r);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}


float dist(vec3 pos) {
    pos.xy = rotate(pos.xy, pos.z / 10.);
    pos = mod(pos, 1.);
    float s = distance(pos, vec3(0.5)) - 0.2;
    float p = distance(pos.x, 0.5) - 0.01;
    return min(s, p);
}

void main() {
    vec3 origin = vec3(0, 0, u_time);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    vec3 pos = origin;
    vec3 dir = normalize(vec3(st - 0.5, 0.5));
    dir.zy = rotate(dir.zy, u_mouse.y / 100.);
    dir.xz = rotate(dir.xz, u_mouse.x / 100.);
    
    vec3 color = vec3(0.216,0.650,0.995);
	
    for (int i = 0; i < 100; i++) {
        pos += dir * dist(pos);
    }

    gl_FragColor = vec4(color / distance(origin, pos),1.0);
}