import { Link } from 'react-router-dom';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import { COLOR_ESTADO, formatoFechaHora } from '../data/estados';
import HistorialEstados from './HistorialEstados';

const MENSAJE_ESTADO = {
  Recibido: 'Tu reporte llegó a la central. Un radio operador lo está revisando.',
  Validado: 'Un radio operador confirmó tu reporte y está asignando una unidad.',
  'Unidad despachada': 'Una unidad va en camino. Mantente en un lugar seguro.',
  Cerrado: 'La atención de esta emergencia finalizó. Gracias por reportar.',
  Descartado: 'El reporte fue descartado (duplicado o no corresponde a una emergencia).',
};

// Respuesta automática: radicado, hora y estado del reporte en tiempo real.
export default function ConfirmacionReporte({ reporte, onNuevoReporte }) {
  if (!reporte) {
    return (
      <div className="reportar-card">
        <h2 className="success-title">Reporte no encontrado</h2>
        <p className="text-secondary">Es posible que los reportes se hayan borrado.</p>
        <button type="button" className="btn-submit mt-1" onClick={onNuevoReporte}>
          Hacer un nuevo reporte
        </button>
      </div>
    );
  }

  const grupo = GRUPOS.find((g) => g.codigo === reporte.grupo);

  return (
    <div className="reportar-card" aria-live="polite">
      <h2 className="success-title">¡Reporte recibido!</h2>
      <p className="text-secondary">
        Esta es una respuesta automática. No cierres esta página: aquí verás cómo avanza tu reporte.
      </p>

      <div className="details-box">
        <p>
          <strong>Número de radicado:</strong> <span className="radicado">{reporte.radicado}</span>
        </p>
        <p>
          <strong>Hora del reporte:</strong> {formatoFechaHora(reporte.fecha)}
        </p>
        <p>
          <strong>Tipo:</strong>{' '}
          <span style={{ color: colorDeGrupo(reporte.grupo), fontWeight: 700 }}>
            {reporte.grupo} · {grupo?.nombre}
          </span>
        </p>
        <p className="estado-actual">
          <strong>Estado actual:</strong>{' '}
          <span className="estado-chip" style={{ background: COLOR_ESTADO[reporte.estado] }}>
            {reporte.estado}
          </span>
        </p>
        <p className="text-secondary">{MENSAJE_ESTADO[reporte.estado]}</p>
        {reporte.unidadDespachada && (
          <p>
            <strong>Unidad asignada:</strong> {reporte.unidadDespachada}
          </p>
        )}

        {reporte.requiereInfo && (
          <div className="alert-info" role="alert">
            El radio operador solicitó más información. Esté atento a su teléfono ({reporte.telefono}).
          </div>
        )}
      </div>

      <h3 className="historial-titulo">Seguimiento</h3>
      <HistorialEstados historial={reporte.historial} />

      <div className="confirmacion-acciones">
        <button type="button" className="btn-submit" onClick={onNuevoReporte}>
          Hacer otro reporte
        </button>
        <Link to="/" className="btn-link">Volver al inicio</Link>
      </div>
    </div>
  );
}
