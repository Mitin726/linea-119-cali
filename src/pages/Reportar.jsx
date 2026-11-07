import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Phone, ImagePlus, Lightbulb, X, Send, Pencil, MapPin, Info,
} from 'lucide-react';
import { useEmergencias } from '../context/EmergencyContext';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import { INFO_GRUPO } from '../data/gruposInfo';
import { BARRIOS } from '../data/barrios';
import CampoFormulario from '../components/CampoFormulario';
import MiniMapa from '../components/MiniMapa';
import ConfirmacionReporte from '../components/ConfirmacionReporte';
import SiteHeader from '../components/SiteHeader';
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

// Pasos del asistente. Siguen el interrogatorio inicial del protocolo de despacho.
const PASOS = [
  { titulo: 'Emergencia', pregunta: '¿Cuál es su emergencia?', campos: ['grupo', 'queVe'] },
  { titulo: 'Ubicación', pregunta: '¿Dónde es su emergencia?', campos: ['direccion', 'barrio', 'puntoReferencia', 'edificio'] },
  { titulo: 'Tus datos', pregunta: '¿Cuál es su nombre y de qué número nos contacta?', campos: ['nombres', 'apellidos', 'telefono'] },
  { titulo: 'Evidencia', pregunta: 'Fotos o videos (opcional)', campos: [] },
  { titulo: 'Revisar', pregunta: 'Revisa y envía tu reporte', campos: [] },
];

// Devuelve un objeto { campo: mensaje } con los errores de los campos obligatorios.
function validar(form) {
  const errores = {};
  if (!form.grupo) errores.grupo = 'Selecciona el tipo de emergencia.';
  if (!form.queVe.trim()) errores.queVe = 'Describe lo que está pasando.';
  if (!form.direccion.trim()) errores.direccion = 'Escribe la dirección.';
  if (!form.barrio) errores.barrio = 'Selecciona el barrio.';
  if (!form.puntoReferencia.trim()) errores.puntoReferencia = 'Escribe un punto de referencia.';
  if (!form.noAplicaEdificio && !form.edificio.trim())
    errores.edificio = 'Escribe el nombre del edificio o marca «No aplica».';
  if (!form.nombres.trim()) errores.nombres = 'Escribe tus nombres.';
  if (!form.apellidos.trim()) errores.apellidos = 'Escribe tus apellidos.';
  if (!form.telefono) errores.telefono = 'Escribe tu número de teléfono.';
  else if (!/^\d{10}$/.test(form.telefono))
    errores.telefono = 'El teléfono debe tener exactamente 10 dígitos (solo números).';
  return errores;
}

const ETIQUETAS = {
  grupo: 'Grupo de emergencia',
  queVe: '¿Qué ve?',
  direccion: 'Dirección',
  barrio: 'Barrio',
  puntoReferencia: 'Punto de referencia',
  edificio: 'Nombre del edificio',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  telefono: 'Teléfono',
};

