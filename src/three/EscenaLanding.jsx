// src/three/EscenaLanding.jsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

export default function EscenaLanding() {
  const groupRef = useRef();
  const [hovered, setHover] = useState(false);

  // Animación con useFrame (rota constantemente)[cite: 1]
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group 
        ref={groupRef}
        // Interacción con el mouse[cite: 1]
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        {/* Base del botón */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.5, 32]} />
          <meshStandardMaterial color="#1E1E1E" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Botón rojo superior */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.8, 32]} />
          <meshStandardMaterial 
            color={hovered ? "#ff0000" : "#dc2626"} 
            emissive={hovered ? "#ff0000" : "#000000"}
            emissiveIntensity={hovered ? 0.5 : 0}
            roughness={0.1} 
          />
        </mesh>
      </group>
    </Float>
  );
}