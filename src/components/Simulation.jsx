import { Box } from "@mui/material";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Sphere, OrbitControls } from "@react-three/drei";

export default function Simulation() {
    const sceneRef = useRef();

    return(
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '85vw', backgroundColor: '#2e2e2e'}}>
            <Canvas ref={sceneRef}>
                <SceneInit />
                <ambientLight />
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
    // hooks to for scene geometry
    const anchorRef = useRef();
    const rod1Ref = useRef();
    const rod2Ref = useRef();
    const sphere1Ref = useRef();
    const sphere2Ref = useRef();

    const rodGeometry = new THREE.CylinderGeometry(0.5, 0.5, 20);
    const rodMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    const sphereGeometry = new THREE.SphereGeometry(4,8,16); 
    const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    const anchorGeometry = new THREE.SphereGeometry(2,8,16);

    useEffect(() => {
        //add objects to scene
        const rod1 = new THREE.Mesh(rodGeometry, rodMaterial);
        const rod2 = new THREE.Mesh(rodGeometry, rodMaterial);
        const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const anchor1 = new THREE.Mesh(anchorGeometry, sphereMaterial);
        const anchor = new THREE.Vector3(0, -20/ 2, 0);
        const sphereOffset = new THREE.Vector3(0, 20, 0);
        const spherePos = anchor.clone().add(sphereOffset);
        
        const initialRotation = Math.PI / 4;


        rod1Ref.current = rod1;
        rod2Ref.current = rod2;
        sphere1Ref.current = sphere1;
        sphere2Ref.current = sphere2;
        anchorRef.current = anchor1;

        sphere1.position.copy(rod1.position);
        sphere2.position.set(0, -40, 0);
        anchor1.position.copy(anchor);

        //Set initial position for the rods
        rod1.position.copy(anchor);
        rod1.rotation.z = initialRotation;

        rod2.position.copy(sphere2.position);


        //Set initial velocity for the sphere
        sphere1.velocity = new THREE.Vector3(0, 0, 0);
        sphere2.velocity = new THREE.Vector3(0, 0, 0);

        //Add objects to scene
        scene.add(rod1, rod2, sphere1, sphere2, anchor1);

        //Cleanup function to remove objects from scene
        return () => {
            scene.remove(rod1, rod2, sphere1, sphere2, anchor1);
        }
    }, [scene])

    useFrame(() => {
        //Constants for pendulum
        const gravity = 9.81;
        const rodLength1 = 20;
        const rodLength2 = 20;
        const mass1 = 1;
        const mass2 = 1;
        const anchor = new THREE.Vector3(0, rodLength1, 0);
        const distanceClamp = new THREE.Vector3(0, 20, 0);
        
        const rod1 = rod1Ref.current;
        const rod2 = rod2Ref.current;
        const sphere1 = sphere1Ref.current;
        const sphere2 = sphere2Ref.current;

        const rodOffset1 = new THREE.Vector3(0, 10, 0);
        const rodOffset2 = new THREE.Vector3(0, 10, 0); 

        //Update sphere position to maintain constraint
        const sphereToAnchor = sphere1.position.clone().sub(anchor);
        const currentDistance = sphereToAnchor.length();
        const correction = distanceClamp.clone().sub(sphereToAnchor).multiplyScalar(0.01);
        sphere1.position.add(correction);

        //Get current position of spheres
        const position1 = sphere1Ref.current.position;
        const position2 = sphere2Ref.current.position;

        //Calculate angular acceleration
        const angle1 = Math.atan2(position1.y, position1.x);
        const angle2 = Math.atan2(position2.y, position2.x);

        const velocity1 = sphere1Ref.current.velocity;
        const velocity2 = sphere2Ref.current.velocity;
        // const velocity1 = { x: 0, y: 0, z: 0 };
        // const velocity2 = { x: 0, y: 0, z: 0 };

        const acceleration1 = new THREE.Vector3(0,0,0);
        const acceleration2 = new THREE.Vector3(0,0,0);
        // const acceleration1 = { x: 0, y: 0, z: 0};
        // const acceleration2 = { x: 0, y: 0, z: 0};

        const denominator1 = rodLength1 * (mass1 + mass2 * Math.sin(angle1 - angle2) ** 2);
        const denominator2 = rodLength2 * (2 * mass1 + mass2 - mass2 * Math.cos(2 * angle1 - 2 * angle2));

        //This is probably broken
        // acceleration1.x = (-gravity * (2 * mass1 + mass2) * Math.sin(angle1) - mass2 * gravity * Math.sin(angle1 - 2 * angle2) - 2 * Math.sin(angle1 - angle2) * mass2 * (velocity2.x ** 2 * rodLength2 + velocity1.x ** 2 * rodLength1 * Math.cos(angle1 - angle2))) / (rodLength1 * denominator1);
        // acceleration1.y = (2 * Math.sin(angle1 - angle2) * (velocity1.x ** 2 * rodLength1 * (mass1 + mass2) + gravity * (mass1 + mass2) * Math.cos(angle1) + velocity2.x ** 2 * rodLength2 * mass2 * Math.cos(angle1 - angle2))) / (rodLength1 * denominator1);
        // acceleration2.x = (2 * Math.sin(angle1 - angle2) * (velocity1.x ** 2 * rodLength1 * (mass1 + mass2) + gravity * (mass1 + mass2) * Math.cos(angle1) + velocity2.x ** 2 * rodLength2 * mass2 * Math.cos(angle1 - angle2))) / (rodLength2 * denominator2);
        // acceleration2.y = (2 * mass2 * Math.sin(angle1 - angle2) * (velocity2.x ** 2 * rodLength2 * (mass1 + mass2) + gravity * (mass1 + mass2) * Math.cos(angle1) + velocity1.x ** 2 * rodLength1 * mass1 * Math.cos(angle1 - angle2))) / (rodLength2 * denominator2);
        // acceleration1.z = 0;
        // acceleration2.z = 0;


        //Update velocity
        // velocity1.x += acceleration1.x * 0.1;
        // velocity1.y += acceleration1.y * 0.1;
        // velocity2.x += acceleration2.x * 0.1;
        // velocity2.y += acceleration2.y * 0.1;

        //Update position
        // position1.x += velocity1.x;
        // position1.y += velocity1.y;
        // position2.x += velocity2.x;
        // position2.y += velocity2.y;

        // Broken doesnt work
        // position1.x = rodLength1 * Math.sin(angle1);
        // position1.y = rodLength1 * Math.cos(angle1);
        // position2.x = position1.x + rodLength2 * Math.sin(angle2);
        // position2.y = position1.y + rodLength2 * Math.cos(angle2);

        //Update rod position
        // rod1Ref.current.position.copy(rodOffset1);
        // rod2Ref.current.position.copy(rodOffset2.add(position2));

        //Update sphere velocity
        sphere1Ref.current.velocity.copy(velocity1);
        sphere2Ref.current.velocity.copy(velocity2);

    });

}