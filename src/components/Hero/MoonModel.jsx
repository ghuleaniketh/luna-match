import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function useNormalizedGLTF(path, targetSize) {
  const { scene } = useGLTF(path);
  return useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    clone.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = targetSize / (maxDim || 1);
    clone.scale.setScalar(scale);

    return clone;
  }, [scene, targetSize]);
}

function Moon({ autoRotate = true }) {
  const normalized = useNormalizedGLTF("/moon.glb", 1.5);
  const ref = useRef();

  useFrame((_, delta) => {
    if (autoRotate && ref.current) ref.current.rotation.y += delta * 0.15;
  });

  return <primitive ref={ref} object={normalized} />;
}

function OrbitingSatellite() {
  const normalized = useNormalizedGLTF("/satellite.glb", 0.27);
  const groupRef = useRef();
  const angleRef = useRef(0);

  const orbitRadius = 0.95;
  const orbitTiltY = 0.12;

  useFrame((_, delta) => {
    angleRef.current += delta * 0.5;
    const angle = angleRef.current;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = Math.sin(angle * 0.5) * orbitTiltY;
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalized} />
    </group>
  );
}

export default function MoonModel({ autoRotate = true }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 36 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 2, 5]} intensity={2.0} />
      <directionalLight position={[-3, -1, -2]} intensity={0.4} />
      <Suspense fallback={null}>
        <Moon autoRotate={autoRotate} />
        <OrbitingSatellite />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/moon.glb");
useGLTF.preload("/satellite.glb");
