import { MessageSquare } from 'lucide-react';
import { colorDeGrupo } from '../data/grupos';
import { iconoDeGrupo } from '../data/gruposInfo';
import { COLOR_ESTADO, formatoHora } from '../data/estados';

// Fila de la lista del operador: color y código del grupo, hora, barrio y estado.
export default function ReporteItem({ reporte, activo, onSeleccionar }) {
  const inactivo = reporte.estado === 'Cerrado' || reporte.estado === 'Descartado';
  const color = colorDeGrupo(reporte.grupo);
  const Icono = iconoDeGrupo(reporte.grupo);
  return (
    <li>
      <button
        type="button"
        className={`ops-item ${activo ? 'ops-item--activo' : ''} ${inactivo ? 'ops-item--inactivo' : ''}`}
        onClick={() => onSeleccionar(reporte.id)}
        aria-pressed={activo}
        style={{ '--grupo': color }}
      >
        <span className="ops-item__icono"><Icono size={16} /></span>
        <span className="ops-item__info">
          <span className="ops-item__fila">
            <span className="ops-item__codigo mono">{reporte.grupo}</span>
            <span className="ops-item__barrio">{reporte.barrio}</span>
          </span>
          <span className="ops-item__meta mono">
            {formatoHora(reporte.fecha)} · {reporte.radicado ?? 's/r'}
            {reporte.requiereInfo && !inactivo && (
              <MessageSquare size={12} className="ops-item__info-icono" aria-label="Información solicitada" />
            )}
          </span>
        </span>
        <span className="ops-estado" style={{ '--estado': COLOR_ESTADO[reporte.estado] }}>
          <span className="chip__dot" /> {reporte.estado}
        </span>
      </button>
    </li>
  );
}
