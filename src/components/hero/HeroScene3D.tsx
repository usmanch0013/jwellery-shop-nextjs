"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8D5A8";

function GoldMat({ roughness = 0.14 }: { roughness?: number }) {
  return (
    <meshStandardMaterial
      color={GOLD}
      metalness={1}
      roughness={roughness}
      envMapIntensity={1.4}
    />
  );
}

function Gem({
  position,
  scale = 1,
  color = "#ffffff",
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <mesh position={position} scale={scale}>
      <octahedronGeometry args={[0.11, 0]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.05}
        roughness={0.02}
        transmission={0.9}
        thickness={0.8}
        ior={2.17}
        clearcoat={1}
        envMapIntensity={2.2}
      />
    </mesh>
  );
}

function BraceletModel() {
  const gems = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const r = 1.18;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * 0.28,
      z: Math.sin(angle) * r * 0.55,
    };
  });

  return (
    <group rotation={[0.35, 0.6, 0.15]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.13, 48, 128]} />
        <GoldMat />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.45, 0.2]} position={[0, 0.06, 0]}>
        <torusGeometry args={[1.02, 0.08, 48, 128]} />
        <GoldMat roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, -0.3, 0]} position={[0, -0.04, 0]}>
        <torusGeometry args={[1.28, 0.025, 32, 100]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          metalness={1}
          roughness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
      {gems.map((g, i) => (
        <Gem
          key={i}
          position={[g.x, g.y, g.z]}
          scale={i % 3 === 0 ? 1.15 : 0.85}
          color={i % 4 === 0 ? "#A8B9A6" : "#ffffff"}
        />
      ))}
      <group position={[0, -0.15, 1.12]} rotation={[0.5, 0, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <torusGeometry args={[0.08, 0.015, 16, 48]} />
          <GoldMat roughness={0.12} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshPhysicalMaterial
            color="#C98F96"
            metalness={0.1}
            roughness={0.05}
            transmission={0.75}
            thickness={0.6}
            ior={1.9}
            envMapIntensity={2}
          />
        </mesh>
        <mesh position={[0.14, -0.22, 0.04]} scale={0.7}>
          <sphereGeometry args={[0.06, 20, 20]} />
          <meshStandardMaterial color="#F7F3EA" metalness={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[-0.13, -0.24, -0.03]} scale={0.65}>
          <sphereGeometry args={[0.06, 20, 20]} />
          <meshStandardMaterial color="#F7F3EA" metalness={0.35} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function FixedBracelet({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const scroll = scrollRef.current;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      -scroll * 0.6,
      delta * 3
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.15}>
      <BraceletModel />
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.4} color="#F7F3EA" />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#C9A96E" />
      <directionalLight position={[-5, 3, 4]} intensity={0.55} color="#A8B9A6" />
      <pointLight position={[2, 2, 3]} intensity={0.9} color="#ffffff" />
      <spotLight
        position={[0, 6, 2]}
        angle={0.45}
        penumbra={0.8}
        intensity={1.3}
        color="#E8D5A8"
      />
    </>
  );
}

interface HeroScene3DProps {
  scrollProgress: number;
}

export default function HeroScene3D({ scrollProgress }: HeroScene3DProps) {
  return (
    <div className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        className="!absolute inset-0"
      >
        <Suspense fallback={null}>
          <SceneLights />
          <Environment preset="studio" />
          <FixedBracelet scrollProgress={scrollProgress} />
          <Sparkles
            count={50}
            scale={[9, 7, 4]}
            size={2.2}
            speed={0.2}
            color="#C9A96E"
            opacity={0.4}
          />
          <Sparkles
            count={25}
            scale={[7, 5, 3]}
            size={1}
            speed={0.12}
            color="#ffffff"
            opacity={0.3}
          />
          <OrbitControls
            target={[0, 0, 0]}
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.65}
            autoRotate
            autoRotateSpeed={0.9}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI - 0.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
