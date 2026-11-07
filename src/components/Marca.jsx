import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

// Logotipo del sitio: insignia roja + nombre. `claro` lo adapta a fondos oscuros.
export default function Marca({ claro = false, subtitulo = 'Línea de emergencias 119' }) {
  return (
    <Link to="/" className={`marca ${claro ? 'marca--claro' : ''}`} aria-label="Bomberos Cali, Línea 119 - inicio">
      <span className="marca__insignia" aria-hidden="true">
        <Flame size={20} strokeWidth={2.4} />
      </span>
      <span className="marca__texto">
        <span className="marca__nombre">Bomberos Cali</span>
        <span className="marca__sub">{subtitulo}</span>
      </span>
    </Link>
  );
}
