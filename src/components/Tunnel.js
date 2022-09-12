import React, { useRef,useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
// import { useStore } from "../utils/store"
import Three from './ThreeJS'
import TunnelModel from './TunnelModel'

export default function Tunnel(props) {
  let step = 0;
  
  // console.log(mat);
  useFrame((state, delta) => {
    if(step < 9){
      step++;
    }
    else{
      step = 0;
    }
    // console.log(step);
    // console.log(g_uniforms.y_amp.value);
  })
  // console.log(mat.current.material);
  const steps = [0,1,2,3,4,5,6,7,8,9];
      
  return (
    steps.map((s,i)=>{
      return <TunnelModel position={[i*0.5,0,0]} active={i===step?1:0} />
    })
  )
}

// useGLTF.preload('/sphere.gltf')
