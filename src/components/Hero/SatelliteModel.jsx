import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Satellite() {
  const { scene } = useGLTF("/satellite.glb");
  const normalized = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    clone.scale.setScalar(2.8 / (Math.max(size.x, size.y, size.z) || 1));

    return clone;
  }, [scene]);

  return <primitive object={normalized} />;
}

export default function SatelliteModel() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 3, 5]} intensity={2.5} />
      <directionalLight position={[-3, -1, -2]} intensity={0.8} />
      <Suspense fallback={null}>
        <Satellite />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/satellite.glb");
