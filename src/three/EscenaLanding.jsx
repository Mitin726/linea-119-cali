// src/three/EscenaLanding.jsx
// Botón de emergencia 119: gira y flota (useFrame), se ilumina al pasar el mouse
// (onPointerOver) y al hacer clic (onClick) se hunde y activa una alarma con luces
// rojas que parpadean, como el llamado que recibe el radio operador.
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

const ROJO = '#dc2626';

export default function EscenaLanding() {
  const groupRef = useRef();
  const botonRef = useRef();
  const materialRef = useRef();
  const luzRef = useRef();
  const anilloRef = useRef();
  const [hovered, setHover] = useState(false);
  const [alarma, setAlarma] = useState(false);

  // Cursor de mano mientras el mouse está sobre el botón.
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Rotación constante (más rápida con la alarma activa).
    if (groupRef.current) groupRef.current.rotation.y += delta * (alarma ? 1.6 : 0.5);

    // El botón se hunde suavemente cuando la alarma está activa.
    if (botonRef.current) {
      const objetivo = alarma ? -0.2 : 0;
      botonRef.current.position.y += (objetivo - botonRef.current.position.y) * 0.15;
    }

    // Parpadeo del botón y de la luz roja cuando suena la alarma.
    const parpadeo = alarma ? (Math.sin(t * 10) + 1) / 2 : 0;
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = alarma ? 0.3 + parpadeo * 1.2 : hovered ? 0.5 : 0;
    }
    if (luzRef.current) luzRef.current.intensity = alarma ? parpadeo * 25 : 0;

    // Onda expansiva alrededor del botón.
    if (anilloRef.current) {
      const fase = (t * 0.8) % 1;
      const escala = alarma ? 1 + fase * 1.2 : 1;
      anilloRef.current.scale.set(escala, escala, 1);
      anilloRef.current.material.opacity = alarma ? 1 - fase : 0;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group
        ref={groupRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          setAlarma((a) => !a);
        }}
        scale={hovered ? 1.15 : 1}
      >
        {/* Base metálica */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 0.5, 48]} />
          <meshStandardMaterial color="#1e1e1e" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Franja amarilla de advertencia */}
        <mesh position={[0, -0.24, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.06, 48]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>

        {/* Botón rojo */}
        <mesh ref={botonRef}>
          <cylinderGeometry args={[1, 1, 0.8, 48]} />
          <meshStandardMaterial
            ref={materialRef}
            color={hovered || alarma ? '#ff1f1f' : ROJO}
            emissive="#ff0000"
            emissiveIntensity={0}
            roughness={0.15}
          />
        </mesh>

        {/* Onda de alarma */}
        <mesh ref={anilloRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.7, 64]} />
          <meshBasicMaterial color={ROJO} transparent opacity={0} />
        </mesh>

        {/* Luz que parpadea con la alarma */}
        <pointLight ref={luzRef} position={[0, 1.2, 0]} color="#ff2a2a" intensity={0} distance={6} />
      </group>
    </Float>
  );
}
