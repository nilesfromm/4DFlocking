import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';

function LerpRGB(a, b, t) {
  return [a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t];
}

function clamp(particle, clampStrength) {
  let bound = 1;
  let strength = 0.0005 * clampStrength;
  let { position, velocity } = particle;
  if (position.x > bound) {
    velocity.x -= strength;
  } else if (position.x < -bound) {
    velocity.x += strength;
  }
  if (position.y > bound) {
    velocity.y -= strength;
  } else if (position.y < -bound) {
    velocity.y += strength;
  }
  if (position.z > bound) {
    velocity.z -= strength;
  } else if (position.z < -bound) {
    velocity.z += strength;
  }
  if (position.w > bound) {
    velocity.w -= strength;
  } else if (position.w < -bound) {
    velocity.w += strength;
  }
}

function alignment(particle, particles, alignmentMix, alignmentDist) {
  let perceptionRadius = 0.2 * alignmentDist;
  let steering = new THREE.Vector4(0, 0, 0, 0);
  let total = 0;
  for (let other of particles) {
    // let d = particle.position.distanceTo(other.position);
    let pp = particle.position;
    let op = other.position;

    let d = Math.sqrt(
      (pp.x - op.x) ** 2 + (pp.y - op.y) ** 2 + (pp.z - op.z) ** 2 + (pp.w - op.w) ** 2
    );

    if (other !== particle && d < perceptionRadius) {
      steering.add(other.velocity);
      total++;
    }
  }
  if (total > 0) {
    steering.divideScalar(total);
    steering.normalize();
    steering.multiplyScalar(0.015 * alignmentMix);
    steering.sub(particle.velocity);
    steering.clampLength(-0.0001, 0.0001);
    steering.multiplyScalar(particle.maxVelocity);
  }

  return steering;
}

function cohesion(particle, particles, cohesionMix, cohesionDist) {
  let perceptionRadius = 0.2 * cohesionDist;
  let steering = new THREE.Vector4(0, 0, 0, 0);
  let total = 0;
  for (let other of particles) {
    // let d = particle.position.distanceTo(other.position);
    let pp = particle.position;
    let op = other.position;

    let d = Math.sqrt(
      (pp.x - op.x) ** 2 + (pp.y - op.y) ** 2 + (pp.z - op.z) ** 2 + (pp.w - op.w) ** 2
    );

    if (other !== particle && d < perceptionRadius) {
      steering.add(other.position);
      total++;
    }
  }
  if (total > 0) {
    steering.divideScalar(total);
    steering.sub(particle.position);
    steering.normalize();
    steering.multiplyScalar(0.015 * cohesionMix);
    steering.sub(particle.velocity);
    steering.clampLength(-0.0001, 0.0001);
    steering.multiplyScalar(particle.maxVelocity);
  }

  return steering;
}

function seperation(particle, particles, seperationMix, seperationDist) {
  let perceptionRadius = 0.2 * seperationDist;
  let steering = new THREE.Vector4(0, 0, 0, 0);
  let total = 0;
  for (let other of particles) {
    // let d = particle.position.distanceTo(other.position);
    let pp = particle.position;
    let op = other.position;

    let d = Math.sqrt(
      (pp.x - op.x) ** 2 + (pp.y - op.y) ** 2 + (pp.z - op.z) ** 2 + (pp.w - op.w) ** 2
    );

    if (other !== particle && d < perceptionRadius) {
      let diff = new THREE.Vector4(0, 0, 0, 0);
      diff.subVectors(particle.position, other.position);
      diff.divideScalar(d);
      steering.add(diff);
      total++;
    }
  }
  if (total > 0) {
    steering.divideScalar(total);
    // steering.sub(particle.position);
    steering.normalize();
    steering.multiplyScalar(0.015 * seperationMix);
    steering.sub(particle.velocity);
    steering.clampLength(-0.0001, 0.0001);
    steering.multiplyScalar(particle.maxVelocity);
  }

  return steering;
}

