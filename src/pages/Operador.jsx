import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Trash2, ExternalLink, Inbox, Filter } from 'lucide-react';
import { useEmergencias } from '../context/EmergencyContext';
import { GRUPOS } from '../data/grupos';
import { ESTADOS, COLOR_ESTADO } from '../data/estados';
import MapaOperador from '../mapa/MapaOperador';
import ReporteItem from '../components/ReporteItem';
import DetalleReporte from '../components/DetalleReporte';
import Marca from '../components/Marca';
import './Operador.css';

// Orden de prioridad de la lista: primero lo que requiere acción del operador.
const PRIORIDAD = { Recibido: 0, Validado: 1, 'Unidad despachada': 2, Cerrado: 3, Descartado: 4 };

const CONTADORES = [
  { estado: 'Recibido', etiqueta: 'Por validar' },
  { estado: 'Validado', etiqueta: 'Validados' },
  { estado: 'Unidad despachada', etiqueta: 'En camino' },
  { estado: 'Cerrado', etiqueta: 'Cerrados' },
];

// Reloj en vivo del centro de despacho.
function Reloj() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="ops-reloj">
      <span className="ops-reloj__hora mono">
        {ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </span>
      <span className="ops-reloj__fecha">
        {ahora.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
}

export default function Operador() {
  const { reports, updateReportStatus, simular50Reportes, limpiarReportes } = useEmergencias();
  const [selectedId, setSelectedId] = useState(null);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const filteredReports = useMemo(
    () =>
      reports
        .filter(
          (r) =>
            (!filtroGrupo || String(r.grupo) === filtroGrupo) &&
            (!filtroEstado || r.estado === filtroEstado)
        )
        .sort((a, b) => PRIORIDAD[a.estado] - PRIORIDAD[b.estado] || new Date(b.fecha) - new Date(a.fecha)),
    [reports, filtroGrupo, filtroEstado]
  );

  // El mapa del código base espera { id, grupo, lat, lng, estado, barrio, ... }.
  const reportesMapa = useMemo(
    () => filteredReports.map((r) => ({ ...r, lat: r.ubicacionMapa.lat, lng: r.ubicacionMapa.lng })),
    [filteredReports]
  );

  const selectedReport = reports.find((r) => r.id === selectedId);
  const conteo = (estado) => reports.filter((r) => r.estado === estado).length;
  const actualizar = (estado, extra) => updateReportStatus(selectedId, estado, extra);
  const hayFiltros = filtroGrupo || filtroEstado;

  const borrarTodo = () => {
    if (window.confirm('¿Borrar todos los reportes? Esta acción no se puede deshacer.')) {
      limpiarReportes();
      setSelectedId(null);
    }
  };

  return (
    <div className="ops tema-oscuro">
      {/* ---------- Barra superior del centro de control ---------- */}
      <header className="ops-topbar">
        <Marca claro subtitulo="Centro de despacho 119" />

        <div className="ops-contadores" aria-label="Resumen de reportes">
          {CONTADORES.map(({ estado, etiqueta }) => (
            <button
              key={estado}
              type="button"
              className={`ops-contador ${filtroEstado === estado ? 'ops-contador--activo' : ''}`}
              style={{ '--estado': COLOR_ESTADO[estado] }}
              onClick={() => setFiltroEstado(filtroEstado === estado ? '' : estado)}
              title={`Filtrar: ${etiqueta}`}
            >
              <span className="ops-contador__num mono">{conteo(estado)}</span>
              <span className="ops-contador__label">{etiqueta}</span>
            </button>
          ))}
        </div>

        <div className="ops-topbar__derecha">
          <Reloj />
          <span className="ops-en-linea"><span className="ops-en-linea__dot" /> En línea</span>
          <Link to="/" className="btn btn--ghost btn--sm" title="Ir al sitio público">
            <ExternalLink size={14} /> <span className="ops-ocultar-movil">Sitio público</span>
          </Link>
        </div>
      </header>

      <div className="ops-cuerpo">
        {/* ---------- Lista de reportes ---------- */}
        <aside className="ops-lista">
          <div className="ops-lista__cabecera">
            <div className="ops-lista__titulo">
              <h1>Reportes</h1>
              <span className="ops-lista__total mono">{filteredReports.length}/{reports.length}</span>
            </div>
            <div className="ops-filtros">
              <Filter size={14} className="ops-filtros__icono" />
              <select className="ops-select" onChange={(e) => setFiltroGrupo(e.target.value)} value={filtroGrupo} aria-label="Filtrar por grupo">
                <option value="">Todos los grupos</option>
                {GRUPOS.map((g) => (
                  <option key={g.codigo} value={g.codigo}>{g.codigo} - {g.nombre}</option>
                ))}
              </select>
              <select className="ops-select" onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado} aria-label="Filtrar por estado">
                <option value="">Todos los estados</option>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="ops-acciones-2">
              <button type="button" onClick={simular50Reportes} className="btn btn--secondary btn--sm">
                <Zap size={14} /> Simular 50
              </button>
              <button type="button" onClick={borrarTodo} className="btn btn--danger-outline btn--sm" disabled={!reports.length}>
                <Trash2 size={14} /> Borrar todo
              </button>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="ops-vacio">
              <Inbox size={28} />
              <p>{hayFiltros ? 'Ningún reporte coincide con los filtros.' : 'Sin reportes por ahora.'}</p>
              <span>
                {hayFiltros ? (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setFiltroGrupo(''); setFiltroEstado(''); }}>
                    Quitar filtros
                  </button>
                ) : 'Envía uno desde /reportar o usa «Simular 50».'}
              </span>
            </div>
          ) : (
            <ul className="ops-lista__items">
              {filteredReports.map((report) => (
                <ReporteItem
                  key={report.id}
                  reporte={report}
                  activo={selectedId === report.id}
                  onSeleccionar={setSelectedId}
                />
              ))}
            </ul>
          )}
        </aside>

        {/* ---------- Mapa + detalle ---------- */}
        <main className="ops-mapa">
          <MapaOperador
            reportes={reportesMapa}
            seleccionadoId={selectedId}
            onSeleccionar={setSelectedId}
            estilo="oscuro"
          />
          {selectedReport && (
            <DetalleReporte
              key={selectedReport.id}
              reporte={selectedReport}
              onActualizar={actualizar}
              onCerrarDetalle={() => setSelectedId(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
