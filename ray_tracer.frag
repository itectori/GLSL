// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const float eps = .01;
const float sphere_radius = 0.7;
const vec3 sphere_center = vec3(0, sphere_radius, 0);
const vec3 sphere_color = vec3(0.533,1.000,0.010);
const vec3 light = normalize(vec3(0.037,1.000,0.759));
const vec3 sky_color = vec3(0.758,0.971,1.000);


vec2 rotate(vec2 v, float r) {
    float c = cos(r);
    float s = sin(r);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

float distance_plane(vec3 pos, vec3 dir) {
    return -pos.y/dir.y;
}

float distance_sphere(vec3 pos, vec3 dir) {
    pos -= sphere_center;
    float a = dir.x * dir.x + dir.y * dir.y + dir.z * dir.z;
    float b = 2. * (dir.x * pos.x + dir.y * pos.y + dir.z * pos.z);
    float c = pos.x * pos.x + pos.y * pos.y + pos.z * pos.z - sphere_radius * sphere_radius;
    float D = b * b - 4. * a * c;
    if (D >= 0.) {
        float x1 = (- b - sqrt(D)) / (2. * a);
        float x2 = (- b + sqrt(D)) / (2. * a);
        if (x1 < 0.)
            return x2;
        if (x2 < 0.)
            return x1;
        return min(x1, x2);
    }
    return -1.;
}

vec3 rotate_time(vec3 p) {
    p.xz = rotate(p.xz, u_time);
	return p;
}

vec3 normal_plan(vec3 pos) {
    return normalize(vec3(0, 1, 0));
}

vec3 normal_sphere(vec3 pos) {
    return normalize(pos - sphere_center);
}

float compute_shadow(vec3 pos, vec3 dir, vec3 normal) {
    float ambiant = 0.66;
    float diffuse = dot(normal, light) / 3.;
    float specular = 0.;
    if (dot(light, normal) > 0.) {
        vec3 R = normalize(2. * dot(normal, light) * normal - light);
    	specular = pow(dot(-dir, R), 50.) * 0.3;
    }
    float shadow = specular + diffuse + ambiant;
	return clamp(shadow, 0., 1.);
}

vec3 shadow_light(vec3 pos) {
    float sphere_light = 0.;
    float shadow = 0.;
    float s = distance_sphere(pos, light);
    if (s > 0.) {
        shadow = -s / 5.;
    }
    return sphere_light * sphere_color + shadow;
}


vec3 smooth_plan(vec3 color, vec3 pos)
{
    float smooth =  clamp(1. / length(pos) * 10., 0., 1.);
    return color * smooth + (1. - smooth) * sky_color;
}

vec3 texture_plane(vec3 pos, vec3 dir) {
    pos *= 3.;
    int x = int(sin(pos.x) + 0.999);
    int z = int(sin(pos.z) + 0.999);
    
    vec3 color;
    if (x == 1)
        color = vec3(z) / 1.5 + 0.3;
    else
        color = vec3(1 - z) / 1.5 + 0.3;
    color += shadow_light(pos / 3.);
    color = smooth_plan(color, pos);
    return color;
}

vec3 plan_sky_color(vec3 pos, vec3 dir, float dist) {
    if (dist > 0.) {
        vec3 pos_surface = dir * dist + pos;
        return smooth_plan(texture_plane(pos_surface, dir), pos_surface);
    }
    else
        return sky_color;
}

vec3 compute_reflect(vec3 pos, vec3 dir, vec3 normal) {
    vec3 reflect_vec = 2. * normal + dir;
    float p_reflect = distance_plane(pos,  reflect_vec);
    return plan_sky_color(pos, reflect_vec, p_reflect);
}

vec3 refract_ray(vec3 dir, vec3 normal, float n1, float n2)
{
    float n = n1 / n2;
    float c1 = abs(dot(normal, dir));
    float c2 = sqrt(1. - n * n * (1. - c1 * c1));
    
    vec3 ray =  n * dir + (n * c1 - c2) * normal;
    return normalize(ray);
}

vec3 refract_glass_air(vec3 pos, vec3 dir, vec3 normal) {
    vec3 r = refract_ray(dir, normal, 1.05, 1.);
    float p = distance_plane(pos, r);
    vec3 new_pos = pos + r * p;
	return plan_sky_color(new_pos, r, p);
}

vec3 refract_air_glass(vec3 pos, vec3 dir, vec3 normal) {
    vec3 r = refract_ray(dir, normal, 1., 1.05);
    float s = distance_sphere(pos + r * eps, r);
    vec3 new_pos = pos + r * s;
	return refract_glass_air(new_pos, r, -normal_sphere(new_pos));
}

vec3 texture_sphere(vec3 pos, vec3 dir) {
    vec3 normal = normal_sphere(pos);
    float shadow = compute_shadow(pos, dir, normal);
    vec3 reflect = compute_reflect(pos, dir, normal);
    vec3 refract = refract_air_glass(pos, dir, normal);
    return shadow * (reflect * 0.2 + refract * 0.5 + sphere_color * 0.3);
}

vec3 raytrace(vec3 pos, vec3 dir) {
    float p = distance_plane(pos, dir);
    float s = distance_sphere(pos, dir);
    if (max(p, s) < 0.)
    	return sky_color;
    
    vec3 color;
    vec3 pos_surface;
    if (s < 0. || (p < s && p > 0.)) {
    	pos_surface = dir * p + pos;
        color = texture_plane(pos_surface, dir);
        //color *= compute_shadow(pos_surface, dir, normal_plan(pos));
    } else {
        pos_surface = dir * s + pos;
        color = texture_sphere(pos_surface, dir);
    }
    return color;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    
    vec3 pos = vec3(0, 1, -2);
    vec3 dir = normalize(vec3(st - 0.5, 0.5));
    dir.yz = rotate(dir.yz, 0.2);
    dir = rotate_time(dir);
	pos = rotate_time(pos);
    vec3 color = raytrace(pos, dir);
    
    gl_FragColor = vec4(color, 1.0);
}