const pasoValido = (paso, errores) => PASOS[paso].campos.every((c) => !errores[c]);

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
  const [paso, setPaso] = useState(0);
  const [tocados, setTocados] = useState({});
  const [archivos, setArchivos] = useState([]);
  const [avisoArchivos, setAvisoArchivos] = useState('');
  const [arrastrando, setArrastrando] = useState(false);
  const [mostrarTips, setMostrarTips] = useState(false);
  const tarjetaRef = useRef(null);

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
    if (type === 'checkbox' || type === 'radio' || type === 'select-one') {
      setTocados((t) => ({ ...t, [name]: true, ...(name === 'noAplicaEdificio' ? { edificio: true } : {}) }));
    }
  };

  const handleBlur = (e) => setTocados((t) => ({ ...t, [e.target.name]: true }));

  const handlePuntoMapa = (latlng) =>
    setForm((prev) => ({ ...prev, ubicacionMapa: latlng, puntoExacto: true }));

  // Agrega archivos (desde el selector o arrastrando) hasta un máximo de 3.
  const agregarArchivos = (lista) => {
    const validos = Array.from(lista).filter((f) => f.type.startsWith('image') || f.type.startsWith('video'));
    const espacio = MAX_ARCHIVOS - archivos.length;
    const nuevos = validos.slice(0, Math.max(espacio, 0));
    setAvisoArchivos(
      validos.length > nuevos.length
        ? `Máximo ${MAX_ARCHIVOS} archivos: ${validos.length - nuevos.length} no se agregaron.`
        : ''
    );
    setArchivos((prev) => [
      ...prev,
      ...nuevos.map((file) => ({ url: URL.createObjectURL(file), tipo: file.type, nombre: file.name })),
    ]);
  };

  const quitarArchivo = (i) => {
    setArchivos((prev) => prev.filter((_, idx) => idx !== i));
    setAvisoArchivos('');
  };

  const irA = (n) => {
    setPaso(n);
    tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const siguiente = () => {
    if (!pasoValido(paso, errores)) {
      setTocados((t) => ({ ...t, ...Object.fromEntries(PASOS[paso].campos.map((c) => [c, true])) }));
      return;
    }
    irA(paso + 1);
  };

  // Se puede saltar a un paso solo si todos los anteriores están completos.
  const puedeIrA = (n) => PASOS.slice(0, n).every((_, i) => pasoValido(i, errores));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paso < PASOS.length - 1) return siguiente();
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
    setPaso(0);
    setTocados({});
    setArchivos([]);
    setAvisoArchivos('');
  };

  if (miReporteId) {
    const miReporte = reports.find((r) => r.id === miReporteId);
    return (
      <div className="reportar">
        <SiteHeader compacto />
        <main className="reportar__main">
          <ConfirmacionReporte reporte={miReporte} onNuevoReporte={nuevoReporte} />
        </main>
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
    className: 'input',
  });
  const grupoSel = GRUPOS.find((g) => String(g.codigo) === form.grupo);

  return (
    <div className="reportar">
      <SiteHeader compacto />

      <main className="reportar__main">
        <div className="reportar__intro">
          <span className="eyebrow">Línea 119 · Reporte digital</span>
          <h1 className="reportar__titulo">Reportar una emergencia</h1>
          <p className="reportar__aviso">
            <Phone size={16} /> Si alguien está en peligro inmediato, <a href="tel:119">llama al 119</a>.
          </p>
        </div>

        {/* ---------- Indicador de pasos ---------- */}
        <nav className="stepper" aria-label="Progreso del reporte">
          <div className="stepper__barra" aria-hidden="true">
            <div className="stepper__progreso" style={{ width: `${(paso / (PASOS.length - 1)) * 100}%` }} />
          </div>
          <ol className="stepper__lista">
            {PASOS.map((p, i) => {
              const estado = i < paso ? 'hecho' : i === paso ? 'actual' : 'pendiente';
              return (
                <li key={p.titulo}>
                  <button
                    type="button"
                    className={`stepper__paso stepper__paso--${estado}`}
                    onClick={() => puedeIrA(i) && irA(i)}
                    disabled={!puedeIrA(i)}
                    aria-current={i === paso ? 'step' : undefined}
                  >
                    <span className="stepper__circulo">{i < paso ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                    <span className="stepper__titulo">{p.titulo}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <form onSubmit={handleSubmit} className="tarjeta" ref={tarjetaRef} noValidate>
          <header className="tarjeta__encabezado">
            <span className="tarjeta__paso mono">Paso {paso + 1} de {PASOS.length}</span>
            <h2 className="tarjeta__titulo">{PASOS[paso].pregunta}</h2>
          </header>

          <div className="tarjeta__cuerpo">
            {/* ---------- Paso 1: Emergencia ---------- */}
            {paso === 0 && (
              <>
                <fieldset className="grupo-selector" aria-describedby={errorDe('grupo') ? 'grupo-error' : undefined}>
                  <legend className="campo-label">
                    Grupo de emergencia <span className="campo-obligatorio">*</span>
                  </legend>
                  <div className="grupo-opciones">
                    {GRUPOS.map((g) => {
                      const { Icono } = INFO_GRUPO[g.codigo];
                      const activo = form.grupo === String(g.codigo);
                      return (
                        <label
                          key={g.codigo}
                          className={`grupo-opcion ${activo ? 'grupo-opcion--activa' : ''}`}
                          style={{ '--grupo': g.color }}
                        >
                          <input
                            type="radio"
                            name="grupo"
                            value={g.codigo}
                            checked={activo}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="grupo-opcion__icono"><Icono size={20} /></span>
                          <span className="grupo-opcion__texto">
                            <span className="grupo-opcion__codigo mono">{g.codigo}</span>
                            <span className="grupo-opcion__nombre">{g.nombre}</span>
                          </span>
                          {activo && <Check size={18} className="grupo-opcion__check" />}
                        </label>
                      );
                    })}
                  </div>
                  {errorDe('grupo') && <p id="grupo-error" className="campo-error" role="alert">{errorDe('grupo')}</p>}
                </fieldset>

                {form.grupo === '300' && (
                  <div className="bloque-medico">
                    <p className="bloque-medico__titulo">
                      <Info size={16} /> Preguntas de rescate y emergencia médica (opcional)
                    </p>
                    <div className="grid-2">
                      <input
                        type="number" min="0" max="120" name="edad" value={form.edad}
                        placeholder="Edad aproximada" onChange={handleChange} className="input"
                        aria-label="Edad aproximada"
                      />
                      <select name="sexo" value={form.sexo} onChange={handleChange} className="input" aria-label="Sexo">
                        <option value="">Sexo</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="No sabe">No sabe</option>
                      </select>
                      <select name="consciente" value={form.consciente} onChange={handleChange} className="input" aria-label="¿Está consciente?">
                        <option value="">¿Está consciente?</option>
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                        <option value="No sabe">No sabe</option>
                      </select>
                      <select name="respira" value={form.respira} onChange={handleChange} className="input" aria-label="¿Respira?">
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
                    className="input input--textarea"
                    placeholder="Ej. Sale humo negro del segundo piso de una casa y hay personas en la calle."
                  />
                </CampoFormulario>
              </>
            )}

            {/* ---------- Paso 2: Ubicación ---------- */}
            {paso === 1 && (
              <>
                <div className="grid-2">
                  <CampoFormulario id="direccion" label="Dirección" error={errorDe('direccion')}>
                    <input type="text" placeholder="Ej. Calle 5 # 10-20" {...inputProps('direccion')} />
                  </CampoFormulario>
                  <CampoFormulario id="barrio" label="Barrio" error={errorDe('barrio')}>
                    <select {...inputProps('barrio')}>
                      <option value="">Selecciona el barrio</option>
                      {BARRIOS.map((b) => (
                        <option key={b.nombre} value={b.nombre}>{b.nombre}</option>
                      ))}
                    </select>
                  </CampoFormulario>
                </div>
                <CampoFormulario id="puntoReferencia" label="Punto de referencia" error={errorDe('puntoReferencia')}>
                  <input type="text" placeholder="Ej. Frente al parque principal" {...inputProps('puntoReferencia')} />
                </CampoFormulario>
                <CampoFormulario id="edificio" label="Nombre del edificio" error={errorDe('edificio')}>
                  <input
                    type="text"
                    placeholder="Ej. Edificio Torre Central"
                    disabled={form.noAplicaEdificio}
                    {...inputProps('edificio')}
                  />
                  <label className="check">
                    <input type="checkbox" name="noAplicaEdificio" checked={form.noAplicaEdificio} onChange={handleChange} />
                    No aplica, no es un edificio
                  </label>
                </CampoFormulario>

                <div className="campo">
                  <span className="campo-label">Punto exacto en el mapa <span className="campo-opcional">(opcional)</span></span>
                  <p className="campo-ayuda">
                    <MapPin size={14} />
                    {form.puntoExacto
                      ? 'Punto marcado. Toca otro lugar si necesitas corregirlo.'
                      : 'Toca el mapa para marcar el sitio exacto. Si no lo haces, usaremos el centro del barrio.'}
                  </p>
                  <div className="mapa-marco">
                    <MiniMapa
                      posicion={form.ubicacionMapa}
                      onCambiar={handlePuntoMapa}
                      color={grupoSel?.color ?? '#c8102e'}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ---------- Paso 3: Datos ---------- */}
            {paso === 2 && (
              <>
                <div className="grid-2">
                  <CampoFormulario id="nombres" label="Nombres" error={errorDe('nombres')}>
                    <input type="text" autoComplete="given-name" {...inputProps('nombres')} />
                  </CampoFormulario>
                  <CampoFormulario id="apellidos" label="Apellidos" error={errorDe('apellidos')}>
                    <input type="text" autoComplete="family-name" {...inputProps('apellidos')} />
                  </CampoFormulario>
                </div>
                <CampoFormulario id="telefono" label="Teléfono celular" error={errorDe('telefono')}>
                  <input type="tel" inputMode="numeric" autoComplete="tel" placeholder="10 dígitos, ej. 3001234567" {...inputProps('telefono')} />
                </CampoFormulario>
                <p className="campo-ayuda">
                  <Phone size={14} /> El radio operador puede llamarte a este número para confirmar el reporte.
                </p>
              </>
            )}

            {/* ---------- Paso 4: Evidencia ---------- */}
            {paso === 3 && (
              <>
                <p className="texto-muted">
                  Una foto o un video corto le ahorra al radio operador varias preguntas. Puedes adjuntar hasta {MAX_ARCHIVOS} archivos.
                </p>
                <label
                  className={`dropzone ${arrastrando ? 'dropzone--activa' : ''} ${archivos.length >= MAX_ARCHIVOS ? 'dropzone--llena' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => { e.preventDefault(); setArrastrando(false); agregarArchivos(e.dataTransfer.files); }}
                >
                  <input
                    id="archivos"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => { agregarArchivos(e.target.files); e.target.value = ''; }}
                    className="sr-only"
                    disabled={archivos.length >= MAX_ARCHIVOS}
                  />
                  <span className="dropzone__icono"><ImagePlus size={24} /></span>
                  <span className="dropzone__titulo">
                    {archivos.length >= MAX_ARCHIVOS ? 'Ya adjuntaste el máximo de archivos' : 'Toca para elegir fotos o videos'}
                  </span>
                  <span className="dropzone__sub">o arrástralos aquí · {archivos.length}/{MAX_ARCHIVOS}</span>
                </label>
                {avisoArchivos && <p className="campo-error">{avisoArchivos}</p>}

                {archivos.length > 0 && (
                  <div className="previews">
                    {archivos.map((archivo, i) => (
                      <div key={archivo.url} className="preview">
                        {archivo.tipo.startsWith('video') ? (
                          <video src={archivo.url} muted />
                        ) : (
                          <img src={archivo.url} alt={`Evidencia ${i + 1}`} />
                        )}
                        <button type="button" className="preview__quitar" onClick={() => quitarArchivo(i)} aria-label={`Quitar ${archivo.nombre}`}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" className="btn btn--secondary" onClick={() => setMostrarTips(true)}>
                  <Lightbulb size={16} /> Cómo tomar buenas fotos
                </button>
              </>
            )}

            {/* ---------- Paso 5: Revisar ---------- */}
            {paso === 4 && (
              <div className="resumen">
                <ResumenSeccion titulo="Emergencia" onEditar={() => irA(0)}>
                  <ResumenDato label="Grupo">
                    {grupoSel && (
                      <span style={{ color: grupoSel.color, fontWeight: 600 }}>{grupoSel.codigo} · {grupoSel.nombre}</span>
                    )}
                  </ResumenDato>
                  <ResumenDato label="¿Qué ve?">{form.queVe}</ResumenDato>
                </ResumenSeccion>
                <ResumenSeccion titulo="Ubicación" onEditar={() => irA(1)}>
                  <ResumenDato label="Dirección">{form.direccion}</ResumenDato>
                  <ResumenDato label="Barrio">{form.barrio}</ResumenDato>
                  <ResumenDato label="Referencia">{form.puntoReferencia}</ResumenDato>
                  <ResumenDato label="Edificio">{form.noAplicaEdificio ? 'No aplica' : form.edificio}</ResumenDato>
                  <ResumenDato label="Mapa">{form.puntoExacto ? 'Punto exacto marcado' : 'Centro del barrio'}</ResumenDato>
                </ResumenSeccion>
                <ResumenSeccion titulo="Tus datos" onEditar={() => irA(2)}>
                  <ResumenDato label="Nombre">{`${form.nombres} ${form.apellidos}`.trim()}</ResumenDato>
                  <ResumenDato label="Teléfono"><span className="mono">{form.telefono}</span></ResumenDato>
                </ResumenSeccion>
                <ResumenSeccion titulo="Evidencia" onEditar={() => irA(3)}>
                  <ResumenDato label="Archivos">
                    {archivos.length ? `${archivos.length} adjunto${archivos.length > 1 ? 's' : ''}` : 'Sin archivos'}
                  </ResumenDato>
                </ResumenSeccion>
                {!esValido && (
                  <p className="faltantes" role="alert">Para enviar falta completar: {faltantes.join(', ')}.</p>
                )}
              </div>
            )}
          </div>

          <footer className="tarjeta__pie">
            {paso > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={() => irA(paso - 1)}>
                <ArrowLeft size={16} /> Atrás
              </button>
            ) : <span />}
            {paso < PASOS.length - 1 ? (
              <button type="submit" className="btn btn--primary btn--lg">
                Continuar <ArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" className="btn btn--primary btn--lg" disabled={!esValido}>
                <Send size={18} /> Enviar reporte
              </button>
            )}
          </footer>
        </form>
      </main>

      {mostrarTips && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="tips-titulo" onClick={() => setMostrarTips(false)}>
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal__encabezado">
              <span className="modal__icono"><Lightbulb size={20} /></span>
              <h3 id="tips-titulo">Cómo tomar fotos y videos útiles</h3>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setMostrarTips(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <ol className="modal__lista">
              <li><strong>Tu seguridad primero.</strong> No te acerques al fuego, humo, cables o agua.</li>
              <li><strong>Una toma abierta</strong> del lugar y otra más cercana del problema.</li>
              <li><strong>Una referencia visible:</strong> placa, fachada o letrero.</li>
              <li><strong>Video en horizontal,</strong> máximo 30 segundos y sin moverte mucho.</li>
              <li><strong>Si hay heridos,</strong> muestra cuántas personas hay, sin exponer su rostro.</li>
            </ol>
            <button type="button" onClick={() => setMostrarTips(false)} className="btn btn--primary btn--block">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumenSeccion({ titulo, onEditar, children }) {
  return (
    <section className="resumen__seccion">
      <div className="resumen__encabezado">
        <h3>{titulo}</h3>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onEditar}>
          <Pencil size={14} /> Editar
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

function ResumenDato({ label, children }) {
  return (
    <div className="resumen__dato">
      <dt>{label}</dt>
      <dd>{children || <span className="texto-falta">Falta</span>}</dd>
    </div>
  );
}
