import { useState } from 'react';
import {
  X, Phone, MessageSquare, ShieldCheck, Ban, Truck, Flag, ExternalLink, MapPin, User, Check, Lock,
} from 'lucide-react';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import { iconoDeGrupo } from '../data/gruposInfo';
import { UNIDADES, COLOR_ESTADO, formatoFechaHora } from '../data/estados';
import HistorialEstados from './HistorialEstados';

// Miniatura de una evidencia. Las URLs blob solo viven en la pestaña donde se crearon,
// así que si ya no existe se muestra un aviso en lugar de una imagen rota.
function Evidencia({ archivo, indice }) {
  const [rota, setRota] = useState(false);
  if (rota) return <div className="ops-evidencia ops-evidencia--rota">No disponible</div>;
  const esVideo = archivo.tipo?.startsWith('video');
  return (
    <a href={archivo.url} target="_blank" rel="noreferrer" className="ops-evidencia" title="Abrir en tamaño completo">
      {esVideo ? (
        <video src={archivo.url} muted onError={() => setRota(true)} />
      ) : (
        <img src={archivo.url} alt={`Evidencia ${indice + 1}`} onError={() => setRota(true)} />
      )}
    </a>
  );
}

function Dato({ label, children }) {
  return (
    <div className="ops-dato">
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
    </div>
  );
}

// Un paso del flujo del operador: hecho, actual o bloqueado.
function PasoFlujo({ numero, titulo, estado, children }) {
  return (
    <div className={`ops-flujo__paso ops-flujo__paso--${estado}`}>
      <div className="ops-flujo__marca">
        {estado === 'hecho' ? <Check size={13} strokeWidth={3} /> : estado === 'bloqueado' ? <Lock size={11} /> : numero}
      </div>
      <div className="ops-flujo__contenido">
        <h4 className="ops-flujo__titulo">{titulo}</h4>
        {children}
      </div>
    </div>
  );
}

