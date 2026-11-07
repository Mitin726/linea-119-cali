import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEmergencias } from '../context/EmergencyContext';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import { BARRIOS } from '../data/barrios';
import CampoFormulario from '../components/CampoFormulario';
import MiniMapa from '../components/MiniMapa';
import ConfirmacionReporte from '../components/ConfirmacionReporte';
import './Reportar.css';

const CENTRO_CALI = { lat: 3.4516, lng: -76.532 };
const MAX_ARCHIVOS = 3;
const SESSION_KEY = 'bomberos_119_mi_reporte';

const FORM_INICIAL = {
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
  ubicacionMapa: CENTRO_CALI,
  puntoExacto: false,
  // Preguntas de continuación del grupo 300 (extra)
  edad: '',
  sexo: '',
  consciente: '',
  respira: '',
};

// Devuelve un objeto { campo: mensaje } con los errores de los campos obligatorios.
function validar(form) {
  const errores = {};
  if (!form.nombres.trim()) errores.nombres = 'Escribe tus nombres.';
  if (!form.apellidos.trim()) errores.apellidos = 'Escribe tus apellidos.';
  if (!form.telefono) errores.telefono = 'Escribe tu número de teléfono.';
  else if (!/^\d{10}$/.test(form.telefono))
    errores.telefono = 'El teléfono debe tener exactamente 10 dígitos (solo números).';
  if (!form.grupo) errores.grupo = 'Selecciona el tipo de emergencia.';
  if (!form.queVe.trim()) errores.queVe = 'Describe lo que está pasando.';
  if (!form.direccion.trim()) errores.direccion = 'Escribe la dirección.';
  if (!form.barrio) errores.barrio = 'Selecciona el barrio.';
  if (!form.puntoReferencia.trim()) errores.puntoReferencia = 'Escribe un punto de referencia.';
  if (!form.noAplicaEdificio && !form.edificio.trim())
    errores.edificio = 'Escribe el nombre del edificio o marca «No aplica».';
  return errores;
}

const ETIQUETAS = {
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  telefono: 'Teléfono',
  grupo: 'Grupo de emergencia',
  queVe: '¿Qué ve?',
  direccion: 'Dirección',
  barrio: 'Barrio',
  puntoReferencia: 'Punto de referencia',
  edificio: 'Nombre del edificio',
};

