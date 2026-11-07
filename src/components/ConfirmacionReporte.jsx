import { Link } from 'react-router-dom';
import { CircleCheck, CircleX, Phone, Info, Check, Truck, ShieldCheck, Inbox, Flag } from 'lucide-react';
import { GRUPOS } from '../data/grupos';
import { iconoDeGrupo } from '../data/gruposInfo';
import { formatoFechaHora } from '../data/estados';
import HistorialEstados from './HistorialEstados';

const ETAPAS = [
  { estado: 'Recibido', Icono: Inbox },
  { estado: 'Validado', Icono: ShieldCheck },
  { estado: 'Unidad despachada', Icono: Truck },
  { estado: 'Cerrado', Icono: Flag },
];

const MENSAJE_ESTADO = {
  Recibido: 'Tu reporte llegó al centro de despacho. Un radio operador lo está revisando.',
  Validado: 'Un radio operador confirmó tu reporte y está asignando una unidad.',
  'Unidad despachada': 'Una unidad va en camino. Mantente en un lugar seguro.',
  Cerrado: 'La atención de esta emergencia finalizó. Gracias por reportar.',
  Descartado: 'El reporte fue descartado por ser un duplicado o no corresponder a una emergencia.',
};

// Respuesta automática: radicado, hora y estado del reporte en tiempo real (tipo seguimiento de pedido).
export default function ConfirmacionReporte({ reporte, onNuevoReporte }) {
  if (!reporte) {
    return (
      <div className="confirmacion">
        <div className="confirmacion__tarjeta confirmacion__tarjeta--centro">
          <h1 className="confirmacion__titulo">No encontramos tu reporte</h1>
          <p className="texto-muted">Es posible que los reportes se hayan borrado del tablero.</p>
          <button type="button" className="btn btn--primary btn--lg" onClick={onNuevoReporte}>
            Hacer un nuevo reporte
          </button>
        </div>
      </div>
    );
  }

  const grupo = GRUPOS.find((g) => g.codigo === reporte.grupo);
  const IconoGrupo = iconoDeGrupo(reporte.grupo);
  const descartado = reporte.estado === 'Descartado';
  const indiceActual = ETAPAS.findIndex((e) => e.estado === reporte.estado);

  return (
    <div className="confirmacion" aria-live="polite">
      <div className="confirmacion__tarjeta">
        <div className="confirmacion__cabecera">
          <span className={`confirmacion__sello ${descartado ? 'confirmacion__sello--gris' : ''}`}>
            {descartado ? <CircleX size={28} /> : <CircleCheck size={28} />}
          </span>
          <div>
            <h1 className="confirmacion__titulo">
              {descartado ? 'Reporte descartado' : 'Recibimos tu reporte'}
            </h1>
            <p className="texto-muted">Respuesta automática · no cierres esta página para ver el avance.</p>
          </div>
        </div>

        <div className="confirmacion__radicado">
          <div>
            <span className="confirmacion__etiqueta">Número de radicado</span>
            <span className="confirmacion__numero mono">{reporte.radicado}</span>
          </div>
          <div>
            <span className="confirmacion__etiqueta">Hora del reporte</span>
            <span className="confirmacion__valor">{formatoFechaHora(reporte.fecha)}</span>
          </div>
          <div>
            <span className="confirmacion__etiqueta">Tipo</span>
            <span className="confirmacion__valor" style={{ color: grupo?.color }}>
              <IconoGrupo size={16} /> {reporte.grupo} · {grupo?.nombre}
            </span>
          </div>
        </div>

        {/* Seguimiento visual del estado */}
        {!descartado ? (
          <ol className="seguimiento" aria-label={`Estado actual: ${reporte.estado}`}>
            {ETAPAS.map(({ estado, Icono }, i) => {
              const clase = i < indiceActual ? 'hecho' : i === indiceActual ? 'actual' : 'pendiente';
              return (
                <li key={estado} className={`seguimiento__etapa seguimiento__etapa--${clase}`}>
                  <span className="seguimiento__icono">
                    {i < indiceActual ? <Check size={16} strokeWidth={3} /> : <Icono size={16} />}
                  </span>
                  <span className="seguimiento__texto">{estado}</span>
                </li>
              );
            })}
          </ol>
        ) : null}

        <div className={`confirmacion__mensaje ${descartado ? 'confirmacion__mensaje--gris' : ''}`}>
          <Info size={18} />
          <div>
            <strong>{reporte.estado}</strong>
            <p>{MENSAJE_ESTADO[reporte.estado]}</p>
            {reporte.unidadDespachada && (
              <p>Unidad asignada: <strong>{reporte.unidadDespachada}</strong></p>
            )}
          </div>
        </div>

        {reporte.requiereInfo && !['Cerrado', 'Descartado'].includes(reporte.estado) && (
          <div className="confirmacion__alerta" role="alert">
            <Phone size={18} />
            <p>
              <strong>El radio operador necesita más información.</strong> Mantén tu teléfono
              (<span className="mono">{reporte.telefono}</span>) a la mano: te van a llamar.
            </p>
          </div>
        )}

        <div className="confirmacion__historial">
          <h2>Historial</h2>
          <HistorialEstados historial={reporte.historial} />
        </div>

        <div className="confirmacion__acciones">
          <Link to="/" className="btn btn--secondary">Volver al inicio</Link>
          <button type="button" className="btn btn--primary" onClick={onNuevoReporte}>
            Hacer otro reporte
          </button>
        </div>
      </div>
    </div>
  );
}