// Detalle del reporte seleccionado y acciones del operador:
// contactar -> validar/descartar -> despachar -> cerrar.
// El padre lo monta con key={reporte.id} para reiniciar el estado local al cambiar de reporte.
export default function DetalleReporte({ reporte, onActualizar, onCerrarDetalle }) {
  const [grupoCorregido, setGrupoCorregido] = useState(String(reporte.grupo));
  const [unidad, setUnidad] = useState('');
  const [motivoDescarte, setMotivoDescarte] = useState('Falso');

  const { lat, lng } = reporte.ubicacionMapa;
  const grupo = GRUPOS.find((g) => g.codigo === reporte.grupo);
  const color = colorDeGrupo(reporte.grupo);
  const Icono = iconoDeGrupo(reporte.grupo);
  const { estado } = reporte;
  const inactivo = estado === 'Cerrado' || estado === 'Descartado';
  const puedeDespachar = estado === 'Validado';

  const validar = () => {
    const nuevo = Number(grupoCorregido);
    const extra = nuevo !== reporte.grupo ? { grupo: nuevo, grupoOriginal: reporte.grupo } : {};
    onActualizar('Validado', extra);
  };

  // Estado visual de cada paso del flujo.
  const pasoValidar = estado === 'Recibido' ? 'actual' : 'hecho';
  const pasoDespachar =
    estado === 'Validado' ? 'actual' : ['Unidad despachada', 'Cerrado'].includes(estado) ? 'hecho' : 'bloqueado';
  const pasoCerrar = estado === 'Unidad despachada' ? 'actual' : estado === 'Cerrado' ? 'hecho' : 'bloqueado';

  return (
    <section className="ops-detalle" aria-label="Detalle del reporte" style={{ '--grupo': color }}>
      <header className="ops-detalle__cabecera">
        <span className="ops-detalle__icono"><Icono size={20} /></span>
        <div className="ops-detalle__titulos">
          <h2 className="ops-detalle__radicado mono">{reporte.radicado ?? 'Reporte'}</h2>
          <p className="ops-detalle__grupo">{reporte.grupo} · {grupo?.nombre}</p>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCerrarDetalle} aria-label="Cerrar detalle">
          <X size={18} />
        </button>
      </header>

      <div className="ops-detalle__estado">
        <span className="ops-estado ops-estado--grande" style={{ '--estado': COLOR_ESTADO[estado] }}>
          <span className="chip__dot" /> {estado}
        </span>
        {reporte.unidadDespachada && <span className="ops-detalle__unidad"><Truck size={14} /> {reporte.unidadDespachada}</span>}
        <span className="ops-detalle__hora mono">{formatoFechaHora(reporte.fecha)}</span>
      </div>

      <div className="ops-detalle__scroll">
        {/* ---------- Flujo de atención ---------- */}
        <div className="ops-flujo">
          <PasoFlujo numero={1} titulo="Contactar al ciudadano" estado={inactivo ? 'hecho' : 'actual'}>
            <div className="ops-acciones-2">
              <a href={`tel:${reporte.telefono}`} className="btn btn--primary btn--sm">
                <Phone size={14} /> Llamar
              </a>
              <button
                type="button"
                onClick={() => onActualizar(null, { requiereInfo: true })}
                className="btn btn--secondary btn--sm"
                disabled={inactivo || reporte.requiereInfo}
              >
                <MessageSquare size={14} /> {reporte.requiereInfo ? 'Info solicitada' : 'Pedir más info'}
              </button>
            </div>
          </PasoFlujo>

          <PasoFlujo numero={2} titulo="Validar o descartar" estado={pasoValidar}>
            {estado === 'Recibido' ? (
              <>
                <label className="ops-label" htmlFor="corregir-grupo">Grupo (puede corregirlo)</label>
                <select
                  id="corregir-grupo"
                  className="ops-select"
                  value={grupoCorregido}
                  onChange={(e) => setGrupoCorregido(e.target.value)}
                >
                  {GRUPOS.map((g) => (
                    <option key={g.codigo} value={g.codigo}>{g.codigo} - {g.nombre}</option>
                  ))}
                </select>
                <button type="button" onClick={validar} className="btn btn--success btn--sm btn--block">
                  <ShieldCheck size={14} /> Validar caso
                </button>
                <div className="ops-acciones-2">
                  <select
                    className="ops-select"
                    value={motivoDescarte}
                    onChange={(e) => setMotivoDescarte(e.target.value)}
                    aria-label="Motivo de descarte"
                  >
                    <option value="Falso">Falso</option>
                    <option value="Duplicado">Duplicado</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => onActualizar('Descartado', { motivoDescarte })}
                    className="btn btn--danger-outline btn--sm"
                  >
                    <Ban size={14} /> Descartar
                  </button>
                </div>
              </>
            ) : (
              <p className="ops-nota">
                {estado === 'Descartado' ? `Descartado · ${reporte.motivoDescarte ?? 'sin motivo'}` : 'Caso validado'}
                {reporte.grupoOriginal && ` · grupo corregido (el ciudadano reportó ${reporte.grupoOriginal})`}
              </p>
            )}
          </PasoFlujo>

          {estado !== 'Descartado' && (
            <PasoFlujo numero={3} titulo="Despachar unidad" estado={pasoDespachar}>
              {pasoDespachar === 'hecho' ? (
                <p className="ops-nota">Despachada: {reporte.unidadDespachada ?? '—'}</p>
              ) : (
                <>
                  <div className="ops-unidades" role="radiogroup" aria-label="Unidad a despachar">
                    {UNIDADES.map((u) => (
                      <button
                        key={u}
                        type="button"
                        role="radio"
                        aria-checked={unidad === u}
                        className={`ops-unidad ${unidad === u ? 'ops-unidad--activa' : ''}`}
                        onClick={() => setUnidad(u)}
                        disabled={!puedeDespachar}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => onActualizar('Unidad despachada', { unidadDespachada: unidad })}
                    className="btn btn--primary btn--sm btn--block"
                    disabled={!puedeDespachar || !unidad}
                  >
                    <Truck size={14} /> {unidad ? `Despachar ${unidad}` : 'Elige una unidad'}
                  </button>
                  {!puedeDespachar && <p className="ops-nota ops-nota--tenue">Debe validar el caso antes de despachar.</p>}
                </>
              )}
            </PasoFlujo>
          )}

          {estado !== 'Descartado' && (
            <PasoFlujo numero={4} titulo="Cerrar caso" estado={pasoCerrar}>
              {pasoCerrar === 'hecho' ? (
                <p className="ops-nota">Caso cerrado</p>
              ) : (
                <button
                  type="button"
                  onClick={() => onActualizar('Cerrado')}
                  className="btn btn--secondary btn--sm btn--block"
                  disabled={estado !== 'Unidad despachada'}
                >
                  <Flag size={14} /> Cerrar caso
                </button>
              )}
            </PasoFlujo>
          )}
        </div>

        {/* ---------- Información ---------- */}
        <h3 className="ops-seccion">Emergencia</h3>
        <p className="ops-quever">“{reporte.queVe}”</p>

        {reporte.grupo === 300 && (reporte.edad || reporte.sexo || reporte.consciente || reporte.respira) && (
          <dl className="ops-datos ops-datos--medico">
            <Dato label="Edad">{reporte.edad}</Dato>
            <Dato label="Sexo">{reporte.sexo}</Dato>
            <Dato label="¿Consciente?">{reporte.consciente}</Dato>
            <Dato label="¿Respira?">{reporte.respira}</Dato>
          </dl>
        )}

        <h3 className="ops-seccion"><MapPin size={13} /> Ubicación</h3>
        <dl className="ops-datos">
          <Dato label="Dirección">{reporte.direccion}</Dato>
          <Dato label="Barrio">{reporte.barrio}</Dato>
          <Dato label="Referencia">{reporte.puntoReferencia}</Dato>
          <Dato label="Edificio">{reporte.noAplicaEdificio ? 'No aplica' : reporte.edificio}</Dato>
          <Dato label="Punto">
            <span className="mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
            <span className="ops-tenue"> · {reporte.puntoExacto ? 'marcado por el ciudadano' : 'centro del barrio'}</span>
          </Dato>
        </dl>
        <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">
          <ExternalLink size={14} /> Ver en Google Maps
        </a>

        <h3 className="ops-seccion"><User size={13} /> Ciudadano</h3>
        <dl className="ops-datos">
          <Dato label="Nombre">{reporte.nombres} {reporte.apellidos}</Dato>
          <Dato label="Teléfono"><span className="mono">{reporte.telefono}</span></Dato>
        </dl>

        {reporte.archivos?.length > 0 && (
          <>
            <h3 className="ops-seccion">Evidencia ({reporte.archivos.length})</h3>
            <div className="ops-evidencias">
              {reporte.archivos.map((a, i) => (
                <Evidencia key={a.url} archivo={a} indice={i} />
              ))}
            </div>
          </>
        )}

        <h3 className="ops-seccion">Historial</h3>
        <HistorialEstados historial={reporte.historial} />
      </div>
    </section>
  );
}
