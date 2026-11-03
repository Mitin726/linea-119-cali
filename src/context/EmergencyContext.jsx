import { createContext, useState, useEffect } from 'react';
import { GRUPOS } from '../data/grupos';
import { BARRIOS } from '../data/barrios';

export const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('bomberos_119_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bomberos_119_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bomberos_119_reports') {
        setReports(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addReport = (reportData) => {
    const newReport = {
      ...reportData,
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      estado: 'Recibido',
      requiereInfo: false
    };
    setReports(prev => [newReport, ...prev]);
    return newReport.id;
  };

  const updateReportStatus = (id, newStatus, extraData = {}) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, estado: newStatus || report.estado, ...extraData } : report
    ));
  };

  // Simular 50 reportes
  const simular50Reportes = () => {
    const nuevos = Array.from({ length: 50 }).map((_, i) => {
      const barrio = BARRIOS[Math.floor(Math.random() * BARRIOS.length)];
      const grupo = GRUPOS[Math.floor(Math.random() * GRUPOS.length)];
      const estados = ['Recibido', 'Validado', 'Unidad despachada', 'Cerrado'];
      return {
        id: crypto.randomUUID(),
        nombres: `Simulado ${i}`,
        apellidos: 'Prueba',
        telefono: '3000000000',
        grupo: grupo.codigo,
        queVe: 'Incidente generado automáticamente para simulación masiva.',
        direccion: 'Dirección simulada',
        barrio: barrio.nombre,
        puntoReferencia: 'N/A',
        ubicacionMapa: {
          lat: barrio.lat + (Math.random() - 0.5) * 0.02,
          lng: barrio.lng + (Math.random() - 0.5) * 0.02
        },
        fecha: new Date().toISOString(),
        estado: estados[Math.floor(Math.random() * estados.length)],
        requiereInfo: false
      };
    });
    setReports(prev => [...nuevos, ...prev]);
  };

  return (
    <EmergencyContext.Provider value={{ reports, addReport, updateReportStatus, simular50Reportes }}>
      {children}
    </EmergencyContext.Provider>
  );
};