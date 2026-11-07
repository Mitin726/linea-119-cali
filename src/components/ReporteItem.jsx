import { colorDeGrupo } from '../data/grupos';
import { COLOR_ESTADO, formatoHora } from '../data/estados';

// Fila de la lista del operador: color y código del grupo, hora, barrio y estado.
export default function ReporteItem({ reporte, activo, onSeleccionar }) {
  const inactivo = reporte.estado === 'Cerrado' || reporte.estado === 'Descartado';
  return (
    <li>
      <button
        type="button"
        className={`report-item ${activo ? 'active' : ''} ${inactivo ? 'report-item--inactivo' : ''}`}
        onClick={() => onSeleccionar(reporte.id)}
        aria-pressed={activo}
      >
        <span className="report-item-codigo" style={{ backgroundColor: colorDeGrupo(reporte.grupo) }}>
          {reporte.grupo}
        </span>
        <span className="report-item-info">
          <span className="report-item-title">{reporte.barrio}</span>
          <span className="report-item-time">
            {formatoHora(reporte.fecha)} · {reporte.radicado ?? 'sin radicado'}
            {reporte.requiereInfo && ' · info solicitada'}
          </span>
        </span>
        <span className="estado-badge" style={{ color: COLOR_ESTADO[reporte.estado], borderColor: COLOR_ESTADO[reporte.estado] }}>
          {reporte.estado}
        </span>
      </button>
    </li>
  );
}
