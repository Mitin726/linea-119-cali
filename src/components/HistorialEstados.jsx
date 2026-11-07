import { COLOR_ESTADO, formatoHora } from '../data/estados';

// Línea de tiempo con cada cambio de estado del reporte y su hora.
export default function HistorialEstados({ historial = [] }) {
  if (!historial.length) return null;
  return (
    <ol className="historial">
      {historial.map((h, i) => (
        <li key={`${h.estado}-${i}`} className="historial-item">
          <span className="historial-punto" style={{ background: COLOR_ESTADO[h.estado] }} />
          <span className="historial-estado">{h.estado}</span>
          <span className="historial-hora">{formatoHora(h.fecha)}</span>
        </li>
      ))}
    </ol>
  );
}
