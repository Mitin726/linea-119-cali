import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'

const CENTRO_CALI = [3.437, -76.522]

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
// Props:
//   reportes: [{ id, grupo, lat, lng, estado, barrio }]
//   seleccionadoId: id del reporte seleccionado (o null)
//   onSeleccionar: (id) => void
//   estilo: 'calles' | 'oscuro' (capa base con la que arranca el mapa)
export default function MapaOperador({ reportes = [], seleccionadoId = null, onSeleccionar, estilo = 'calles' }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

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

      {reportes.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={crearIcono(colorDeGrupo(r.grupo), {
            seleccionado: r.id === seleccionadoId,
            clases: clasesSegunEstado(r.estado),
          })}
          zIndexOffset={r.id === seleccionadoId ? 1000 : 0}
          eventHandlers={{ click: () => onSeleccionar?.(r.id) }}
        >
          <Popup>
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

      <IrAlSeleccionado reporte={seleccionado} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

// Pulso para los reportes nuevos; apagado (gris) para los que ya no están activos.
function clasesSegunEstado(estado) {
  if (estado === 'Recibido') return 'pin--pulso'
  if (estado === 'Cerrado' || estado === 'Descartado') return 'pin--apagado'
  return ''
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él
// y abre su popup. Depende del id para no volver a volar con cada cambio de estado.
function IrAlSeleccionado({ reporte }) {
  const map = useMap()
  const id = reporte?.id
  useEffect(() => {
    if (!reporte) return
    // En pantallas anchas el detalle tapa el lado derecho del mapa: el punto se centra
    // un poco a la izquierda para que el pin y su popup queden visibles.
    const desplazamiento = window.innerWidth > 860 ? 210 : 0
    const destino = map.unproject(map.project([reporte.lat, reporte.lng], 16).add([desplazamiento, 0]), 16)
    map.flyTo(destino, 16, { duration: 0.8 })
    map.once('moveend', () => {
      map.eachLayer((layer) => {
        const p = layer.getLatLng?.()
        if (layer.openPopup && layer.getPopup?.() && p?.lat === reporte.lat && p?.lng === reporte.lng) {
          layer.openPopup()
        }
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, map])
  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo.
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
      </div>
    </div>
  )
}
