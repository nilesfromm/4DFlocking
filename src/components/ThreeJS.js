import { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Edges } from '@react-three/drei';
import { Flock } from './flock';
// import { BufferAttribute } from 'three';
// import { useStore } from '../utils/store';
// import Tunnel from './Tunnel';

const Three = (props) => {
  // const count = 10;
  useEffect(() => {
    console.log('three props loaded');
  }, [props.loaded]);
  // const positions = useMemo(() => {
  //   // const p = new Array(count).fill(0).map(() => 0.5 - Math.random());
  //   // return new BufferAttribute(new Float32Array(p), 3);
  //   let positions = [];
  //   for (let xi = 0; xi < count; xi++) {
  //     for (let zi = 0; zi < count; zi++) {
  //       let x = 0.5 - Math.random();
  //       let z = 0.5 - Math.random();
  //       let y = 0.5 - Math.random();
  //       positions.push(x, y, z);
  //     }
  //   }
  //   return new Float32Array(positions);
  // }, [count]);
  // const sizes = useMemo(() => {
  //   let sizes = [];
  //   for (let i = 0; i < count; i++) {
  //     let s = 0.1;
  //     sizes.push(s);
  //   }
  //   return new Float32Array(sizes);
  // }, [count]);
  return (
    <Canvas camera={{ position: [-4, 2, 3], fov: 50 }}>
      {/* <color attach="background" args={["#EEEFF0"]} /> */}
      {/* <fog attach="fog" color="#EEEFF0" near={1} far={5} /> */}
      <ambientLight intensity={0.5} />

      <Suspense fallback={null}>
        <Environment files={'SoftLightsStudio2.hdr'} opacity={1} path={'/hdri/'} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry attach="geometry" args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial attach="material" opacity={0.3} transparent />
          <Edges
            scale={1}
            threshold={15} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
            color="black"
          />
        </mesh>
        <Flock count={600} />
        {/* <mesh position={[0, 0, 0]}>
          <boxGeometry attach="geometry" args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial attach="material" color={'red'} />
        </mesh> */}
        {/* <points>
          <bufferGeometry>
            <bufferAttribute
              attach={'attributes-position'} //attribute parameter yang akan dikontrol
              array={positions}
              count={positions.length / 3}
              itemSize={3} //dikeranakan telah diketahui bahwa tiap arraytype axis akan berisi 3 value pada 1d array
            />
            <bufferAttribute
              attach={'attributes-size'}
              array={sizes}
              count={sizes.length}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} threshold={0.1} color={0xff00ff} sizeAttenuation={true} />
        </points> */}
        <OrbitControls enableZoom={true} />
        {/* <Ground /> */}
      </Suspense>
    </Canvas>
  );
};

export default Three;
