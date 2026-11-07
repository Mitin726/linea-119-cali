import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../mapa/mapa.css';
import { crearIcono } from '../mapa/iconos.js';

// Escucha los clics sobre el mapa y entrega la coordenada tocada (useMapEvents).
function SelectorPunto({ onSeleccionar }) {
  useMapEvents({
    click(e) {
      onSeleccionar({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Cuando cambia la posición (por ejemplo al elegir un barrio), el mapa se mueve hasta ella.
function SeguirPosicion({ posicion, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([posicion.lat, posicion.lng], zoom, { duration: 0.6 });
  }, [posicion.lat, posicion.lng, zoom, map]);
  return null;
}

// Mini mapa del ciudadano para tocar el punto exacto de la emergencia.
export default function MiniMapa({ posicion, onCambiar, color = '#DC2626' }) {
  return (
    <MapContainer
      center={[posicion.lat, posicion.lng]}
      zoom={15}
      className="mini-mapa"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SelectorPunto onSeleccionar={onCambiar} />
      <SeguirPosicion posicion={posicion} zoom={16} />
      <Marker position={[posicion.lat, posicion.lng]} icon={crearIcono(color, { seleccionado: true })} />
    </MapContainer>
  );
}
