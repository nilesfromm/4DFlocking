import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

//original:
//https://codesandbox.io/s/rtf-flocking-wip-forked-021yxj?file=/src/index.js:2720-2755

//returns a vector towards a point, slows down as we near it
function seek(particle, target) {
  let { position, velocity, maxVelocity, maxForce } = particle;
  let desired = target.clone();
  desired.sub(position);
  let length = desired.length();
  desired.normalize();
  desired.multiplyScalar(maxVelocity);
  desired.sub(velocity);
  if (length > 0) {
    desired.divideScalar(1 / length);
  }
  desired.clampLength(-maxForce, maxForce);
  return desired;
}

//returns a vector towards a point, slows down as we near it
function flee(particle, target) {
  let { position, velocity, maxVelocity, maxForce } = particle;
  let desired = position.clone();
  desired.sub(target);
  let length = desired.length();
  desired.normalize();
  desired.multiplyScalar(maxVelocity);
  desired.sub(velocity);
  if (length > 20) {
    desired.multiplyScalar(0.0);
  }
  desired.z = 0;
  desired.clampLength(-maxForce, maxForce);
  return desired;
}

//Run alignment, cohesion, and separation as a single loop
function runFlocking(particle, particles, index, mousePosition, mousePressed) {
  let { maxVelocity, maxForce, velocity, t } = particle;

  //The following const values configure the distances at which to follow other boids
  const desiredSeparation = 0.1 + Math.sin(t * 0.1);
  const desiredAlignment = 0.3;
  const desiredCohesion = 0.2;

  //Weights for the flocking simulation
  const separationMix = 0.1;
  const alignmentMix = 0.2;
  const cohesionMix = 0.4;
  const mouseMix = 0.5 + Math.sin(t * 0.03);

  let separation = new THREE.Vector3();
  let alignment = new THREE.Vector3();
  let cohesion = new THREE.Vector3();
  let separationCount = 0;
  let alignmentCount = 0;
  let cohesionCount = 0;

  particle.loopStep++;
  let loopStart = particle.loopStep % 2 === 0 ? 0 : particles.length / 2;
  let loopEnd = particle.loopStep % 2 === 0 ? particles.length / 2 : particles.length;

  for (let i = loopStart; i < loopEnd; ++i) {
    let { position, velocity } = particles[i];
    let d = particle.position.distanceTo(position);

    //Calculate separation steering forces
    if (d > 0 && d < desiredSeparation) {
      let diff = particle.position.clone();
      diff.sub(position);
      diff.divideScalar(d);
      separation.add(diff);
      separationCount++;
    }

    //Calculate cohesion steering forces
    if (d > 0 && d < desiredCohesion) {
      cohesion.add(position);
      cohesionCount++;
    }

    //Calculate alignment steering forces
    if (d > 0 && d < desiredAlignment) {
      alignment.add(velocity);
      alignmentCount++;
    }
  }

  //Post-process separation
  if (separationCount > 0) {
    separation.divideScalar(separationCount);
  }
  if (separation.length() > 0) {
    separation.normalize();
    separation.multiplyScalar(maxVelocity);
    separation.sub(velocity);
    separation.clampLength(-maxForce, maxForce);
  }

  //Post process cohesion
  if (cohesionCount > 0) {
    cohesion.divideScalar(cohesionCount);
  }

  //Post-process alignment
  if (alignmentCount > 0) {
    alignment.divideScalar(alignmentCount);
  }
  if (alignment.length() > 0) {
    alignment.normalize();
    alignment.multiplyScalar(maxVelocity);
    alignment.sub(velocity);
    alignment.clampLength(-maxForce, maxForce);
  }

  particle.accelleration.add(separation.multiplyScalar(separationMix));
  particle.accelleration.add(seek(particle, cohesion).multiplyScalar(cohesionMix));

  particle.accelleration.add(alignment.multiplyScalar(alignmentMix));

  if (mousePressed) {
    particle.accelleration.add(flee(particle, mousePosition).multiplyScalar(2));
  } else {
    let temp = particle.position.clone();
    temp.sub(mousePosition);
    temp.normalize();
    let perp = new THREE.Vector3(temp.y, temp.x, temp.z);

    perp.multiplyScalar(1);
    temp.addVectors(mousePosition, perp);

    particle.accelleration.add(seek(particle, temp).multiplyScalar(mouseMix));
  }
}

export function Flock({ count }) {
  const mesh = useRef();
  const light = useRef();
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
        (0.5 - Math.random()) * 0.001
      );
      const position = new THREE.Vector3(
        0.5 - Math.random(),
        0.5 - Math.random(),
        0.5 - Math.random()
      );
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
  // The innards of this hook will run every frame
  useFrame(() => {
    let mousePosition = new THREE.Vector3(0, 0, 0);

    light.current.position.set(mousePosition.x, mousePosition.y, mousePosition.z);

    particles.forEach((particle, i) => {
      let { timeSpeed, maxVelocity } = particle;

      particle.t += timeSpeed;

      particle.accelleration.x = 0;
      particle.accelleration.y = 0;
      particle.accelleration.z = 0;

      runFlocking(particle, particles, i, mousePosition, false);

      //Make sure our particles don't change direction too quickly
      particle.accelleration.multiplyScalar(0.0015);

      particle.velocity.multiplyScalar(0.999);
      particle.velocity.add(particle.accelleration);
      particle.velocity.clampScalar(-maxVelocity, maxVelocity);

      particle.position.add(particle.velocity);

      // Update the dummy object
      dummy.position.set(particle.position.x, particle.position.y, particle.position.z);

      let velocityScale = particle.velocity.length() / maxVelocity;

      let mainScale = 0.025;
      dummy.scale.set(mainScale, mainScale, mainScale + 10 * velocityScale);

      let lookTarget = dummy.position.clone();
      lookTarget.add(particle.velocity);

      dummy.lookAt(lookTarget);
      dummy.updateMatrix();
      // And apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={light} distance={30} intensity={5} color="#FFCC66"></pointLight>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereBufferGeometry attach="geometry" args={[0.5, 8, 8]} />
        <meshStandardMaterial attach="material" wireframe="true" color="green" />
      </instancedMesh>
    </>
  );
}
