import { useState, useContext } from 'react';
import { EmergencyContext } from '../context/EmergencyContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GRUPOS } from '../data/grupos';
import { BARRIOS } from '../data/barrios';
import './Reportar.css';

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function Reportar() {
  const { addReport, reports } = useContext(EmergencyContext);
  const [radicado, setRadicado] = useState(null); 
  const [mostrarTips, setMostrarTips] = useState(false); // Ventana flotante[cite: 1]
  
  const [form, setForm] = useState({
    nombres: '', apellidos: '', telefono: '', grupo: '', queVe: '',
    direccion: '', barrio: '', puntoReferencia: '', edificio: '',
    noAplicaEdificio: false, ubicacionMapa: { lat: 3.4516, lng: -76.5320 },
    // Extras Grupo 300[cite: 1]
    edad: '', sexo: '', consciente: false, respira: false
  });

  const [archivos, setArchivos] = useState([]);

  const isFormValid = () => {
    if (!form.nombres || !form.apellidos) return false;
    if (!/^\d{10}$/.test(form.telefono)) return false; 
    if (!form.grupo || !form.queVe || !form.direccion || !form.barrio || !form.puntoReferencia) return false;
    if (!form.noAplicaEdificio && !form.edificio.trim()) return false;
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArchivos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); 
    const urls = files.map(file => ({ url: URL.createObjectURL(file), tipo: file.type }));
    setArchivos(urls);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    const barrioSeleccionado = BARRIOS.find(b => b.nombre === form.barrio);
    const coordenadasFinales = barrioSeleccionado ? { lat: barrioSeleccionado.lat, lng: barrioSeleccionado.lng } : form.ubicacionMapa;
    const id = addReport({ ...form, grupo: Number(form.grupo), ubicacionMapa: coordenadasFinales, archivos });
    setRadicado(id);
  };

  if (radicado) {
    const currentReport = reports.find(r => r.id === radicado);
    return (
      <div className="reportar-container">
        <div className="reportar-card">
          <h2 className="success-title">¡Reporte Recibido!</h2>
          <div className="details-box">
            <p><strong>Número de Radicado:</strong> {radicado}</p>
            <p style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
              <strong>Estado actual: </strong> <span className="text-accent-warm">{currentReport?.estado}</span>
            </p>
            {/* Aviso de solicitud de información[cite: 1] */}
            {currentReport?.requiereInfo && (
              <div className="alert-info">
                El radio operador ha solicitado más información. Por favor, esté atento a su teléfono.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reportar-container">
      <form onSubmit={handleSubmit} className="form-container">
        <h1 className="header-title">Reportar Emergencia 119</h1>

        <fieldset><legend className="form-legend">Datos Personales</legend>
          <div className="grid-2-cols">
            <input type="text" name="nombres" placeholder="Nombres" onChange={handleInputChange} className="form-input" required />
            <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleInputChange} className="form-input" required />
            <input type="tel" name="telefono" placeholder="Teléfono (10 dígitos)" pattern="\d{10}" onChange={handleInputChange} className="form-input grid-span-2" required />
          </div>
        </fieldset>

        <fieldset><legend className="form-legend">Detalles de la Emergencia</legend>
          <select name="grupo" onChange={handleInputChange} className="form-input" required>
            <option value="">Seleccione el tipo de emergencia...</option>
            {GRUPOS.map(g => <option key={g.codigo} value={g.codigo}>{g.codigo} - {g.nombre}</option>)}
          </select>

          {/* Preguntas de continuación del grupo 300[cite: 1] */}
          {form.grupo === '300' && (
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', marginTop: '1rem', borderRadius: '4px', border: '1px solid #DC2626' }}>
              <p style={{ color: '#DC2626', fontWeight: 'bold', marginBottom: '0.5rem' }}>Información Médica Adicional</p>
              <div className="grid-2-cols">
                <input type="number" name="edad" placeholder="Edad aproximada" onChange={handleInputChange} className="form-input" />
                <select name="sexo" onChange={handleInputChange} className="form-input">
                  <option value="">Sexo...</option><option value="M">Masculino</option><option value="F">Femenino</option>
                </select>
                <label className="checkbox-label"><input type="checkbox" name="consciente" onChange={handleInputChange} /> ¿Paciente consciente?</label>
                <label className="checkbox-label"><input type="checkbox" name="respira" onChange={handleInputChange} /> ¿Paciente respira?</label>
              </div>
            </div>
          )}

          <textarea name="queVe" placeholder="¿Qué ve? Describa la situación..." onChange={handleInputChange} className="form-input form-textarea" required />
          <div className="grid-2-cols mt-1">
            <input type="text" name="direccion" placeholder="Dirección exacta" onChange={handleInputChange} className="form-input" required />
            <select name="barrio" onChange={handleInputChange} className="form-input" required>
              <option value="">Seleccione el barrio...</option>
              {BARRIOS.map(b => <option key={b.nombre} value={b.nombre}>{b.nombre}</option>)}
            </select>
          </div>
          <input type="text" name="puntoReferencia" placeholder="Punto de referencia" onChange={handleInputChange} className="form-input mt-1" required />
        </fieldset>

        <div className="mb-2">
          <label className="text-secondary mb-05" style={{ display: 'block' }}>Adjuntar Fotos/Videos (Máx. 3)</label>
          {/* Soporte para videos[cite: 1] */}
          <input type="file" multiple accept="image/*,video/*" onChange={handleArchivos} style={{ color: '#0F172A' }} />
          <button type="button" className="btn-toggle-tips" onClick={() => setMostrarTips(!mostrarTips)}>💡 Tips de captura</button>
          <div className="flex-center mt-1">
            {archivos.map((archivo, i) => (
              archivo.tipo.includes('video') 
                ? <video key={i} src={archivo.url} className="photo-preview" muted /> 
                : <img key={i} src={archivo.url} alt="Evidencia" className="photo-preview" />
            ))}
          </div>
        </div>

        {/* Ventana flotante de recomendaciones[cite: 1] */}
        {mostrarTips && (
          <div className="floating-tips">
            <h4 style={{ color: '#DC2626', marginBottom: '0.5rem' }}>Recomendaciones</h4>
            <ul style={{ color: '#64748B', fontSize: '0.875rem', paddingLeft: '1rem' }}>
              <li>Grabe en horizontal si es posible.</li>
              <li>Muestre una toma abierta del lugar.</li>
              <li>No se acerque al peligro.</li>
            </ul>
            <button onClick={() => setMostrarTips(false)} className="btn-secondary mt-05" style={{ padding: '0.25rem', width: '100%' }}>Cerrar</button>
          </div>
        )}

        <button type="submit" disabled={!isFormValid()} className="btn-submit">Enviar Reporte</button>
      </form>
    </div>
  );
}