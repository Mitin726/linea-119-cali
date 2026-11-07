import { createContext, useState, useEffect, useContext } from 'react';
import { GRUPOS } from '../data/grupos';
import { BARRIOS } from '../data/barrios';

export const EmergencyContext = createContext();

// Hook de conveniencia para leer el estado global desde cualquier pantalla.
export const useEmergencias = () => useContext(EmergencyContext);

const STORAGE_KEY = 'bomberos_119_reports';

// Radicado corto y legible para el ciudadano (ej. 119-482913).
const generarRadicado = () =>
  `119-${String(Date.now()).slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

const cargarReportes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const EmergencyProvider = ({ children }) => {
  const [reports, setReports] = useState(cargarReportes);

  // Persistencia: cada cambio del estado global se guarda en localStorage.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  // Sincronización entre pestañas (ciudadano y operador) con el evento storage.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setReports(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addReport = (reportData) => {
    const ahora = new Date().toISOString();
    const newReport = {
      ...reportData,
      id: crypto.randomUUID(),
      radicado: generarRadicado(),
      fecha: ahora,
      estado: 'Recibido',
      historial: [{ estado: 'Recibido', fecha: ahora }],
      requiereInfo: false,
    };
    setReports((prev) => [newReport, ...prev]);
    return newReport.id;
  };

  // Cambia el estado (si newStatus no es null) y mezcla datos extra.
  // Cada cambio de estado queda registrado en el historial del reporte.
  const updateReportStatus = (id, newStatus, extraData = {}) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== id) return report;
        const cambiaEstado = newStatus && newStatus !== report.estado;
        return {
          ...report,
          ...extraData,
          estado: newStatus || report.estado,
          historial: cambiaEstado
            ? [...(report.historial ?? []), { estado: newStatus, fecha: new Date().toISOString() }]
            : report.historial ?? [],
        };
      })
    );
  };

  // Modo emergencia masiva: 50 reportes ficticios repartidos por los barrios.
  const simular50Reportes = () => {
    const estados = ['Recibido', 'Validado', 'Unidad despachada', 'Cerrado'];
    const nuevos = Array.from({ length: 50 }).map((_, i) => {
      const barrio = BARRIOS[Math.floor(Math.random() * BARRIOS.length)];
      const grupo = GRUPOS[Math.floor(Math.random() * GRUPOS.length)];
      const fecha = new Date(Date.now() - Math.floor(Math.random() * 60) * 60000).toISOString();
      const estado = estados[Math.floor(Math.random() * estados.length)];
      return {
        id: crypto.randomUUID(),
        radicado: `SIM-${String(i + 1).padStart(3, '0')}`,
        nombres: `Simulado ${i + 1}`,
        apellidos: 'Prueba',
        telefono: '3000000000',
        grupo: grupo.codigo,
        queVe: 'Incidente generado automáticamente para simulación masiva.',
        direccion: 'Dirección simulada',
        barrio: barrio.nombre,
        puntoReferencia: 'N/A',
        edificio: '',
        noAplicaEdificio: true,
        archivos: [],
        ubicacionMapa: {
          lat: barrio.lat + (Math.random() - 0.5) * 0.02,
          lng: barrio.lng + (Math.random() - 0.5) * 0.02,
        },
        fecha,
        estado,
        historial: [{ estado, fecha }],
        requiereInfo: false,
      };
    });
    setReports((prev) => [...nuevos, ...prev]);
  };

  const limpiarReportes = () => setReports([]);

  return (
    <EmergencyContext.Provider
      value={{ reports, addReport, updateReportStatus, simular50Reportes, limpiarReportes }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};