export function Flock({ count, dark }) {
  const mesh = useRef();
  const light = useRef();
  //   const { size, viewport } = useThree();
  //   const aspect = size.width / viewport.width;

  let {
    clampStrength,
    alignmentMix,
    alignmentDist,
    cohesionMix,
    cohesionDist,
    seperationMix,
    seperationDist
  } = useControls({
    clampStrength: {
      value: 0.5,
      min: 0.01,
      max: 2,
      step: 0.01
    },
    alignmentMix: {
      value: 1.25,
      min: 0.01,
      max: 5,
      step: 0.01
    },
    alignmentDist: {
      value: 2.5,
      min: 0.01,
      max: 5,
      step: 0.01
    },
    cohesionMix: {
      value: 0.7,
      min: 0.01,
      max: 5,
      step: 0.05
    },
    cohesionDist: {
      value: 1.5,
      min: 0.01,
      max: 5,
      step: 0.05
    },
    seperationMix: {
      value: 1.8,
      min: 0.01,
      max: 5,
      step: 0.05
    },
    seperationDist: {
      value: 1.2,
      min: 0.01,
      max: 5,
      step: 0.05
    }
  });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Generate some random positions, speed factors and timings
  const colorA = new THREE.Color(dark ? 'gray' : 'coral');
  const colorB = new THREE.Color(dark ? 'black' : 'cornflowerblue');
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector4(
        0.5 - Math.random(),
        0.5 - Math.random(),
        0.5 - Math.random(),
        0.5 - Math.random()
      );
      const velocity = new THREE.Vector4(
        (0.5 - Math.random()) * 0.025,
        (0.5 - Math.random()) * 0.025,
        (0.5 - Math.random()) * 0.025,
        (0.5 - Math.random()) * 0.025
      );
      const accelleration = new THREE.Vector4(0, 0, 0, 0);

      temp.push({
        position,
        velocity,
        accelleration,
        maxVelocity: 1 + Math.random() * 0.5
      });
    }
    return temp;
  }, [count]);
  // update flock
  useFrame(() => {
    light.current.position.set(0, 0, 0);

    particles.forEach((particle, i) => {
      let maxVelocity = 1;

      particle.accelleration = alignment(particle, particles, alignmentMix, alignmentDist);
      particle.accelleration.add(cohesion(particle, particles, cohesionMix, cohesionDist));
      particle.accelleration.add(seperation(particle, particles, seperationMix, seperationDist));

      particle.velocity.multiplyScalar(0.999);
      particle.velocity.add(particle.accelleration);
      particle.velocity.clampScalar(-maxVelocity, maxVelocity);
      particle.position.add(particle.velocity);

      clamp(particle, clampStrength);

      // Update the dummy object
      dummy.position.set(particle.position.x, particle.position.y, particle.position.z);

      //   let mainScale = 0.05;
      //   dummy.scale.set(mainScale, mainScale, mainScale);

      let velocityScale = particle.velocity.length() / maxVelocity;

      let mainScale = 0.03 + 0.1 * Math.abs(particle.position.w);
      dummy.scale.set(mainScale, mainScale, mainScale + 6 * velocityScale);

      let [r, g, b] = LerpRGB(colorA, colorB, Math.min(1, Math.abs(particle.position.w)));

      //   console.log(r, g, b);
      let lookTarget = dummy.position.clone();
      lookTarget.add(particle.velocity);

      dummy.lookAt(lookTarget);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, new THREE.Color(r, g, b));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={light} distance={30} intensity={5} color="#FFCC66"></pointLight>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereBufferGeometry attach="geometry" args={[0.5, 64, 64]} />
        <meshStandardMaterial
          attach="material"
          wireframe="true"
          color="white"
          roughness={0.5}
          metalness={0.1}
        />
      </instancedMesh>
    </>
  );
}
