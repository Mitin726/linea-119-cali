// src/pages/Reportar.jsx
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
  
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    grupo: '',
    queVe: '',
    direccion: '',
    barrio: '',
    puntoReferencia: '',
    edificio: '',
    noAplicaEdificio: false,
    ubicacionMapa: { lat: 3.4516, lng: -76.5320 } 
  });

  const [fotos, setFotos] = useState([]);

  const isFormValid = () => {
    if (!form.nombres || !form.apellidos) return false;
    if (!/^\d{10}$/.test(form.telefono)) return false; 
    if (!form.grupo || !form.queVe || !form.direccion || !form.barrio || !form.puntoReferencia) return false;
    if (!form.noAplicaEdificio && !form.edificio.trim()) return false;
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); 
    const urls = files.map(file => URL.createObjectURL(file));
    setFotos(urls);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const barrioSeleccionado = BARRIOS.find(b => b.nombre === form.barrio);
    const coordenadasFinales = barrioSeleccionado 
      ? { lat: barrioSeleccionado.lat, lng: barrioSeleccionado.lng } 
      : form.ubicacionMapa;

    // Convertir el grupo a número para que coincida con el tipo de dato original
    const id = addReport({ ...form, grupo: Number(form.grupo), ubicacionMapa: coordenadasFinales, fotos });
    setRadicado(id);
  };

  if (radicado) {
    const currentReport = reports.find(r => r.id === radicado);
    return (
      <div className="reportar-container">
        <div className="reportar-card">
          <h2 className="success-title">¡Reporte Recibido!</h2>
          <p className="text-secondary">Su emergencia ha sido enviada al radio operador.</p>
          <div className="details-box">
            <p><strong>Número de Radicado:</strong> {radicado}</p>
            <p><strong>Hora:</strong> {new Date(currentReport?.fecha).toLocaleTimeString()}</p>
            <p style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
              <strong>Estado actual: </strong> 
              <span className="text-accent-warm">{currentReport?.estado}</span>
            </p>
          </div>
          <p className="text-secondary mt-1" style={{ fontSize: '0.875rem' }}>
            Mantenga esta pantalla abierta. El estado se actualizará en tiempo real.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reportar-container">
      <form onSubmit={handleSubmit} className="form-container">
        <h1 className="header-title">Reportar Emergencia 119</h1>

        <fieldset>
          <legend className="form-legend">Datos Personales</legend>
          <div className="grid-2-cols">
            <input type="text" name="nombres" placeholder="Nombres" onChange={handleInputChange} className="form-input" required />
            <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleInputChange} className="form-input" required />
            <input type="tel" name="telefono" placeholder="Teléfono (10 dígitos)" pattern="\d{10}" title="Debe contener exactamente 10 números" onChange={handleInputChange} className="form-input grid-span-2" required />
          </div>
        </fieldset>

        <fieldset>
          <legend className="form-legend">Detalles de la Emergencia</legend>
          
          <select name="grupo" onChange={handleInputChange} className="form-input" required>
            <option value="">Seleccione el tipo de emergencia...</option>
            {GRUPOS.map(g => (
              <option key={g.codigo} value={g.codigo}>{g.codigo} - {g.nombre}</option>
            ))}
          </select>

          <textarea name="queVe" placeholder="¿Qué ve? Describa la situación..." onChange={handleInputChange} className="form-input form-textarea" required />

          <div className="grid-2-cols mt-1">
            <input type="text" name="direccion" placeholder="Dirección exacta" onChange={handleInputChange} className="form-input" required />
            <select name="barrio" onChange={handleInputChange} className="form-input" required>
              <option value="">Seleccione el barrio...</option>
              {BARRIOS.map(b => (
                <option key={b.nombre} value={b.nombre}>{b.nombre}</option>
              ))}
            </select>
          </div>

          <input type="text" name="puntoReferencia" placeholder="Punto de referencia cercano" onChange={handleInputChange} className="form-input mt-1" required />
          
          <div className="flex-center mt-1">
            <input type="text" name="edificio" placeholder="Nombre del edificio/conjunto" value={form.noAplicaEdificio ? '' : form.edificio} disabled={form.noAplicaEdificio} onChange={handleInputChange} className="form-input" style={{ flex: 1, opacity: form.noAplicaEdificio ? 0.5 : 1 }} />
            <label className="checkbox-label">
              <input type="checkbox" name="noAplicaEdificio" onChange={handleInputChange} />
              No aplica
            </label>
          </div>
        </fieldset>

        <div className="mb-2">
          <p className="text-secondary mb-05">Opcional: Toque en el mapa el punto exacto de la emergencia</p>
          <div className="map-container">
            <MapContainer center={[3.4516, -76.5320]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={form.ubicacionMapa} setPosition={(pos) => setForm({...form, ubicacionMapa: pos})} />
            </MapContainer>
          </div>
        </div>

        <div className="mb-2">
          <label className="text-secondary mb-05" style={{ display: 'block' }}>Adjuntar Fotos (Máx. 3)</label>
          <input type="file" multiple accept="image/*" onChange={handleFotos} style={{ color: '#F8FAFC' }} />
          <p className="tip-text">Tip: Si es seguro, tome fotos amplias donde se vea el entorno.</p>
          <div className="flex-center mt-1">
            {fotos.map((url, i) => (
              <img key={i} src={url} alt={`Evidencia ${i+1}`} className="photo-preview" />
            ))}
          </div>
        </div>

        <button type="submit" disabled={!isFormValid()} className="btn-submit">
          Enviar Reporte
        </button>
      </form>
    </div>
  );
}