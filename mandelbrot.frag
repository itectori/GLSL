// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 color(float i) {
    i = mod(i, 5.);
    if (i < 1.)
        return vec3(0.985,0.704,0.260);
    if (i < 2.)
        return vec3(0.804,0.975,0.256);
    if (i < 3.)
        return vec3(1.000,0.486,0.070);
    if (i < 4.)
        return vec3(0.502,0.803,0.975);
    return vec3(0.985,0.447,0.523);
}

const int iter = 30;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 pos = st - 0.5;
    pos.x -= 0.25;
    pos *= 2.5;
    
    float a = pos.x;
    float b = pos.y;
    float c = a;
	float d = b;
    int j = 0;
    
    for (int i = 0; i < iter; i++) {
        // (a + bi) ^ 2 + c + di
        float tmp = a;
        a = a * a - b * b + c;
        b = 2. * tmp * b + d;
        j++;
        if (length(vec2(a, b)) > 2.)
            break;
    }
    vec3 co = vec3(1);
    if (j == iter)
        co = color(distance(st, vec2(0.5)) * 10. - u_time);
    else if (j > iter / 3)
        co = vec3(0.251,0.985,0.843);
    else    
    	co = color(length(vec2(a+u_time,b+u_time))*1.);
    
    
    gl_FragColor = vec4(co, 1);
}