const CLAVE_ORDENES = 'pan-del-sur-ordenes'

export function obtenerOrdenes() {
  const contenido = localStorage.getItem(CLAVE_ORDENES)

  if (contenido === null) {
    return []
  }

  const ordenes = JSON.parse(contenido)

  if (!Array.isArray(ordenes)) {
    throw new Error('Los datos guardados de órdenes no son válidos.')
  }

  return ordenes
}

function guardarOrdenes(ordenes) {
  localStorage.setItem(CLAVE_ORDENES, JSON.stringify(ordenes))
}

export function crearOrden(datos) {
  const ordenes = obtenerOrdenes()

  const nuevaOrden = {
    ...datos,
    codigo: datos.codigo.trim().toUpperCase(),
    cantidad: Number(datos.cantidad),
    pesoUnidad: Number(datos.pesoUnidad),
    id: crypto.randomUUID(),
    fechaRegistro: new Date().toISOString(),
  }

  guardarOrdenes([...ordenes, nuevaOrden])

  return nuevaOrden
}

export function actualizarOrden(id, cambios) {
  const ordenes = obtenerOrdenes()
  const ordenActual = ordenes.find((orden) => orden.id === id)

  if (!ordenActual) {
    throw new Error('No se encontró la orden.')
  }

  const ordenActualizada = {
    ...ordenActual,
    ...cambios,
    id: ordenActual.id,
    fechaRegistro: ordenActual.fechaRegistro,
  }

  guardarOrdenes(
    ordenes.map((orden) =>
      orden.id === id ? ordenActualizada : orden,
    ),
  )

  return ordenActualizada
}

export function eliminarOrden(id) {
  const ordenes = obtenerOrdenes()

  if (!ordenes.some((orden) => orden.id === id)) {
    throw new Error('No se encontró la orden.')
  }

  guardarOrdenes(ordenes.filter((orden) => orden.id !== id))
}