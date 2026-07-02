// @ts-nocheck
"use client";

import { useRef, useMemo } from 'react';
// @ts-ignore - Canvas is exported but TS in the beta package fails to resolve it
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Dumbbell() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const goldMaterial = useMemo(() => ({
    color: '#c9a84c',
    metalness: 0.9,
    roughness: 0.15,
    envMapIntensity: 1.5,
  }), []);

  const darkMaterial = useMemo(() => ({
    color: '#1a1a2e',
    metalness: 0.7,
    roughness: 0.3,
    envMapIntensity: 1,
  }), []);

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} scale={1.2}>
        {/* Bar */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3, 32]} />
          <meshStandardMaterial {...darkMaterial} />
        </mesh>
        {/* Grip texture */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Left plates */}
        {[-1.2, -1.4].map((x, i) => (
          <mesh key={`l${i}`} position={[0, x, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.5 - i * 0.05, 0.5 - i * 0.05, 0.12, 32]} />
            <meshStandardMaterial {...goldMaterial} />
          </mesh>
        ))}
        {/* Right plates */}
        {[1.2, 1.4].map((x, i) => (
          <mesh key={`r${i}`} position={[0, x, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.5 - i * 0.05, 0.5 - i * 0.05, 0.12, 32]} />
            <meshStandardMaterial {...goldMaterial} />
          </mesh>
        ))}
        {/* Collars */}
        {[-1.05, 1.05].map((x, i) => (
          <mesh key={`c${i}`} position={[0, x, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshStandardMaterial {...darkMaterial} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#c9a84c" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function GlowOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime) * 0.05);
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <sphereGeometry args={[2, 32, 32]} />
      <MeshDistortMaterial
        color="#c9a84c"
        transparent
        opacity={0.04}
        distort={0.3}
        speed={2}
        roughness={0.2}
      />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#c9a84c" />
        <directionalLight position={[-3, -2, 2]} intensity={0.3} color="#4dd8e0" />
        <pointLight position={[0, 3, 3]} intensity={0.5} color="#c9a84c" />
        {/* <Environment preset="city" /> - Removed to prevent fetch errors */}
        <Dumbbell />
        <ParticleField />
        <GlowOrb />
      </Canvas>
    </div>
  );
}
