// src/context/EmergencyContext.jsx
import { createContext, useState, useEffect } from 'react';

export const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  // Inicializar el estado buscando en localStorage
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('bomberos_119_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar automáticamente en localStorage cada vez que reports cambie
  useEffect(() => {
    localStorage.setItem('bomberos_119_reports', JSON.stringify(reports));
  }, [reports]);

  // Sincronizar estado entre múltiples pestañas (Ciudadano / Operador)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bomberos_119_reports') {
        setReports(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función para registrar un nuevo reporte desde la pantalla del ciudadano
  const addReport = (reportData) => {
    const newReport = {
      ...reportData,
      id: crypto.randomUUID(), // Genera un ID único
      fecha: new Date().toISOString(),
      estado: 'Recibido' // Estados inicial obligatorio
    };
    
    setReports(prev => [newReport, ...prev]);
    return newReport.id;
  };

  // Función para que el radio operador cambie el estado del reporte
  const updateReportStatus = (id, newStatus, extraData = {}) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, estado: newStatus, ...extraData } : report
    ));
  };

  return (
    <EmergencyContext.Provider value={{ reports, addReport, updateReportStatus }}>
      {children}
    </EmergencyContext.Provider>
  );
};