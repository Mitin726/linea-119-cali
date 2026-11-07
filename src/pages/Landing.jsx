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
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">🚨</span>
          <span>Bomberos Cali <strong>- Canal 119</strong></span>
        </Link>
        <a href="tel:119" className="header-call">Llamar al 119</a>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">LÍNEA 119 · CANAL DIGITAL DE ATENCIÓN</p>
            <h1 className="hero-title">¿Tienes una emergencia?</h1>
            <p className="hero-subtitle">
              Conectamos tu reporte directamente con el radio operador. Envía fotos,
              videos y tu ubicación exacta en segundos para un despacho eficiente.
            </p>
            <div className="action-buttons">
              <Link to="/reportar" className="btn-reportar">Reportar Emergencia</Link>
              <a href="tel:119" className="btn-llamar">📞 Llamar al 119</a>
            </div>
            <div className="hero-note">
              <span className="status-dot" aria-hidden="true"></span>
              Disponible para reportes ciudadanos 24/7
            </div>
          </div>

          <div className="canvas-container" aria-label="Botón de emergencia 3D: haz clic para activar la alarma">
            <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <Environment preset="city" />
              <EscenaLanding />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </section>

        <section className="groups-section">
          <div className="section-heading">
            <p className="eyebrow eyebrow-dark">PROTOCOLO DE ATENCIÓN</p>
            <h2 className="groups-title">¿Qué tipo de incidentes puedes reportar?</h2>
            <p className="section-description">
              Selecciona la categoría que mejor describe tu emergencia para ayudarnos
              a activar la respuesta adecuada.
            </p>
          </div>
          <div className="groups-grid">
            {GRUPOS.map((grupo) => (
              <Link
                key={grupo.codigo}
                to={`/reportar?grupo=${grupo.codigo}`}
                className="group-card"
                style={{ borderTop: `4px solid ${grupo.color}` }}
              >
                <span className="group-code" style={{ color: grupo.color }}>{grupo.codigo}</span>
                <span className="group-name">{grupo.nombre}</span>
                <span className="card-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <p className="footer-brand">Bomberos Cali - Canal 119</p>
            <p className="footer-description">
              Prototipo de canal digital para el Benemérito Cuerpo de Bomberos
              Voluntarios de Cali - Proyecto de Desarrollo Web.
            </p>
          </div>
          <div className="footer-credits">
            <span>Desarrollado por Juan Martín Carvajal</span>
            <Link to="/operador" className="footer-link">Acceso Radio Operador</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}