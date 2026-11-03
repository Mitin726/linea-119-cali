// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import EscenaLanding from '../three/EscenaLanding';
import { GRUPOS } from '../data/grupos';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-container">
      {/* Sección Superior (Hero) */}
      <section className="hero-section">
        <h1 className="hero-title">Bomberos Cali 119</h1>
        <p className="hero-subtitle">¿Tienes una emergencia? Repórtala al instante.</p>
        
        {/* Escena 3D que no tape el botón[cite: 1] */}
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <Environment preset="city" />
            <EscenaLanding />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* Botones visibles sin scroll[cite: 1] */}
        <div className="action-buttons">
          <Link to="/reportar" className="btn-reportar">Reportar Emergencia</Link>
          <a href="tel:119" className="btn-llamar">Llamar al 119</a>
        </div>
      </section>

      {/* Sección de Grupos de Emergencia[cite: 1] */}
      <section className="groups-section">
        <h2 className="groups-title">Tipos de Emergencia</h2>
        <div className="groups-grid">
          {GRUPOS.map((grupo) => (
            <div key={grupo.codigo} className="group-card" style={{ borderTop: `4px solid ${grupo.color}` }}>
              <span className="group-code" style={{ color: grupo.color }}>{grupo.codigo}</span>
              <span className="group-name">{grupo.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer con enlace oculto al operador[cite: 1] */}
      <footer className="footer">
        <Link to="/operador" className="footer-link">Acceso Radio Operador</Link>
      </footer>
    </div>
  );
}