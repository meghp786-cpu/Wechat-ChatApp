import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useChat } from '../context/ChatContext'

function Orb({ color, index, isHighSpeed, isDissolving }) {
    const meshRef = useRef()
    const { viewport, mouse } = useThree()

    // Physics state: personal offset and velocity
    const [offset, velocity] = useMemo(() => [
        new THREE.Vector3(Math.random() * 5 - 1, Math.random() * 5 - 1, Math.random() * 5 - 1),
        new THREE.Vector3()
    ], [])

    const targetPos = useMemo(() => new THREE.Vector3(), [])

    useFrame((state, delta) => {
        if (isDissolving) {
            // Rapid escape animation
            const escapeDirection = meshRef.current.position.clone().normalize();
            velocity.add(escapeDirection.multiplyScalar(delta * 200));
            meshRef.current.position.add(velocity);
            meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
            return;
        }

        // Target is mouse position + personal offset
        targetPos.set(
            (mouse.x * viewport.width) / 2 + offset.x,
            (mouse.y * viewport.height) / 2 + offset.y,
            offset.z
        )

        // Acceleration towards target - boosted if high speed
        const speedMult = isHighSpeed ? 2.5 : 0.3;
        const acceleration = targetPos.clone().sub(meshRef.current.position).multiplyScalar(speedMult)

        // Update velocity with friction
        velocity.add(acceleration.multiplyScalar(delta))
        velocity.multiplyScalar(isHighSpeed ? 0.98 : 0.1) // Less damping in high speed for more "chaos"

        // Update position
        meshRef.current.position.add(velocity)

        // Repulsion from center (slight bounce/jitter)
        const dist = meshRef.current.position.length()
        if (dist < 2) {
            meshRef.current.position.add(meshRef.current.position.clone().normalize().multiplyScalar(isHighSpeed ? 2 : 1))
        }

        meshRef.current.rotation.x += delta * (isHighSpeed ? 2 : 0.5)
        meshRef.current.rotation.y += delta * (isHighSpeed ? 2 : 0.2)
    })


    return (
        <Float speed={isHighSpeed ? 15 : 4} rotationIntensity={isHighSpeed ? 12 : 6} floatIntensity={isHighSpeed ? 20 : 9}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[index % 3 === 0 ? 5 : 3, 64, 64]} />
                <meshPhysicalMaterial
                    color={color}
                    roughness={isHighSpeed ? 0.2 : 8}
                    metalness={isHighSpeed ? 0.8 : 0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    emissive={color}
                    emissiveIntensity={isHighSpeed ? 1.5 : 0.2}
                />
            </mesh>
        </Float>
    )
}

const Scene = () => {
    const { orbColor, isHighSpeed, isDissolving } = useChat();

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#E8E3D5] pointer-events-none">
            <Canvas
                eventSource={document.body}
                camera={{ position: [0, 0, 50], fov: 75 }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#E8E3D5')
                }}
            >
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} />
                <Environment preset="city" />
                <Suspense fallback={null}>
                    {orbColor.map((color, i) => (
                        <Orb key={i} color={color} index={i} isHighSpeed={isHighSpeed} isDissolving={isDissolving} />
                    ))}
                </Suspense>

            </Canvas>
        </div>
    )
}

export default Scene
