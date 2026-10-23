const CLAVE_INSPECCIONES = 'pan-del-sur-inspecciones'

export function obtenerInspecciones() {
  const contenido = localStorage.getItem(CLAVE_INSPECCIONES)

  if (contenido === null) {
    return []
  }

  const inspecciones = JSON.parse(contenido)

  if (!Array.isArray(inspecciones)) {
    throw new Error('Los datos de inspecciones no son válidos.')
  }

  return inspecciones
}

function guardarInspecciones(inspecciones) {
  localStorage.setItem(
    CLAVE_INSPECCIONES,
    JSON.stringify(inspecciones),
  )
}

export function crearInspeccion(datos) {
  const inspecciones = obtenerInspecciones()

  const nuevaInspeccion = {
    ...datos,
    lote: datos.lote.trim().toUpperCase(),
    tecnico: datos.tecnico.trim(),
    id: crypto.randomUUID(),
    fechaRegistro: new Date().toISOString(),
  }

  guardarInspecciones([...inspecciones, nuevaInspeccion])

  return nuevaInspeccion
}

export function actualizarInspeccion(id, cambios) {
  const inspecciones = obtenerInspecciones()
  const original = inspecciones.find(
    (inspeccion) => inspeccion.id === id,
  )

  if (!original) {
    throw new Error('No se encontró la inspección.')
  }

  const actualizada = {
    ...original,
    ...cambios,
    id: original.id,
    fechaRegistro: original.fechaRegistro,
  }

  guardarInspecciones(
    inspecciones.map((inspeccion) =>
      inspeccion.id === id ? actualizada : inspeccion,
    ),
  )

  return actualizada
}

export function eliminarInspeccion(id) {
  const inspecciones = obtenerInspecciones()

  if (!inspecciones.some((inspeccion) => inspeccion.id === id)) {
    throw new Error('No se encontró la inspección.')
  }

  guardarInspecciones(
    inspecciones.filter((inspeccion) => inspeccion.id !== id),
  )
}