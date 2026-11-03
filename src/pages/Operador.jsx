// src/pages/Operador.jsx
import { useState, useContext, useEffect } from 'react';
import { EmergencyContext } from '../context/EmergencyContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import './Operador.css';

// Componente para volar hacia el reporte seleccionado[cite: 1]
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { animate: true });
    }
  }, [position, map]);
  return null;
}

// Función para crear el icono personalizado[cite: 1]
const crearIcono = (codigoGrupo, estado) => {
  const color = colorDeGrupo(codigoGrupo);
  let claseAnimacion = '';
  if (estado === 'Recibido') claseAnimacion = 'pin--pulso';
  if (estado === 'Cerrado' || estado === 'Descartado') claseAnimacion = 'pin--apagado';

  return L.divIcon({
    className: `custom-pin ${claseAnimacion}`,
    html: `<div class="pin-circle" style="background-color: ${color};"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export default function Operador() {
  const { reports, updateReportStatus } = useContext(EmergencyContext);
  const [selectedId, setSelectedId] = useState(null);

  const selectedReport = reports.find(r => r.id === selectedId);
  const mapCenter = selectedReport ? [selectedReport.ubicacionMapa.lat, selectedReport.ubicacionMapa.lng] : [3.4516, -76.5320];

  const handleValidar = () => updateReportStatus(selectedId, 'Validado');
  const handleDescartar = () => updateReportStatus(selectedId, 'Descartado');
  const handleCerrar = () => updateReportStatus(selectedId, 'Cerrado');
  const handleDespachar = (unidad) => {
    updateReportStatus(selectedId, 'Unidad despachada', { unidadDespachada: unidad });
  };

  return (
    <div className="operador-container">
      {/* Panel Lateral: Lista y Detalles[cite: 1] */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Tablero de Despacho</h1>
          <p className="sidebar-subtitle">{reports.length} reportes registrados</p>
        </div>

        <div className="report-list">
          {reports.map(report => (
            <div 
              key={report.id} 
              className={`report-item ${selectedId === report.id ? 'active' : ''}`}
              onClick={() => setSelectedId(report.id)}
            >
              <span className="badge" style={{ backgroundColor: colorDeGrupo(report.grupo) }}>
                {report.grupo} - {report.estado}
              </span>
              <p className="report-item-title">{report.barrio}</p>
              <p className="report-item-time">{new Date(report.fecha).toLocaleTimeString()}</p>
            </div>
          ))}
          {reports.length === 0 && <p className="empty-message">No hay reportes activos.</p>}
        </div>

        {/* Detalle del reporte seleccionado[cite: 1] */}
        {selectedReport && (
          <div className="report-detail">
            <h3 className="detail-title">Detalle de Emergencia</h3>
            <p className="detail-text"><strong>Ciudadano:</strong> {selectedReport.nombres} {selectedReport.apellidos}</p>
            <p className="detail-text"><strong>Teléfono:</strong> {selectedReport.telefono}</p>
            <p className="detail-text"><strong>¿Qué ve?:</strong> {selectedReport.queVe}</p>
            <p className="detail-text"><strong>Dirección:</strong> {selectedReport.direccion} ({selectedReport.puntoReferencia})</p>
            
            {selectedReport.fotos && selectedReport.fotos.length > 0 && (
              <div className="photo-grid">
                {selectedReport.fotos.map((foto, idx) => (
                  <img key={idx} src={foto} alt="Evidencia" />
                ))}
              </div>
            )}

            <div className="action-buttons">
              <a href={`tel:${selectedReport.telefono}`} className="btn btn-primary">Llamar al Ciudadano</a>
              <a 
                href={`https://www.google.com/maps?q=${selectedReport.ubicacionMapa.lat},${selectedReport.ubicacionMapa.lng}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary"
              >
                Ver en Google Maps
              </a>
            </div>

            <div className="operator-actions">
              <h4 className="operator-actions-title">Acciones de Operador</h4>
              
              {selectedReport.estado === 'Recibido' && (
                <div className="flex-gap">
                  <button onClick={handleValidar} className="btn btn-success">Validar Caso</button>
                  <button onClick={handleDescartar} className="btn btn-danger">Descartar</button>
                </div>
              )}

              {selectedReport.estado === 'Validado' && (
                <>
                  <p className="dispatch-label">Despachar Unidad:</p>
                  <div className="grid-dispatch">
                    <button onClick={() => handleDespachar('Máquina')} className="btn btn-primary">Máquina</button>
                    <button onClick={() => handleDespachar('Ambulancia')} className="btn btn-success">Ambulancia</button>
                    <button onClick={() => handleDespachar('Rescate')} className="btn btn-warning">Rescate</button>
                    <button onClick={() => handleDespachar('HazMat')} className="btn btn-danger">HazMat</button>
                  </div>
                </>
              )}

              {(selectedReport.estado === 'Unidad despachada' || selectedReport.estado === 'Validado') && (
                <button onClick={handleCerrar} className="btn btn-secondary mt-05">Cerrar Caso</button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Área del Mapa[cite: 1] */}
      <main className="map-area">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController position={selectedReport?.ubicacionMapa} />
          
          {reports.map(report => (
            <Marker 
              key={report.id} 
              position={[report.ubicacionMapa.lat, report.ubicacionMapa.lng]}
              icon={crearIcono(report.grupo, report.estado)}
              eventHandlers={{ click: () => setSelectedId(report.id) }}
            >
              <Popup>
                <strong className="popup-title">{report.nombres}</strong><br/>
                <span className="popup-text">{report.queVe}</span><br/>
                <span className="popup-status" style={{ color: colorDeGrupo(report.grupo) }}>{report.estado}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}