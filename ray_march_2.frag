// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const int iter = 100;

const float eps = 0.01;

vec2 rotate2D(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

vec3 rotate3D(vec3 p, float x, float y) {
    p.yz = rotate2D(p.yz, y);
    p.xz = rotate2D(p.xz, x);
    return p;
}

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); }


float opSmoothSubtraction( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h); }

float dist(vec3 p) {
    p /= 3.;
    p.xy = rotate2D(p.xy, p.z/1.5);
    vec3 p2 = mod(p, 1.);
    float d = 100.;
    d = sdRoundBox(p2-0.5, vec3(0.1), 0.05);
    d = opSmoothSubtraction(distance(p2, vec3(0.5)) - 0.15, d, 0.1);
    
    float d2 = 100.;
    d2 = distance(p2.yx, vec2(0.5)) - 0.02;
    d2 = opSmoothUnion(distance(p2.zx, vec2(0.5)) - 0.02, d2, 0.1);
    d2 = opSmoothUnion(distance(p2.zy, vec2(0.5)) - 0.02, d2, 0.1);
    return abs(min(d, d2)) - eps;
}

vec3 grad(vec3 p) {
    float d = dist(p);
    float d_x = (d - dist(p + vec3(eps, 0, 0))) / eps;
    float d_y = (d - dist(p + vec3(0, eps, 0))) / eps;
    float d_z = (d - dist(p + vec3(0, 0, eps))) / eps;
    vec3 g = vec3(d_x, d_y, d_z);
    return normalize(g);
}

void main() {
    vec2 mouse = vec2(0);//(u_mouse / u_resolution.xy - 0.5) * 4.;
    vec3 origin = vec3(0, 0, u_time);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 pos = normalize(vec3(st.x - 0.5, st.y - 0.5, 0.5));
    pos = rotate3D(pos, mouse.x, mouse.y);
    vec3 dir = pos;
    pos += origin;

    for (int i = 0; i < iter; i++) {
        pos += dir * dist(pos);
    }
    
    vec3 shadow = 0.3 + vec3(dot(grad(pos), vec3(0.5))) / 3.;
    vec3 color = vec3(0.207,0.535,0.820);
    gl_FragColor = vec4(shadow * color / distance(vec3(0),(pos-origin) * 0.1), 1.);
}