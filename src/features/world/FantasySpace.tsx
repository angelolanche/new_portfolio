import { BackSide } from 'three';
import { createRingParticles } from './ringParticles';

const noise = `
  float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
  float noise3(vec3 p) {
    vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
      mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
      mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p) {
    float v=0., a=.5;
    for(int i=0;i<5;i++){ v+=a*noise3(p);p=p*2.03+vec3(7.1,3.7,9.2);a*=.5; }
    return v;
  }
`;

export function NebulaSky() {
  return (
    // Draw after opaque architecture so the depth buffer rejects hidden sky
    // before running the expensive procedural nebula shader.
    <mesh renderOrder={1}>
      <sphereGeometry args={[220, 48, 24]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        vertexShader={`varying vec3 direction;
          void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`varying vec3 direction; ${noise}
          void main(){
            vec3 p=normalize(direction);
            float cloud=fbm(p*8.);
            float band=exp(-pow((p.y+.28*p.x+.08)/.22,2.));
            float wisps=smoothstep(.3,.72,cloud)*band;
            float dust=smoothstep(.46,.72,fbm(p*19.+4.));
            vec3 gas=mix(vec3(.025,.065,.085),vec3(.21,.12,.065),fbm(p*5.+20.));
            vec3 color=vec3(.002,.004,.009)+gas*wisps*(1.-dust*.8);
            color+=vec3(.07,.045,.095)*pow(fbm(p*12.+9.),3.)*band;
            gl_FragColor=vec4(color,1.);
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}

const particles = createRingParticles();

export function RingIce() {
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-grainSize"
          args={[particles.sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexColors
        vertexShader={`attribute float grainSize; varying vec3 tint;
          void main(){
            vec4 view=modelViewMatrix*vec4(position,1.);
            tint=color;
            gl_PointSize=clamp(grainSize*110./max(10.,-view.z),.6,4.);
            gl_Position=projectionMatrix*view;
          }`}
        fragmentShader={`varying vec3 tint;
          void main(){
            vec2 p=gl_PointCoord-.5; float d=length(p);
            if(d>.5) discard;
            gl_FragColor=vec4(tint,1.-smoothstep(.15,.5,d));
            #include <colorspace_fragment>
          }`}
      />
    </points>
  );
}
