const PRODUCTOS = [
  {
    id: 'PR001', codigo: 'PR001', nombre: 'Pan amasado',
    categoria: 'Pan', tiempo: 60, precio: 1500, stock: 2500,
  },
  {
    id: 'PR002', codigo: 'PR002', nombre: 'Pan de molde',
    categoria: 'Pan', tiempo: 45, precio: 2200, stock: 1800,
  },
  {
    id: 'PR003', codigo: 'PR003', nombre: 'Marraqueta',
    categoria: 'Pan', tiempo: 40, precio: 1200, stock: 3000,
  },
  {
    id: 'PR004', codigo: 'PR004', nombre: 'Hallulla',
    categoria: 'Pan', tiempo: 35, precio: 1000, stock: 2800,
  },
  {
    id: 'PR005', codigo: 'PR005', nombre: 'Pastel de manzana',
    categoria: 'Pastelería', tiempo: 90, precio: 6500, stock: 400,
  },
  {
    id: 'PR006', codigo: 'PR006', nombre: 'Queque de vainilla',
    categoria: 'Pastelería', tiempo: 75, precio: 5500, stock: 350,
  },
]

const INGREDIENTES = [
  {
    id: 'ING001', codigo: 'ING001', nombre: 'Harina sin polvos',
    unidad: 'kg', stock: 1200, minimo: 500,
  },
  {
    id: 'ING002', codigo: 'ING002', nombre: 'Levadura fresca',
    unidad: 'kg', stock: 80, minimo: 50,
  },
  {
    id: 'ING003', codigo: 'ING003', nombre: 'Sal',
    unidad: 'kg', stock: 150, minimo: 40,
  },
  {
    id: 'ING004', codigo: 'ING004', nombre: 'Azúcar',
    unidad: 'kg', stock: 300, minimo: 100,
  },
  {
    id: 'ING005', codigo: 'ING005', nombre: 'Mantequilla',
    unidad: 'kg', stock: 45, minimo: 60,
  },
  {
    id: 'ING006', codigo: 'ING006', nombre: 'Huevos',
    unidad: 'unidades', stock: 600, minimo: 300,
  },
  {
    id: 'ING007', codigo: 'ING007', nombre: 'Manzanas',
    unidad: 'kg', stock: 90, minimo: 50,
  },
  {
    id: 'ING008', codigo: 'ING008', nombre: 'Esencia de vainilla',
    unidad: 'litros', stock: 8, minimo: 5,
  },
]

function configuracion(tipo) {
  if (tipo === 'productos') {
    return {
      clave: 'pan-del-sur-productos',
      iniciales: PRODUCTOS,
      numericos: ['tiempo', 'precio', 'stock'],
    }
  }

  if (tipo === 'ingredientes') {
    return {
      clave: 'pan-del-sur-ingredientes',
      iniciales: INGREDIENTES,
      numericos: ['stock', 'minimo'],
    }
  }

  throw new Error('Tipo de catálogo inválido.')
}

export function obtenerCatalogo(tipo) {
  const { clave, iniciales } = configuracion(tipo)
  const contenido = localStorage.getItem(clave)

  if (contenido === null) {
    return iniciales.map((registro) => ({ ...registro }))
  }

  const registros = JSON.parse(contenido)

  if (!Array.isArray(registros)) {
    throw new Error('Los datos del catálogo no son válidos.')
  }

  return registros
}

export function guardarRegistro(tipo, datos, id = null) {
  const { clave, numericos } = configuracion(tipo)
  const registros = obtenerCatalogo(tipo)
  const codigo = datos.codigo.trim().toUpperCase()

  if (
    registros.some(
      (registro) =>
        registro.codigo.toUpperCase() === codigo &&
        registro.id !== id,
    )
  ) {
    throw new Error('Ese código ya existe.')
  }

  if (id !== null && !registros.some((registro) => registro.id === id)) {
    throw new Error('No se encontró el registro.')
  }

  const registro = {
    ...datos,
    codigo,
    nombre: datos.nombre.trim(),
    id: id ?? crypto.randomUUID(),
  }

  for (const campo of numericos) {
    registro[campo] = Number(datos[campo])
  }

  const actualizados = id === null
    ? [...registros, registro]
    : registros.map((item) => item.id === id ? registro : item)

  localStorage.setItem(clave, JSON.stringify(actualizados))

  return actualizados
}

export function eliminarRegistro(tipo, id) {
  const { clave } = configuracion(tipo)
  const registros = obtenerCatalogo(tipo)

  if (!registros.some((registro) => registro.id === id)) {
    throw new Error('No se encontró el registro.')
  }

  const actualizados = registros.filter(
    (registro) => registro.id !== id,
  )

  localStorage.setItem(clave, JSON.stringify(actualizados))

  return actualizados
}