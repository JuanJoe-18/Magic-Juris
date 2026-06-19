import React, { createContext, useState } from 'react';
import initialMockData from '../data/mockData.json';

export const MockContext = createContext();

export const MockProvider = ({ children }) => {
  const [procesos, setProcesos] = useState(initialMockData.procesos || []);
  const [comunicaciones, setComunicaciones] = useState(initialMockData.comunicaciones || []);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Simular la detección de un cambio judicial y la respuesta de la IA
  const simularEscaneo = () => {
    setIsScanning(true);
    setScanResult(null);

    // Timeout para simular latencia de "Scraping + IA"
    setTimeout(() => {
      setIsScanning(false);
      
      const nuevoProcesoId = procesos.length > 0 ? procesos[0].id : "P-001";
      
      const nuevaActuacion = {
        id: `ACT-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'Auto Manda Seguir Adelante Ejecución',
        resumenAbogado: 'El juzgado ordena continuar con las medidas cautelares y seguir adelante con la ejecución. Requiere acción inmediata para proteger activos.',
        resumenCliente: 'El juez ha ordenado avanzar con tu caso. Es muy urgente que te comuniques con nosotros hoy mismo para evitar consecuencias financieras.',
        criticidad: 'Alta',
        estado: 'Nuevo'
      };

      // Actualizar procesos con la nueva actuación
      setProcesos(prev => prev.map(p => {
        if (p.id === nuevoProcesoId) {
          return {
            ...p,
            estado: 'Medidas Cautelares Activas',
            actuaciones: [nuevaActuacion, ...(p.actuaciones || [])]
          };
        }
        return p;
      }));

      // Registrar la comunicación auditada
      const nuevaCom = {
        id: `COM-${Date.now()}`,
        fecha: new Date().toISOString(),
        proceso: nuevoProcesoId,
        canal: 'WhatsApp (API)',
        destinatario: 'Cliente',
        estado: 'Enviado',
        log: 'Resumen en lenguaje claro generado por IA y notificado exitosamente.'
      };
      setComunicaciones(prev => [nuevaCom, ...prev]);

      setScanResult({
        success: true,
        message: "¡Nueva actuación detectada y procesada por IA!",
        actuacion: nuevaActuacion
      });

    }, 3500); // 3.5 segundos de "escaneo"
  };

  return (
    <MockContext.Provider value={{
      procesos,
      comunicaciones,
      isScanning,
      scanResult,
      simularEscaneo,
      setScanResult
    }}>
      {children}
    </MockContext.Provider>
  );
};
