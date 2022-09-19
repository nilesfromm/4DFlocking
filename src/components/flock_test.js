import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

//original:
//https://codesandbox.io/s/rtf-flocking-wip-forked-021yxj?file=/src/index.js:2720-2755

export function Flock({ count }) {
  const mesh = useRef();
  //   const light = useRef();
  //   const { size, viewport } = useThree();
  //   const aspect = size.width / viewport.width;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Generate some random positions, speed factors and timings
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const timeSpeed = (0.01 + Math.random() / 200) / 2;
      const velocity = new THREE.Vector3(
        (0.5 - Math.random()) * 0.001,
        (0.5 - Math.random()) * 0.001,
        0
      );
      const position = new THREE.Vector3(0.5 - Math.random(), 0.5 - Math.random(), 0);
      const maxVelocity = 1 + Math.random() * 0.25;
      const maxForce = 0.1;
      const accelleration = new THREE.Vector3(0, 0, 0);
      const loopStep = 0;
      temp.push({
        t,
        timeSpeed,
        position,
        velocity,
        maxVelocity,
        maxForce,
        accelleration,
        loopStep
      });
    }
    return temp;
  }, [count]);
  // update every frame
  useFrame(() => {
    particles.forEach((particle, i) => {
      // runFlocking

      // update the dummy object
      dummy.position.set(particle.position.x, particle.position.y, particle.position.z);

      dummy.scale.set(0.025, 0.025, 0.025);

      dummy.updateMatrix();
      // apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereBufferGeometry attach="geometry" args={[0.5, 8, 8]} />
        <meshStandardMaterial attach="material" wireframe="true" color="cornflowerblue" />
      </instancedMesh>
    </>
  );
}
