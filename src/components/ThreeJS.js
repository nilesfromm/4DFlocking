import { useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Edges } from '@react-three/drei';
import { BufferAttribute } from 'three';
// import { useStore } from '../utils/store';
// import Tunnel from './Tunnel';

const Three = (props) => {
  const count = 100;
  useEffect(() => {
    console.log('three props loaded');
  }, [props.loaded]);
  const points = useMemo(() => {
    const p = new Array(count).fill(0).map(() => 0.5 - Math.random());
    return new BufferAttribute(new Float32Array(p), 3);
  }, [count]);
  return (
    <Canvas camera={{ position: [1.25, 1.25, 1.25], fov: 50 }}>
      {/* <color attach="background" args={["#EEEFF0"]} /> */}
      <fog attach="fog" color="#EEEFF0" near={1} far={5} />
      <ambientLight intensity={0.5} />

      <Suspense fallback={null}>
        <Environment files={'SoftLightsStudio2.hdr'} opacity={1} path={'/hdri/'} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry attach="geometry" args={[1, 1, 1]} />
          <meshStandardMaterial attach="material" opacity={0.3} transparent />
          <Edges
            scale={1}
            threshold={15} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
            color="black"
          />
        </mesh>
        {/* <mesh position={[0, 0, 0]}>
          <boxGeometry attach="geometry" args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial attach="material" color={'red'} />
        </mesh> */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach={'attributes-position'} {...points} />
          </bufferGeometry>
          <pointsMaterial size={0.1} threshold={0.1} color={0xff00ff} sizeAttenuation={true} />
        </points>
        <OrbitControls enableZoom={true} />
        {/* <Ground /> */}
      </Suspense>
    </Canvas>
  );
};

export default Three;
