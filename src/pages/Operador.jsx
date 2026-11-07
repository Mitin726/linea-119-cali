import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useEmergencias } from '../context/EmergencyContext';
import { GRUPOS } from '../data/grupos';
import { ESTADOS } from '../data/estados';
import MapaOperador from '../mapa/MapaOperador';
import ReporteItem from '../components/ReporteItem';
import DetalleReporte from '../components/DetalleReporte';
import './Operador.css';

export default function Operador() {
  const { reports, updateReportStatus, simular50Reportes, limpiarReportes } = useEmergencias();
  const [selectedId, setSelectedId] = useState(null);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          (!filtroGrupo || String(r.grupo) === filtroGrupo) &&
          (!filtroEstado || r.estado === filtroEstado)
      ),
    [reports, filtroGrupo, filtroEstado]
  );

  // El mapa del código base espera { id, grupo, lat, lng, estado, barrio, ... }.
  const reportesMapa = useMemo(
    () => filteredReports.map((r) => ({ ...r, lat: r.ubicacionMapa.lat, lng: r.ubicacionMapa.lng })),
    [filteredReports]
  );

  const selectedReport = reports.find((r) => r.id === selectedId);
  const pendientes = reports.filter((r) => r.estado === 'Recibido').length;

  // Al seleccionar (desde la lista o el mapa) se sube al detalle, que está arriba de la lista.
  const sidebarRef = useRef(null);
  const seleccionar = (id) => {
    setSelectedId(id);
    sidebarRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actualizar = (estado, extra) => updateReportStatus(selectedId, estado, extra);

  const borrarTodo = () => {
    if (window.confirm('¿Borrar todos los reportes? Esta acción no se puede deshacer.')) {
      limpiarReportes();
      setSelectedId(null);
    }
  };

  return (
    <div className="operador-container">
      <aside className="sidebar" ref={sidebarRef}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-volver">← Inicio</Link>
          <h1 className="sidebar-title">Tablero de despacho</h1>
          <p className="sidebar-subtitle">
            {reports.length} reportes · <strong>{pendientes} por validar</strong>
          </p>
          <div className="flex-gap mt-05">
            <button type="button" onClick={simular50Reportes} className="btn btn-warning">
              Simular 50 reportes
            </button>
            <button type="button" onClick={borrarTodo} className="btn btn-outline" disabled={!reports.length}>
              Borrar todo
            </button>
          </div>
        </div>

        <div className="filters-container">
          <select
            className="filter-select"
            onChange={(e) => setFiltroGrupo(e.target.value)}
            value={filtroGrupo}
            aria-label="Filtrar por grupo"
          >
            <option value="">Todos los grupos</option>
            {GRUPOS.map((g) => (
              <option key={g.codigo} value={g.codigo}>
                {g.codigo} - {g.nombre}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            onChange={(e) => setFiltroEstado(e.target.value)}
            value={filtroEstado}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {selectedReport && (
          <DetalleReporte
            key={selectedReport.id}
            reporte={selectedReport}
            onActualizar={actualizar}
            onCerrarDetalle={() => setSelectedId(null)}
          />
        )}

        {filteredReports.length === 0 ? (
          <p className="empty-message">
            {reports.length
              ? 'Ningún reporte coincide con los filtros.'
              : 'Aún no hay reportes. Envía uno desde /reportar o simula 50.'}
          </p>
        ) : (
          <ul className="report-list">
            {filteredReports.map((report) => (
              <ReporteItem
                key={report.id}
                reporte={report}
                activo={selectedId === report.id}
                onSeleccionar={seleccionar}
              />
            ))}
          </ul>
        )}
      </aside>

      <main className="map-area">
        <MapaOperador reportes={reportesMapa} seleccionadoId={selectedId} onSeleccionar={seleccionar} />
      </main>
    </div>
  );
}
