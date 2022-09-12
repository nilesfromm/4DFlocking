/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef, useEffect } from 'react'
import { Color, AdditiveBlending, DoubleSide } from 'three'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'

export default function TunnelModel({ ...props }) {
  // const {scene} = useThree()
  const fog = useThree((state) => state.scene.fog)
  const frameMaterial = useRef()
  const lightMaterial = useRef()
  const group = useRef()
  const { nodes, materials } = useGLTF('/tunnel.glb')
  useEffect(()=>{
    if(fog){
      console.log(fog);
    }
  })

  useFrame((state, delta) => {
    // frameMaterial.current.uTime += delta;
    // lightMaterial.current.uTime += delta;
  })
  //uLight="#FDF4DC" uShadow="#DCE5FD"
  //material={materials.lights} material-emissiveIntensity={1} material-emissive={new Color('#FDF4DC')} material-color={new Color('#DCE5FD')} material-opacity={(0.1 + (0.5 * props.active))} material-side={DoubleSide} material-transparent castShadow />
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh geometry={nodes.frame.geometry}>
        <frameMaterial 
          ref={frameMaterial} 
          uLight="#C4A585" 
          uShadow="#585D6D" 
          uActive={props.active} 
          uFogColor={fog?fog.color:null}
          uFogNear={fog?fog.near:null}
          uFogFar={fog?fog.far:null}
          side={DoubleSide}
        /> 
      </mesh>
      <mesh geometry={nodes.lights.geometry}>
        <lightMaterial 
          ref={lightMaterial} 
          uLight="#F1BD89"
          uShadow="#C0BFBF" 
          uActive={props.active} 
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </mesh> 
    </group>
  )
}

extend({
  // shaderMaterial creates a THREE.ShaderMaterial, and auto-creates uniform setter/getters
  // extend makes it available in JSX, in this case <portalMaterial />
  FrameMaterial2: shaderMaterial(
    { uTime: 0, uFogColor: new Color('hotpink'), uFogNear: 1, uFogFar: 3, uLight: new Color('hotpink'), uShadow: new Color('white'), uActive: 0, },
    glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
    }`,
    glsl`
    // #pragma glslify: cnoise3 = require(glsl-noise/classic/3d.glsl) 
    uniform float uTime;
    uniform vec3 uLight;
    uniform vec3 uShadow;
    uniform float uActive;
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;

    varying vec2 vUv;
    // vec3 fogColor = vec3(1.,0.,0.);
    // float fogNear = float(1.);
    // float fogFar = float(3.);

    void main() {
      // vec2 displacedUv = vUv + cnoise3(vec3(vUv * 1.0, uTime * 0.1));
      float strength = 1.; // + cnoise3(vec3(displacedUv * 1.0, uTime * 0.2));
      float outerGlow = distance(vUv.x, 0.5) * 4.0 - 1.;
      strength += outerGlow * uActive;
      // strength += step(-0.2, strength) * 0.8;
      // strength = clamp(strength, 0.0, 1.0);
      // vec3 color = mix(uLight, uShadow, strength);
      vec3 color = uShadow;
      gl_FragColor = vec4(color, 1.0);
        #ifdef USE_LOGDEPTHBUF_EXT
            float depth = gl_FragDepthEXT / gl_FragCoord.w;
        #else
            float depth = gl_FragCoord.z / gl_FragCoord.w;
        #endif
        float fogFactor = smoothstep( uFogNear, uFogFar, depth );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, uFogColor, fogFactor );
    }`,
  ),
  FrameMaterial: shaderMaterial(
    { uTime: 0, uLight: new Color('hotpink'), uShadow: new Color('white'), uActive: 0, },
    glsl`
    #include <fog_pars_vertex>
    varying vec2 vUv;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      vUv = uv;
      #include <begin_vertex>
      #include <project_vertex>
      #include <fog_vertex>
    }`,
    glsl`
    #include <fog_pars_fragment>
    #pragma glslify: cnoise3 = require(glsl-noise/classic/3d.glsl) 
    uniform float uTime;
    uniform vec3 uLight;
    uniform vec3 uShadow;
    uniform float uActive;
    varying vec2 vUv;
    void main() {
      vec2 displacedUv = vUv + cnoise3(vec3(vUv * 1.0, uTime * 0.1));
      float strength = 1.; // + cnoise3(vec3(displacedUv * 1.0, uTime * 0.2));
      float outerGlow = distance(vUv.x, 0.5) * 4.0 - 1.;
      strength += outerGlow * uActive;
      // strength += step(-0.2, strength) * 0.8;
      // strength = clamp(strength, 0.0, 1.0);
      vec3 color = mix(uLight, uShadow, strength);
      gl_FragColor = vec4(color, 1.0);
      #include <fog_fragment>
    }`,
  ),
  LightMaterial: shaderMaterial(
    { uTime: 0, uLight: new Color('hotpink'), uShadow: new Color('white'), uActive: 0 },
    glsl`
    varying vec2 vUv;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      vUv = uv;
    }`,
    glsl`
    #pragma glslify: cnoise3 = require(glsl-noise/classic/3d.glsl) 
    uniform float uTime;
    uniform vec3 uLight;
    uniform vec3 uShadow;
    uniform float uActive;
    varying vec2 vUv;
    void main() {
      vec2 displacedUv = vUv + cnoise3(vec3(vUv * 1.0, uTime * 0.1));
      float strength = 1.; // + cnoise3(vec3(displacedUv * 1.0, uTime * 0.2));
      float outerGlow = distance(vUv.x, 0.5) * 4.0 - 1.;
      strength += outerGlow * uActive;
      // strength += step(-0.2, strength) * 0.8;
      // strength = clamp(strength, 0.0, 1.0);
      vec3 color = mix(uLight, uShadow, strength);
      gl_FragColor = vec4(color, 0.3 + uActive);
    }`,
  ),
})

useGLTF.preload('/tunnel.glb')
