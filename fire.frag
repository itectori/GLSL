// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y) * 0.5 + 0.5;
}

vec3 texture(float f) {
    //vec3 red = vec3(0.965,0.342,0.003);
    vec3 red = vec3(0.990,0.486,0.002);
	return f * red + f/3.;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    float n1 = noise(st * 5. - vec2(0, u_time * 7.));
    float n2 = noise(vec2(st  - u_time * 2.));
    float n3 = noise(vec2(st - vec2(-u_time, u_time)));
    float grad = pow((1. - st.y) * abs(sin(st.x * 3.)), 2.);
    vec3 color = texture(n1 * grad / (n2 * n3 * 1.5));
    //vec3 color = vec3(n1);
    //vec3 color = vec3(noise(st * 10. + u_time));
    gl_FragColor = vec4(color,1.0);
}