export default function Reportar() {
  const { addReport, reports } = useEmergencias();
  // El id del reporte enviado se guarda en sessionStorage para no perder la confirmación al recargar.
  const [miReporteId, setMiReporteId] = useState(() => sessionStorage.getItem(SESSION_KEY));
  // Si se llega desde una tarjeta de la landing (/reportar?grupo=100), el grupo viene preseleccionado.
  const [searchParams] = useSearchParams();
  const grupoInicial = GRUPOS.some((g) => String(g.codigo) === searchParams.get('grupo'))
    ? searchParams.get('grupo')
    : '';
  const [form, setForm] = useState({ ...FORM_INICIAL, grupo: grupoInicial });
  const [tocados, setTocados] = useState({});
  const [archivos, setArchivos] = useState([]);
  const [avisoArchivos, setAvisoArchivos] = useState('');
  const [mostrarTips, setMostrarTips] = useState(false);

  const errores = validar(form);
  const esValido = Object.keys(errores).length === 0;
  const errorDe = (campo) => (tocados[campo] ? errores[campo] : undefined);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nuevoValor = type === 'checkbox' ? checked : value;
    if (name === 'telefono') nuevoValor = value.replace(/\D/g, '').slice(0, 10);

    setForm((prev) => {
      const next = { ...prev, [name]: nuevoValor };
      // Al elegir barrio, el pin del mini mapa se mueve a sus coordenadas
      // (a menos que el ciudadano ya haya marcado un punto exacto).
      if (name === 'barrio' && !prev.puntoExacto) {
        const b = BARRIOS.find((x) => x.nombre === value);
        if (b) next.ubicacionMapa = { lat: b.lat, lng: b.lng };
      }
      if (name === 'noAplicaEdificio' && checked) next.edificio = '';
      return next;
    });
    if (type === 'checkbox' || type === 'select-one') setTocados((t) => ({ ...t, [name]: true }));
  };

  const handleBlur = (e) => setTocados((t) => ({ ...t, [e.target.name]: true }));

  const handlePuntoMapa = (latlng) =>
    setForm((prev) => ({ ...prev, ubicacionMapa: latlng, puntoExacto: true }));

  const handleArchivos = (e) => {
    const seleccionados = Array.from(e.target.files);
    const files = seleccionados.slice(0, MAX_ARCHIVOS);
    setAvisoArchivos(
      seleccionados.length > MAX_ARCHIVOS
        ? `Seleccionaste ${seleccionados.length} archivos; solo se adjuntaron los primeros ${MAX_ARCHIVOS}.`
        : ''
    );
    setArchivos(
      files.map((file) => ({ url: URL.createObjectURL(file), tipo: file.type, nombre: file.name }))
    );
  };

  const quitarArchivo = (i) => setArchivos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!esValido) {
      setTocados(Object.fromEntries(Object.keys(ETIQUETAS).map((k) => [k, true])));
      return;
    }
    const id = addReport({ ...form, grupo: Number(form.grupo), archivos });
    sessionStorage.setItem(SESSION_KEY, id);
    setMiReporteId(id);
    window.scrollTo({ top: 0 });
  };

  const nuevoReporte = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setMiReporteId(null);
    setForm(FORM_INICIAL);
    setTocados({});
    setArchivos([]);
    setAvisoArchivos('');
  };

  if (miReporteId) {
    const miReporte = reports.find((r) => r.id === miReporteId);
    return (
      <div className="reportar-container">
        <ConfirmacionReporte reporte={miReporte} onNuevoReporte={nuevoReporte} />
      </div>
    );
  }

  const faltantes = Object.keys(errores).map((k) => ETIQUETAS[k]);
  const inputProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(errorDe(name)),
    'aria-describedby': errorDe(name) ? `${name}-error` : undefined,
    className: 'form-input',
  });

  return (
    <div className="reportar-container">
      <form onSubmit={handleSubmit} className="form-container" noValidate>
        <Link to="/" className="volver-link">← Volver</Link>
        <h1 className="header-title">Reportar emergencia 119</h1>
        <p className="text-secondary mb-2">
          Los campos marcados con <span className="campo-obligatorio">*</span> son obligatorios.
          Si la vida de alguien corre peligro inmediato, <a href="tel:119">llama al 119</a>.
        </p>

        <fieldset>
          <legend className="form-legend">1. ¿Cuál es su emergencia?</legend>
          <CampoFormulario id="grupo" label="Grupo de emergencia" error={errorDe('grupo')}>
            <select {...inputProps('grupo')}>
              <option value="">Seleccione el tipo de emergencia...</option>
              {GRUPOS.map((g) => (
                <option key={g.codigo} value={g.codigo}>
                  {g.codigo} - {g.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>

          {form.grupo === '300' && (
            <div className="bloque-medico">
              <p className="bloque-medico-titulo">Información médica adicional (opcional)</p>
              <div className="grid-2-cols">
                <input
                  type="number"
                  min="0"
                  max="120"
                  name="edad"
                  value={form.edad}
                  placeholder="Edad aproximada"
                  onChange={handleChange}
                  className="form-input"
                  aria-label="Edad aproximada"
                />
                <select name="sexo" value={form.sexo} onChange={handleChange} className="form-input" aria-label="Sexo">
                  <option value="">Sexo...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="No sabe">No sabe</option>
                </select>
                <select name="consciente" value={form.consciente} onChange={handleChange} className="form-input" aria-label="¿Está consciente?">
                  <option value="">¿Está consciente?</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No sabe">No sabe</option>
                </select>
                <select name="respira" value={form.respira} onChange={handleChange} className="form-input" aria-label="¿Respira?">
                  <option value="">¿Respira?</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No sabe">No sabe</option>
                </select>
              </div>
            </div>
          )}

          <CampoFormulario id="queVe" label="¿Qué ve?" error={errorDe('queVe')}>
            <textarea
              {...inputProps('queVe')}
              className="form-input form-textarea"
              placeholder="Describa lo que está pasando..."
            />
          </CampoFormulario>
        </fieldset>

        <fieldset>
          <legend className="form-legend">2. ¿De qué número nos escribe y cuál es su nombre?</legend>
          <div className="grid-2-cols">
            <CampoFormulario id="nombres" label="Nombres" error={errorDe('nombres')}>
              <input type="text" autoComplete="given-name" {...inputProps('nombres')} />
            </CampoFormulario>
            <CampoFormulario id="apellidos" label="Apellidos" error={errorDe('apellidos')}>
              <input type="text" autoComplete="family-name" {...inputProps('apellidos')} />
            </CampoFormulario>
            <CampoFormulario id="telefono" label="Teléfono (10 dígitos)" error={errorDe('telefono')} className="grid-span-2">
              <input type="tel" inputMode="numeric" autoComplete="tel" placeholder="3001234567" {...inputProps('telefono')} />
            </CampoFormulario>
          </div>
        </fieldset>

        <fieldset>
          <legend className="form-legend">3. ¿Dónde es su emergencia?</legend>
          <div className="grid-2-cols">
            <CampoFormulario id="direccion" label="Dirección" error={errorDe('direccion')}>
              <input type="text" placeholder="Ej. Calle 5 # 10-20" {...inputProps('direccion')} />
            </CampoFormulario>
            <CampoFormulario id="barrio" label="Barrio" error={errorDe('barrio')}>
              <select {...inputProps('barrio')}>
                <option value="">Seleccione el barrio...</option>
                {BARRIOS.map((b) => (
                  <option key={b.nombre} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </CampoFormulario>
            <CampoFormulario id="puntoReferencia" label="Punto de referencia" error={errorDe('puntoReferencia')} className="grid-span-2">
              <input type="text" placeholder="Ej. Frente al parque principal" {...inputProps('puntoReferencia')} />
            </CampoFormulario>
            <CampoFormulario id="edificio" label="Nombre del edificio" error={errorDe('edificio')} className="grid-span-2">
              <input
                type="text"
                placeholder="Ej. Edificio Torre Central"
                disabled={form.noAplicaEdificio}
                {...inputProps('edificio')}
              />
              <label className="checkbox-label mt-05">
                <input
                  type="checkbox"
                  name="noAplicaEdificio"
                  checked={form.noAplicaEdificio}
                  onChange={handleChange}
                />
                No aplica (no es un edificio)
              </label>
            </CampoFormulario>
          </div>

          <div className="mt-1">
            <p className="campo-label">Punto exacto en el mapa (opcional)</p>
            <p className="tip-text">
              {form.puntoExacto
                ? 'Punto marcado. Puedes tocar otro lugar para corregirlo.'
                : 'Toca el mapa para marcar el sitio exacto. Si no lo haces, usaremos el centro del barrio.'}
            </p>
            <div className="map-container">
              <MiniMapa
                posicion={form.ubicacionMapa}
                onCambiar={handlePuntoMapa}
                color={colorDeGrupo(Number(form.grupo))}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="form-legend">4. Fotos o videos (opcional, máx. {MAX_ARCHIVOS})</legend>
          <div className="archivos-acciones">
            <input
              id="archivos"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleArchivos}
              className="input-archivos"
            />
            <button type="button" className="btn-toggle-tips" onClick={() => setMostrarTips(!mostrarTips)}>
              💡 Cómo tomar las fotos
            </button>
          </div>
          {avisoArchivos && <p className="campo-error">{avisoArchivos}</p>}
          <div className="previews mt-1">
            {archivos.map((archivo, i) => (
              <div key={archivo.url} className="preview-item">
                {archivo.tipo.startsWith('video') ? (
                  <video src={archivo.url} className="photo-preview" muted controls />
                ) : (
                  <img src={archivo.url} alt={`Evidencia ${i + 1}`} className="photo-preview" />
                )}
                <button type="button" className="preview-quitar" onClick={() => quitarArchivo(i)} aria-label={`Quitar ${archivo.nombre}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </fieldset>

        {mostrarTips && (
          <div className="floating-tips" role="dialog" aria-label="Recomendaciones para fotos y videos">
            <h4 className="floating-tips-titulo">Recomendaciones</h4>
            <ul>
              <li>Tu seguridad primero: no te acerques al fuego, humo, cables o agua.</li>
              <li>Toma una foto abierta del lugar y otra más cercana del problema.</li>
              <li>Incluye una referencia visible: placa, fachada o letrero.</li>
              <li>En video, graba en horizontal, máximo 30 segundos y sin moverte mucho.</li>
              <li>Si hay heridos, muestra cuántas personas hay, sin exponer su rostro.</li>
            </ul>
            <button type="button" onClick={() => setMostrarTips(false)} className="btn-toggle-tips w-100">
              Entendido
            </button>
          </div>
        )}

        {!esValido && (
          <p className="faltantes" aria-live="polite">
            Para enviar falta completar: {faltantes.join(', ')}.
          </p>
        )}
        <button type="submit" disabled={!esValido} className="btn-submit">
          Enviar reporte
        </button>
      </form>
    </div>
  );
}
