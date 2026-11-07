import { Link } from 'react-router-dom';
import { Phone, Siren } from 'lucide-react';
import Marca from './Marca';
import './SiteLayout.css';

// Encabezado del sitio ciudadano. `compacto` oculta la navegación (pantalla de reporte).
export default function SiteHeader({ compacto = false }) {
  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__inner">
          <span className="topbar__item">
            <span className="topbar__pulso" aria-hidden="true" /> Atención 24/7 · Santiago de Cali
          </span>
          <span className="topbar__item topbar__item--fin">Prototipo académico · datos ficticios</span>
        </div>
      </div>

      <div className="container site-header__inner">
        <Marca />

        {!compacto && (
          <nav className="site-nav" aria-label="Secciones">
            <a href="/#como-funciona">Cómo funciona</a>
            <a href="/#grupos">Tipos de emergencia</a>
            <a href="/#seguridad">Mientras llega la ayuda</a>
            <a href="/#preguntas">Preguntas</a>
          </nav>
        )}

        <div className="site-header__acciones">
          <a href="tel:119" className="btn btn--secondary">
            <Phone size={16} /> <span>Llamar <span className="mono">119</span></span>
          </a>
          {!compacto && (
            <Link to="/reportar" className="btn btn--primary site-header__reportar">
              <Siren size={16} /> Reportar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
