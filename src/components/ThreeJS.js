import React, { useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, softShadows } from "@react-three/drei"
import { useStore } from "../utils/store"
import Tunnel from './Tunnel'

const Three = (props) => {
    useEffect(() => {
        console.log("three props loaded")
    }, [props.loaded])
    return (
        <Canvas 
            camera={{ position: [-1, 0, 0], fov: 50 }}
        >
            {/* <color attach="background" args={["#EEEFF0"]} /> */}
            <fog attach="fog" color="#EEEFF0" near={1} far={5} />
            <ambientLight intensity={0.5} />
            
            <Suspense fallback={null}>
                <Environment files={"SoftLightsStudio2.hdr"} opacity={1} path={"/hdri/"} />
                <mesh 
                castShadow
                receiveShadow
                position={[0,0,0]}
                >
                    <sphereGeometry attach="geometry" args={[0.1, 128, 128]} />
                    <meshStandardMaterial 
                        attach="material"
                        color={"#444444"}
                        metalness={0.0}
                        roughness={0.3}
                        castShadow
                        // flatShading={true}
                    />
                    </mesh>
                <OrbitControls enableZoom={true} />
                {/* <Ground /> */}
            </Suspense>
        </Canvas>
    )
}

export default Three