import { Box } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Sphere, OrbitControls } from "@react-three/drei";

export default function Simulation() {
    const sceneRef = useRef();
    


    return(
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '85vw', backgroundColor: '#2e2e2e'}}>
            <Canvas ref={sceneRef}>
                <SceneInit />
                <ambientLight />
                <Sphere args={[39,16,16]}/>
                <OrbitControls />
            </Canvas>
        </Box>
    )
}

function SceneInit() {
    const { scene, gl, camera } = useThree();
    scene.background = "black";
    
    //gl.setClearColor(0x000000, 0.0);
    camera.position.z = 100;
  }