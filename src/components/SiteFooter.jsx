import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import Marca from './Marca';
import './SiteLayout.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <Marca claro />

        <nav className="site-footer__nav" aria-label="Pie de página">
          <Link to="/reportar">Reportar</Link>
          <a href="tel:119">Llamar al 119</a>
          <a href="/#preguntas">Preguntas</a>
          <Link to="/operador" className="site-footer__operador">
            <Radio size={15} /> Acceso radio operador
          </Link>
        </nav>
      </div>

      <div className="container site-footer__legal">
        Prototipo académico · Desarrollo Web 2026-2 · Juan Martín Carvajal
      </div>
    </footer>
  );
}
