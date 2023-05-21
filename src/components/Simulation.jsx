import { Box } from "@mui/material";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Sphere, OrbitControls } from "@react-three/drei";

export default function Simulation() {
  const sceneRef = useRef();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "85vw",
        backgroundColor: "#2e2e2e",
      }}
    >
      <Canvas ref={sceneRef}>
        <SceneInit />
        <ambientLight />
        <OrbitControls />
      </Canvas>
    </Box>
  );
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
  const rodMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sphereGeometry = new THREE.SphereGeometry(4, 8, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const anchorGeometry = new THREE.SphereGeometry(2, 8, 16);

  //Move origin point of rod to end
  rodGeometry.translate(0, 10, 0);

  useEffect(() => {
    //Create meshes & offsets
    const rod1 = new THREE.Mesh(rodGeometry, rodMaterial);
    const rod2 = new THREE.Mesh(rodGeometry, rodMaterial);
    const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const anchor1 = new THREE.Mesh(anchorGeometry, sphereMaterial);
    const rodOffset = new THREE.Vector3(0, 20, 0);
    const initialRotation = Math.PI / 4;

    //Save references to objects
    rod1Ref.current = rod1;
    rod2Ref.current = rod2;
    sphere1Ref.current = sphere1;
    sphere2Ref.current = sphere2;

    //Set initial positions
    rod1.position.set(0, 0, 0);
    rod1.rotation.z = initialRotation;
    sphere1.position.copy(rod1.position.clone().add(rodOffset));

    //unused
    rod2.position.set(0, -100, 0);
    sphere2.position.set(0, -110, 0);

    //Add objects to scene
    scene.add(rod1, rod2, sphere1, sphere2, anchor1);

    //Cleanup function to remove objects from scene
    return () => {
      scene.remove(rod1, rod2, sphere1, sphere2, anchor1);
    };
  }, [scene]);

  useFrame(() => {
    // Constants
    const gravity = 9.8;
    const damping = 0.98; // Arbitrary damping to simulate friction
    const angularDamping = .999; // Adjust the angular damping value (between 0 and 1) to control the angular dampening effect

    // Get positions and rotations of objects
    const rod1Position = rod1Ref.current.position;
    const rod1Rotation = rod1Ref.current.rotation;
    const sphere1 = sphere1Ref.current;

    // Calculate forces
    const force = new THREE.Vector3(0, -gravity, 0); // Invert the gravity force since the Y-axis is inverted in three.js

    // Update sphere position
    const rodLength = 20; // Length of the rod (you can adjust this based on your actual rod length)
    const rodEndPosition = new THREE.Vector3(0, rodLength, 0);
    rodEndPosition.applyMatrix4(rod1Ref.current.matrixWorld); // Apply the world matrix to get the global position of the rod end
    sphere1.position.copy(rodEndPosition);

    // Apply forces to the sphere
    const timeDelta = 1 / 60; // Assuming 60 frames per second (adjust as needed)
    const acceleration = force.clone().multiplyScalar(timeDelta);
    sphere1.userData.velocity ||= new THREE.Vector3(); // Create a velocity vector if it doesn't exist yet
    sphere1.userData.velocity.add(acceleration);
    sphere1.userData.velocity.multiplyScalar(damping); // Apply dampening to the velocity

    // Calculate angular acceleration
  const rodOffset = new THREE.Vector3(0, 20, 0); // Offset from the rod's origin to the sphere
  const rotatedOffset = rodOffset.clone().applyEuler(rod1Rotation);
  const spherePosition = rod1Position.clone().add(rotatedOffset);

  const sphereToRodEnd = spherePosition.clone().sub(rodEndPosition);
  const tensionForce = sphereToRodEnd.clone().multiplyScalar(0.1); // Adjust the tension force value as needed

  const angularForce = new THREE.Vector3(0, 0, 0.5); // Adjust the values to apply the desired rotational force

  const angularAcceleration = angularForce
    .clone()
    .add(tensionForce)
    .multiplyScalar(timeDelta);

  // Apply angular acceleration to the rod's rotation
  rod1Ref.current.rotation.z += angularAcceleration.z;
  rod1Ref.current.rotation.z *= angularDamping; // Apply angular dampening to gradually stop the rotation

  // Update sphere position to maintain constraint
  sphere1.position.copy(spherePosition);

  // Apply velocity to position
  sphere1.position.add(sphere1.userData.velocity);
  });
}
