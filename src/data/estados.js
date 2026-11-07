// Estados del flujo de un reporte y unidades que puede despachar el operador.
// Recibido → Validado → Unidad despachada → Cerrado (o Descartado)
export const ESTADOS = ['Recibido', 'Validado', 'Unidad despachada', 'Cerrado', 'Descartado']

export const ESTADOS_INACTIVOS = ['Cerrado', 'Descartado']

export const UNIDADES = ['Máquina', 'Rescate', 'Ambulancia', 'HazMat']

export const COLOR_ESTADO = {
  Recibido: '#F59E0B',
  Validado: '#2563EB',
  'Unidad despachada': '#16A34A',
  Cerrado: '#64748B',
  Descartado: '#94A3B8',
}

// Hora corta (ej. "14:05") y fecha + hora para mostrar en pantalla.
export const formatoHora = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

export const formatoFechaHora = (iso) =>
  new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
