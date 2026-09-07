import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Moon() {
  const { scene } = useGLTF("/moon.glb");
  const ref = useRef();

  const normalized = useMemo(() => {
    const clone = scene.clone();

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    clone.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    // Generous clean scale
    const scale = 3.4 / (maxDim || 1);
    clone.scale.setScalar(scale);

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });

  return <primitive ref={ref} object={normalized} />;
}

export default function MoonModel() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 2, 5]} intensity={2.0} />
      <directionalLight position={[-3, -1, -2]} intensity={0.4} />
      <Suspense fallback={null}>
        <Moon />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/moon.glb");
