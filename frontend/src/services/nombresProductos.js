import { obtenerProductosDisponibles } from './productosDisponibles.js'

const NOMBRES_ANTERIORES = {
  pan_amasado: 'Pan amasado',
  pan_molde: 'Pan de molde',
  marraqueta: 'Marraqueta',
  hallulla: 'Hallulla',
  pastel_manzana: 'Pastel de manzana',
  queque_vainilla: 'Queque de vainilla',
}

export function resolverNombreProducto(registro, productos) {
  return productos.find(
    (producto) => producto.valor === registro.producto,
  )?.texto ??
    registro.productoNombre ??
    NOMBRES_ANTERIORES[registro.producto] ??
    registro.producto
}

export function obtenerNombresProductos() {
  return obtenerProductosDisponibles()
}