import { useState, useContext, useEffect } from 'react';
import { EmergencyContext } from '../context/EmergencyContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import './Operador.css';

function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 16, { animate: true });
  }, [position, map]);
  return null;
}

const crearIcono = (codigoGrupo, estado) => {
  const color = colorDeGrupo(codigoGrupo);
  let claseAnimacion = estado === 'Recibido' ? 'pin--pulso' : (estado === 'Cerrado' || estado === 'Descartado' ? 'pin--apagado' : '');
  return L.divIcon({
    className: `custom-pin ${claseAnimacion}`,
    html: `<div class="pin-circle" style="background-color: ${color};"></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12]
  });
};

export default function Operador() {
  const { reports, updateReportStatus, simular50Reportes } = useContext(EmergencyContext);
  const [selectedId, setSelectedId] = useState(null);
  
  // Filtros por grupo y estado[cite: 1]
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const filteredReports = reports.filter(r => {
    const matchGrupo = filtroGrupo ? r.grupo.toString() === filtroGrupo : true;
    const matchEstado = filtroEstado ? r.estado === filtroEstado : true;
    return matchGrupo && matchEstado;
  });

  const selectedReport = reports.find(r => r.id === selectedId);
  const mapCenter = selectedReport ? [selectedReport.ubicacionMapa.lat, selectedReport.ubicacionMapa.lng] : [3.4516, -76.5320];

  const handleValidar = () => updateReportStatus(selectedId, 'Validado');
  const handleDescartar = () => updateReportStatus(selectedId, 'Descartado');
  const handleCerrar = () => updateReportStatus(selectedId, 'Cerrado');
  const handleDespachar = (unidad) => updateReportStatus(selectedId, 'Unidad despachada', { unidadDespachada: unidad });
  
  // Botón solicitar información[cite: 1]
  const handleSolicitarInfo = () => updateReportStatus(selectedId, null, { requiereInfo: true });

  return (
    <div className="operador-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Tablero de Despacho</h1>
          <button onClick={simular50Reportes} className="btn btn-warning mt-05">Simular 50 Reportes</button>
        </div>

        {/* Interfaz de Filtros[cite: 1] */}
        <div className="filters-container">
          <select className="filter-select" onChange={(e) => setFiltroGrupo(e.target.value)} value={filtroGrupo}>
            <option value="">Todos los grupos</option>
            {GRUPOS.map(g => <option key={g.codigo} value={g.codigo}>{g.nombre}</option>)}
          </select>
          <select className="filter-select" onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado}>
            <option value="">Todos los estados</option>
            <option value="Recibido">Recibido</option>
            <option value="Validado">Validado</option>
            <option value="Unidad despachada">Unidad despachada</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>

        <div className="report-list">
          {filteredReports.map(report => (
            <div key={report.id} className={`report-item ${selectedId === report.id ? 'active' : ''}`} onClick={() => setSelectedId(report.id)}>
              <span className="badge" style={{ backgroundColor: colorDeGrupo(report.grupo) }}>{report.grupo} - {report.estado}</span>
              <p className="report-item-title">{report.barrio}</p>
            </div>
          ))}
        </div>

        {selectedReport && (
          <div className="report-detail">
            <h3 className="detail-title">Detalle de Emergencia</h3>
            <p className="detail-text"><strong>Ciudadano:</strong> {selectedReport.nombres}</p>
            <p className="detail-text"><strong>Teléfono:</strong> {selectedReport.telefono}</p>
            <p className="detail-text"><strong>¿Qué ve?:</strong> {selectedReport.queVe}</p>
            
            {/* Renderizado condicional de variables médicas del grupo 300[cite: 1] */}
            {selectedReport.grupo === 300 && (
              <div style={{ padding: '0.5rem', backgroundColor: '#334155', borderRadius: '4px', margin: '0.5rem 0' }}>
                <p>Edad: {selectedReport.edad || 'N/D'} | Sexo: {selectedReport.sexo || 'N/D'}</p>
                <p>Consciente: {selectedReport.consciente ? 'Sí' : 'No'} | Respira: {selectedReport.respira ? 'Sí' : 'No'}</p>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={handleSolicitarInfo} className="btn btn-secondary">Solicitar más info al ciudadano</button>
            </div>

            <div className="operator-actions">
              <h4 className="operator-actions-title">Acciones de Operador</h4>
              {selectedReport.estado === 'Recibido' && (
                <div className="flex-gap">
                  <button onClick={handleValidar} className="btn btn-success">Validar</button>
                  <button onClick={handleDescartar} className="btn btn-danger">Descartar</button>
                </div>
              )}
              {selectedReport.estado === 'Validado' && (
                <div className="grid-dispatch">
                  <button onClick={() => handleDespachar('Máquina')} className="btn btn-primary">Máquina</button>
                  <button onClick={() => handleDespachar('Ambulancia')} className="btn btn-success">Ambulancia</button>
                </div>
              )}
              {(selectedReport.estado === 'Unidad despachada' || selectedReport.estado === 'Validado') && (
                <button onClick={handleCerrar} className="btn btn-secondary mt-05">Cerrar Caso</button>
              )}
            </div>
          </div>
        )}
      </aside>

      <main className="map-area">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController position={selectedReport?.ubicacionMapa} />
          {filteredReports.map(report => (
            <Marker key={report.id} position={[report.ubicacionMapa.lat, report.ubicacionMapa.lng]} icon={crearIcono(report.grupo, report.estado)} eventHandlers={{ click: () => setSelectedId(report.id) }}>
              <Popup><strong className="popup-title">{report.nombres}</strong><br/><span className="popup-status">{report.estado}</span></Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}