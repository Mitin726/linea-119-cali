// Información visual de cada grupo del protocolo: ícono y ejemplos (tabla del protocolo Despacho V4).
// Los colores siguen viniendo de grupos.js para que sean los mismos en todo el sitio y el mapa.
import { Flame, Bomb, Ambulance, Biohazard, Headset, CloudLightning, CircleHelp } from 'lucide-react';

export const INFO_GRUPO = {
  100: { Icono: Flame, ejemplos: 'Edificación, vehículo, vegetación, basuras' },
  200: { Icono: Bomb, ejemplos: 'Explosión, ruptura de equipos' },
  300: { Icono: Ambulance, ejemplos: 'Accidente de tránsito, personas en ascensor, caída en río' },
  400: { Icono: Biohazard, ejemplos: 'Fuga u olor a gas, línea eléctrica caída, HazMat' },
  500: { Icono: Headset, ejemplos: 'Solicitudes que no son emergencia inmediata' },
  800: { Icono: CloudLightning, ejemplos: 'Inundación, vendaval, sismo' },
  900: { Icono: CircleHelp, ejemplos: 'Lo que no encaja en los demás grupos' },
};

export const iconoDeGrupo = (codigo) => INFO_GRUPO[codigo]?.Icono ?? CircleHelp;
