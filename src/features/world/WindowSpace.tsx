import { NebulaSky, RingIce } from './FantasySpace';
import {
  planetPosition,
  planetRotation,
  planetScale,
  planetRadius,
  ringInnerRadius,
  ringOuterRadius,
} from './exteriorLayout';
import { DoubleSide } from 'three';
import { FinishedBox as Box } from './FinishedBox';

const planetVertex = `
  varying vec3 surfacePoint;
  void main() {
    surfacePoint = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
  }
`;

// All objects are outside the actual wall aperture. Near architecture occludes
// distant geometry naturally; nothing is mapped onto the window glass.
export function WindowSpace() {
  return (
    <group>
      <NebulaSky />
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 1800 }, (_, i) => {
                  const a = i * 2.399963;
                  const y = ((i * 0.618034) % 1) * 1.6 - 0.8;
                  const r = Math.sqrt(1 - y * y);
                  return [
                    Math.sin(a) * r * 210,
                    y * 210,
                    -Math.abs(Math.cos(a)) * r * 210,
                  ];
                }).flat(),
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#b9c6d4"
          size={0.19}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
      <group
        position={planetPosition}
        rotation={planetRotation}
        scale={planetScale}
      >
        <mesh>
          <sphereGeometry args={[planetRadius, 64, 40]} />
          <shaderMaterial
            vertexShader={planetVertex}
            fragmentShader={`
          varying vec3 surfacePoint;
          void main() {
            vec3 n=normalize(surfacePoint);
            vec3 sun=normalize(vec3(-.8,.32,.7));
            float diffuse=max(dot(n,sun),0.);
            float latitude=n.y+sin(n.x*13.+n.y*19.)*.012+sin(n.z*27.+n.y*40.)*.004;
            float bands=sin(latitude*65.)*.10+sin(latitude*24.)*.16+sin(latitude*139.)*.035+sin(latitude*320.+n.x*9.)*.012;
            vec3 sand=vec3(.78,.59,.31)+bands*vec3(.65,.58,.43);
            // Thin equatorial shadow cast by the rings onto the globe.
            float ringShadow=(1.-smoothstep(.025,.065,abs(n.y+.12)))*step(0.,n.z);
            vec3 color=sand*(.025+pow(diffuse,.7)*1.15)*(1.-ringShadow*.65);
            gl_FragColor=vec4(color,1.);
            #include <colorspace_fragment>
          }
        `}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringInnerRadius, ringOuterRadius, 160, 1]} />
          <shaderMaterial
            side={DoubleSide}
            vertexShader={planetVertex}
            fragmentShader={`
          varying vec3 surfacePoint;
          void main() {
            float r=length(surfacePoint.xy);
            // Cassini division separates the broad inner and outer rings.
            if(r>2.86 && r<3.06) discard;
            float grooves=sin(r*180.)*.055+sin(r*57.)*.075+sin(r*330.)*.025;
            float fineDivisions=1.-.65*exp(-pow((r-3.64)/.018,2.))-.45*exp(-pow((r-2.42)/.012,2.));
            float edge=smoothstep(1.95,2.12,r)*(1.-smoothstep(3.95,4.15,r));
            vec3 color=mix(vec3(.23,.20,.16),vec3(.98,.88,.66),edge)+grooves;
            float shadow=1.-(1.-smoothstep(.9,1.5,abs(surfacePoint.x)))*step(.0,surfacePoint.y)*.55;
            gl_FragColor=vec4(color*shadow*fineDivisions,1.);
            #include <colorspace_fragment>
          }
        `}
          />
        </mesh>
        <RingIce />
      </group>
      {/* Deep reveals connect the indoor frame to the exterior facade. */}
      {/* Layered timber trim, sash stops, brass catches and sill apron. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Slim glazing beads preserve the unobstructed space view. */}
          {[-0.79, -0.025, 0.025, 0.79].map((x) => (
            <Box
              key={x}
              position={[x, side * 0.445, 0.119]}
              size={[0.012, 0.84, 0.018]}
              color="#b09c7d"
              radius={0.002}
            />
          ))}
          {[-0.875, -0.03, 0.03, 0.875].map((y) => (
            <Box
              key={y}
              position={[side * 0.405, y, 0.119]}
              size={[0.75, 0.012, 0.018]}
              color="#b09c7d"
              radius={0.002}
            />
          ))}
          {[-0.61, 0.61].map((y) => (
            <group key={y} position={[side * 0.813, y, 0.15]}>
              <Box
                position={[0, 0, 0]}
                size={[0.055, 0.112, 0.012]}
                color="#635943"
                surface="plain"
                radius={0.004}
              />
              <mesh position={[side * 0.025, 0, 0.012]}>
                <cylinderGeometry args={[0.012, 0.012, 0.13, 12]} />
                <meshStandardMaterial
                  color="#9e8860"
                  metalness={0.7}
                  roughness={0.38}
                />
              </mesh>
              {[-0.036, 0.036].map((dy) => (
                <group key={dy} position={[-side * 0.012, dy, 0.008]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} />
                    <meshStandardMaterial
                      color="#ac9872"
                      metalness={0.65}
                      roughness={0.45}
                    />
                  </mesh>
                  <Box
                    position={[0, 0, 0.004]}
                    size={[0.007, 0.0015, 0.002]}
                    color="#342e23"
                    surface="plain"
                    radius={0}
                  />
                </group>
              ))}
            </group>
          ))}
          <Box
            position={[side * 0.89, -1.02, 0.15]}
            size={[0.13, 0.035, 0.25]}
            color="#9a8060"
          />
          <Box
            position={[side * 0.72, -1.09, 0.035]}
            size={[0.11, 0.16, 0.13]}
            color="#68513b"
            radius={0.025}
          />
        </group>
      ))}
      <Box
        position={[0, -0.995, 0.235]}
        size={[1.89, 0.023, 0.025]}
        color="#a18b6b"
        radius={0.006}
      />
      <Box
        position={[0, 0.012, 0.112]}
        size={[1.62, 0.012, 0.012]}
        color="#4e4639"
        radius={0.002}
      />
      {[-0.91, 0.91].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0, 0.075]}
            size={[0.1, 2.04, 0.12]}
            color="#756149"
          />
          <Box
            position={[x * 0.93, 0, 0.145]}
            size={[0.024, 1.85, 0.025]}
            color="#b09a78"
          />
        </group>
      ))}
      {[-0.94, 0.94].map((y) => (
        <group key={y}>
          <Box
            position={[0, y, 0.09]}
            size={[1.91, 0.095, 0.12]}
            color="#756149"
          />
          <Box
            position={[0, y * 0.94, 0.145]}
            size={[1.65, 0.022, 0.025]}
            color="#b09a78"
          />
        </group>
      ))}
      <Box
        position={[0, -1.07, 0.05]}
        size={[1.73, 0.12, 0.1]}
        color="#594432"
      />
      {[-0.11, 0.11].map((x) => (
        <group key={x}>
          <Box
            position={[x, -0.06, 0.13]}
            size={[0.045, 0.08, 0.02]}
            color="#8c7851"
            surface="plain"
          />
          <Box
            position={[x, -0.025, 0.155]}
            size={[0.075, 0.018, 0.028]}
            color="#ae9662"
            surface="plain"
          />
        </group>
      ))}
      {[-0.815, 0.815].map((x) => (
        <Box
          key={x}
          position={[x, 0, -0.22]}
          size={[0.06, 1.8, 0.58]}
          color="#82745e"
          surface="plaster"
          radius={0.005}
        />
      ))}
      <Box
        position={[0, -0.9, -0.23]}
        size={[1.8, 0.1, 0.8]}
        color="#8b806c"
        surface="plain"
        radius={0.015}
      />
      <Box
        position={[0, 0.9, -0.22]}
        size={[1.8, 0.08, 0.58]}
        color="#615c50"
        surface="plaster"
        radius={0.005}
      />
    </group>
  );
}
