import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'

const CENTRO_CALI = [3.437, -76.522]
const ZOOM_DETALLE = 16

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
// Props:
//   reportes: [{ id, grupo, lat, lng, estado, barrio, nombres, apellidos, queVe }]
//   seleccionadoId: id del reporte seleccionado (o null)
//   onSeleccionar: (id) => void
//   estilo: 'calles' | 'oscuro' (capa base con la que arranca el mapa)
export default function MapaOperador({ reportes = [], seleccionadoId = null, onSeleccionar, estilo = 'calles' }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)
  // Referencias a cada marcador (id -> L.Marker) para abrir su popup al seleccionarlo.
  const marcadores = useRef({})

  return (
    <MapContainer center={CENTRO_CALI} zoom={13} style={{ width: '100%', height: '100%' }}>
      {/* Dos estilos de mapa: el operador los cambia con el control de la esquina */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked={estilo === 'calles'} name="Calles (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={estilo === 'oscuro'} name="Oscuro (centro de control)">
          {/* Las teselas oscuras de CARTO ahora piden API key: se usan las de OpenStreetMap
              con un filtro CSS que las oscurece (clase tiles-oscuros en mapa.css). */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="tiles-oscuros"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Emergencia masiva: los reportes cercanos se agrupan en un círculo con el total.
          Al acercarse (zoom 16) se separan y se ve cada pin. */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={45}
        disableClusteringAtZoom={ZOOM_DETALLE}
        showCoverageOnHover={false}
        iconCreateFunction={crearIconoGrupo}
      >
        {reportes.map((r) => (
          <Marker
            key={r.id}
            ref={(m) => {
              if (m) marcadores.current[r.id] = m
              else delete marcadores.current[r.id]
            }}
            position={[r.lat, r.lng]}
            icon={crearIcono(colorDeGrupo(r.grupo), {
              seleccionado: r.id === seleccionadoId,
              clases: clasesSegunEstado(r.estado),
            })}
            zIndexOffset={r.id === seleccionadoId ? 1000 : 0}
            eventHandlers={{ click: () => onSeleccionar?.(r.id) }}
          >
            <Popup maxWidth={240}>
              <div className="popup">
                <div className="popup-grupo" style={{ color: colorDeGrupo(r.grupo) }}>
                  {r.grupo} · {r.barrio}
                </div>
                <div className="popup-nombre">
                  {r.nombres} {r.apellidos}
                </div>
                <div className="popup-quever">{r.queVe}</div>
                <div className="popup-estado">
                  Estado: <strong>{r.estado}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      <IrAlSeleccionado reporte={seleccionado} marcadores={marcadores} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

// Cada estado se ve distinto en el pin:
// Recibido = pulso · Validado = normal · Unidad despachada = anillo · Cerrado/Descartado = gris.
function clasesSegunEstado(estado) {
  if (estado === 'Recibido') return 'pin--pulso'
  if (estado === 'Unidad despachada') return 'pin--despachado'
  if (estado === 'Cerrado' || estado === 'Descartado') return 'pin--apagado'
  return ''
}

// Ícono del grupo de reportes cercanos: muestra el total y se marca en rojo
// si dentro hay reportes Recibidos (pendientes por validar).
function crearIconoGrupo(cluster) {
  const hijos = cluster.getAllChildMarkers()
  const pendientes = hijos.filter((m) => m.options.icon?.options.html?.includes('pin--pulso')).length
  const total = hijos.length
  const tam = total < 10 ? 36 : total < 30 ? 44 : 52
  return L.divIcon({
    className: '',
    html: `<div class="cluster ${pendientes ? 'cluster--pendientes' : ''}" style="width:${tam}px;height:${tam}px">
             <span>${total}</span>
           </div>`,
    iconSize: [tam, tam],
  })
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él
// y abre su popup. Depende del id para no volver a volar con cada cambio de estado.
function IrAlSeleccionado({ reporte, marcadores }) {
  const map = useMap()
  const id = reporte?.id
  useEffect(() => {
    if (!reporte) return
    // En pantallas anchas el detalle tapa el lado derecho del mapa: el punto se centra
    // un poco a la izquierda para que el pin y su popup queden visibles.
    const desplazamiento = window.innerWidth > 860 ? 210 : 0
    const destino = map.unproject(
      map.project([reporte.lat, reporte.lng], ZOOM_DETALLE).add([desplazamiento, 0]),
      ZOOM_DETALLE
    )
    map.flyTo(destino, ZOOM_DETALLE, { duration: 0.8 })
    map.once('moveend', () => {
      // A zoom 16 los grupos ya se separaron, así que el marcador está en el mapa.
      setTimeout(() => marcadores.current[reporte.id]?.openPopup(), 50)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, map])
  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo, y cómo se ve cada estado.
function Leyenda({ reportes }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leyenda">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>REPORTES · {reportes.length}</div>
        {GRUPOS.map((g) => {
          const n = reportes.filter((r) => r.grupo === g.codigo).length
          return (
            <div key={g.codigo} className="leyenda__fila" style={{ opacity: n ? 1 : 0.45 }}>
              <span className="leyenda__punto" style={{ background: g.color }} />
              <span style={{ width: 28, color: '#94a3b8' }}>{g.codigo}</span>
              <span style={{ flex: 1 }}>{g.nombre}</span>
              <strong>{n}</strong>
            </div>
          )
        })}
        <div className="leyenda__estados">
          <span><i className="leyenda__est leyenda__est--pulso" /> Recibido</span>
          <span><i className="leyenda__est" /> Validado</span>
          <span><i className="leyenda__est leyenda__est--anillo" /> Despachada</span>
          <span><i className="leyenda__est leyenda__est--gris" /> Cerrado</span>
        </div>
      </div>
    </div>
  )
}
