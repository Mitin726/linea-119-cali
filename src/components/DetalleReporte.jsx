import { useState } from 'react';
import { GRUPOS, colorDeGrupo } from '../data/grupos';
import { UNIDADES, COLOR_ESTADO, formatoFechaHora } from '../data/estados';
import HistorialEstados from './HistorialEstados';

// Miniatura de una evidencia. Las URLs blob solo viven en la pestaña donde se crearon,
// así que si ya no existe se muestra un aviso en lugar de una imagen rota.
function Evidencia({ archivo, indice }) {
  const [rota, setRota] = useState(false);
  if (rota) return <div className="evidencia evidencia--rota">No disponible</div>;
  const esVideo = archivo.tipo?.startsWith('video');
  return (
    <a href={archivo.url} target="_blank" rel="noreferrer" className="evidencia" title="Abrir en tamaño completo">
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
    <div className="dato">
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
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
  const inactivo = reporte.estado === 'Cerrado' || reporte.estado === 'Descartado';
  const puedeDespachar = reporte.estado === 'Validado';

  const validar = () => {
    const nuevo = Number(grupoCorregido);
    const extra = nuevo !== reporte.grupo ? { grupo: nuevo, grupoOriginal: reporte.grupo } : {};
    onActualizar('Validado', extra);
  };

  return (
    <section className="report-detail" aria-label="Detalle del reporte">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">{reporte.radicado ?? 'Reporte'}</h2>
          <span className="estado-chip" style={{ background: COLOR_ESTADO[reporte.estado] }}>
            {reporte.estado}
          </span>
          {reporte.unidadDespachada && <span className="detail-unidad"> · {reporte.unidadDespachada}</span>}
        </div>
        <button type="button" className="btn-cerrar-detalle" onClick={onCerrarDetalle} aria-label="Cerrar detalle">
          ×
        </button>
      </div>

      <h3 className="detail-subtitle">Emergencia</h3>
      <dl className="datos">
        <Dato label="Grupo">
          <span style={{ color: colorDeGrupo(reporte.grupo), fontWeight: 700 }}>
            {reporte.grupo} · {grupo?.nombre}
          </span>
          {reporte.grupoOriginal && (
            <span className="dato-nota"> (corregido, el ciudadano reportó {reporte.grupoOriginal})</span>
          )}
        </Dato>
        <Dato label="¿Qué ve?">{reporte.queVe}</Dato>
        <Dato label="Hora">{formatoFechaHora(reporte.fecha)}</Dato>
        <Dato label="Dirección">{reporte.direccion}</Dato>
        <Dato label="Barrio">{reporte.barrio}</Dato>
        <Dato label="Referencia">{reporte.puntoReferencia}</Dato>
        <Dato label="Edificio">{reporte.noAplicaEdificio ? 'No aplica' : reporte.edificio}</Dato>
        <Dato label="Ubicación">
          {reporte.puntoExacto ? 'Punto marcado por el ciudadano' : 'Centro del barrio'} ·{' '}
          <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">
            Ver en Google Maps
          </a>
        </Dato>
      </dl>

      {reporte.grupo === 300 && (reporte.edad || reporte.sexo || reporte.consciente || reporte.respira) && (
        <div className="bloque-300">
          <strong>Grupo 300 · continuación</strong>
          <p>
            Edad: {reporte.edad || 'N/D'} · Sexo: {reporte.sexo || 'N/D'}
          </p>
          <p>
            ¿Consciente?: {reporte.consciente || 'N/D'} · ¿Respira?: {reporte.respira || 'N/D'}
          </p>
        </div>
      )}

      <h3 className="detail-subtitle">Ciudadano</h3>
      <dl className="datos">
        <Dato label="Nombre">
          {reporte.nombres} {reporte.apellidos}
        </Dato>
        <Dato label="Teléfono">{reporte.telefono}</Dato>
      </dl>

      {reporte.archivos?.length > 0 && (
        <>
          <h3 className="detail-subtitle">Fotos y videos ({reporte.archivos.length})</h3>
          <div className="photo-grid">
            {reporte.archivos.map((a, i) => (
              <Evidencia key={a.url} archivo={a} indice={i} />
            ))}
          </div>
        </>
      )}

      <div className="operator-actions">
        <h3 className="operator-actions-title">1. Contactar</h3>
        <div className="flex-gap">
          <a href={`tel:${reporte.telefono}`} className="btn btn-primary">📞 Llamar</a>
          <button
            type="button"
            onClick={() => onActualizar(null, { requiereInfo: true })}
            className="btn btn-secondary"
            disabled={inactivo || reporte.requiereInfo}
          >
            {reporte.requiereInfo ? 'Info solicitada ✓' : 'Solicitar más info'}
          </button>
        </div>

        <h3 className="operator-actions-title">2. Validar</h3>
        {reporte.estado === 'Recibido' ? (
          <>
            <label className="accion-label" htmlFor="corregir-grupo">Grupo (puede corregirlo)</label>
            <select
              id="corregir-grupo"
              className="filter-select w-100"
              value={grupoCorregido}
              onChange={(e) => setGrupoCorregido(e.target.value)}
            >
              {GRUPOS.map((g) => (
                <option key={g.codigo} value={g.codigo}>
                  {g.codigo} - {g.nombre}
                </option>
              ))}
            </select>
            <button type="button" onClick={validar} className="btn btn-success mt-05">
              ✓ Validar
            </button>

            <div className="descartar">
              <select
                className="filter-select"
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
                className="btn btn-danger"
              >
                ✕ Descartar
              </button>
            </div>
          </>
        ) : (
          <p className="accion-hecha">
            {reporte.estado === 'Descartado'
              ? `Descartado (${reporte.motivoDescarte ?? 'sin motivo'}).`
              : 'Caso validado.'}
          </p>
        )}

        <h3 className="operator-actions-title">3. Despachar</h3>
        {reporte.estado === 'Unidad despachada' || reporte.estado === 'Cerrado' ? (
          <p className="accion-hecha">Unidad despachada: {reporte.unidadDespachada ?? '—'}.</p>
        ) : (
          <>
            <div className="grid-dispatch" role="radiogroup" aria-label="Unidad a despachar">
              {UNIDADES.map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={unidad === u}
                  className={`btn-unidad ${unidad === u ? 'btn-unidad--activa' : ''}`}
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
              className="btn btn-primary mt-05"
              disabled={!puedeDespachar || !unidad}
            >
              🚒 Despachar {unidad}
            </button>
            {!puedeDespachar && (
              <p className="accion-nota">
                {inactivo ? 'El caso ya no está activo.' : 'Debe validar el caso antes de despachar.'}
              </p>
            )}
          </>
        )}

        <h3 className="operator-actions-title">4. Cerrar</h3>
        <button
          type="button"
          onClick={() => onActualizar('Cerrado')}
          className="btn btn-dark"
          disabled={reporte.estado !== 'Unidad despachada'}
        >
          Cerrar caso
        </button>
        {reporte.estado !== 'Unidad despachada' && !inactivo && (
          <p className="accion-nota">Se puede cerrar después de despachar una unidad.</p>
        )}
      </div>

      <h3 className="detail-subtitle">Historial</h3>
      <HistorialEstados historial={reporte.historial} />
    </section>
  );
}
