import { obtenerCatalogo } from './catalogo.js'

const VALORES_ANTERIORES = {
  PR001: 'pan_amasado',
  PR002: 'pan_molde',
  PR003: 'marraqueta',
  PR004: 'hallulla',
  PR005: 'pastel_manzana',
  PR006: 'queque_vainilla',
}

export function obtenerProductosDisponibles() {
  return obtenerCatalogo('productos').map((producto) => ({
    ...producto,
    valor: VALORES_ANTERIORES[producto.id] ?? producto.id,
    texto: producto.nombre,
    categoriaOrden:
      producto.categoria === 'Pan' ? 'panaderia' : 'pasteleria',
  }))
}

export function agruparProductos(productos) {
  return {
    panaderia: productos.filter(
      (producto) => producto.categoriaOrden === 'panaderia',
    ),
    pasteleria: productos.filter(
      (producto) => producto.categoriaOrden === 'pasteleria',
    ),
  }
}