import { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Edges } from '@react-three/drei';
import { Flock } from './flock4D';
import { useControls } from 'leva';
// import { BufferAttribute } from 'three';
// import { useStore } from '../utils/store';
// import Tunnel from './Tunnel';

const Three = (props) => {
  // const count = 10;
  useEffect(() => {
    console.log('three props loaded');
  }, [props.loaded]);
  const { showBox, darkMode } = useControls({ showBox: false, darkMode: false });

  return (
    // <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
    <Canvas camera={{ position: [-3.5, 2, 2.5], fov: 50 }}>
      <color attach="background" args={darkMode ? ['black'] : ['white']} />
      {/* <fog attach="fog" color={darkMode ? 'black' : 'white'} near={5} far={7} /> */}
      <ambientLight intensity={0.5} />

      <Suspense fallback={null}>
        <Environment files={'SoftLightsStudio2.hdr'} opacity={1} path={'/hdri/'} />
        {showBox && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry attach="geometry" args={[2, 2, 2]} />
            <meshStandardMaterial attach="material" opacity={0.005} transparent />
            <Edges
              scale={1}
              threshold={15} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
              color={darkMode ? 'gray' : 'white'}
            />
          </mesh>
        )}
        <Flock count={400} dark={darkMode} />
        <OrbitControls enableZoom={true} />
        {/* <Ground /> */}
      </Suspense>
    </Canvas>
  );
};

export default Three;
