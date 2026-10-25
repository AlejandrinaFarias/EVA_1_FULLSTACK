import {
  obtenerProductosDisponibles,
  agruparProductos,
} from './productosDisponibles.js'

// Compatibilidad con las pantallas que todavía usan esta lista.
export const PRODUCTOS_POR_CATEGORIA = {
  panaderia: [
    { valor: 'pan_amasado', texto: 'Pan amasado' },
    { valor: 'pan_molde', texto: 'Pan de molde' },
    { valor: 'marraqueta', texto: 'Marraqueta' },
    { valor: 'hallulla', texto: 'Hallulla' },
  ],
  pasteleria: [
    { valor: 'pastel_manzana', texto: 'Pastel de manzana' },
    { valor: 'queque_vainilla', texto: 'Queque de vainilla' },
  ],
}

export const FORMULARIO_INICIAL = {
  codigo: '',
  categoria: '',
  producto: '',
  cantidad: '',
  pesoUnidad: '',
  fechaProduccion: '',
  estado: 'Programado',
  prioridad: '',
}

export function validarOrden(
  datos,
  ordenOriginal = null,
  productos = obtenerProductosDisponibles(),
) {
  const errores = {}
  const grupos = agruparProductos(productos)

  if (!/^[A-Za-z0-9-]{3,}$/.test(datos.codigo.trim())) {
    errores.codigo = 'Usa al menos 3 letras, números o guiones.'
  }

  if (!Object.hasOwn(grupos, datos.categoria)) {
    errores.categoria = 'Selecciona una categoría.'
  }

  const opciones = grupos[datos.categoria] ?? []
  const productoExiste = opciones.some(
    (producto) => producto.valor === datos.producto,
  )

  const conservaProducto =
    ordenOriginal !== null &&
    datos.producto === ordenOriginal.producto &&
    datos.categoria === ordenOriginal.categoria

  if (!productoExiste && !conservaProducto) {
    errores.producto = 'Selecciona un producto del catálogo.'
  }

  const cantidad = Number(datos.cantidad)

  if (
    String(datos.cantidad).trim() === '' ||
    !Number.isInteger(cantidad) ||
    cantidad < 10 ||
    cantidad > 200
  ) {
    errores.cantidad = 'Ingresa entre 10 y 200 unidades enteras.'
  }

  const peso = Number(datos.pesoUnidad)

  if (
    String(datos.pesoUnidad).trim() === '' ||
    !Number.isFinite(peso) ||
    peso <= 0
  ) {
    errores.pesoUnidad = 'Ingresa un peso mayor que cero.'
  }

  const fecha = new Date(`${datos.fechaProduccion}T00:00:00`)
  const manana = new Date()
  manana.setHours(0, 0, 0, 0)
  manana.setDate(manana.getDate() + 1)

  const conservaFecha =
    ordenOriginal !== null &&
    datos.fechaProduccion === ordenOriginal.fechaProduccion

  if (!datos.fechaProduccion || Number.isNaN(fecha.getTime())) {
    errores.fechaProduccion = 'Selecciona una fecha.'
  } else if (!conservaFecha && fecha < manana) {
    errores.fechaProduccion = 'Selecciona desde mañana.'
  }

  if (datos.estado !== 'Programado') {
    errores.estado = 'El estado debe ser Programado.'
  }

  if (!['Baja', 'Media', 'Alta'].includes(datos.prioridad)) {
    errores.prioridad = 'Selecciona una prioridad.'
  }

  return errores
}

export function nombreProducto(categoria, valor) {
  const producto = obtenerProductosDisponibles().find(
    (item) => item.valor === valor,
  )

  return producto?.texto ??
    PRODUCTOS_POR_CATEGORIA[categoria]?.find(
      (item) => item.valor === valor,
    )?.texto ??
    valor
}