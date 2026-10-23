export const INICIAL_CALIDAD = {
  lote: '',
  producto: '',
  fechaInspeccion: '',
  tecnico: '',
  pesoEspecificado: '',
  pesoRegistrado: '',
  humedad: '',
  color: '',
  textura: '',
  sabor: '',
  resultado: '',
  observaciones: '',
}

export const OPCIONES_CALIDAD = {
  color: [
    ['dorado_uniforme', 'Dorado uniforme'],
    ['palido', 'Pálido'],
    ['quemado', 'Quemado'],
    ['disparejo', 'Disparejo / con manchas'],
  ],
  textura: [
    ['esponjoso', 'Esponjoso'],
    ['duro', 'Duro'],
    ['seco', 'Seco'],
    ['gomoso', 'Gomoso'],
    ['compacto', 'Compacto / apelmazado'],
  ],
  sabor: [
    ['caracteristico', 'Característico'],
    ['acido', 'Ácido'],
    ['amargo', 'Amargo'],
    ['insipido', 'Insípido'],
    ['salado', 'Demasiado salado'],
    ['rancio', 'Rancio'],
  ],
}

export function evaluarCalidad(datos) {
  const estados = {}
  const esperado = Number(datos.pesoEspecificado)
  const registrado = Number(datos.pesoRegistrado)

  if (
    datos.pesoEspecificado !== '' &&
    datos.pesoRegistrado !== '' &&
    Number.isFinite(esperado) &&
    Number.isFinite(registrado) &&
    esperado > 0 &&
    registrado > 0
  ) {
    estados.peso =
      Math.abs(registrado - esperado) <= esperado * 0.05
  }

  const humedad = Number(datos.humedad)

  if (
    datos.humedad !== '' &&
    Number.isFinite(humedad) &&
    humedad >= 0 &&
    humedad <= 100
  ) {
    estados.humedad = humedad >= 35 && humedad <= 40
  }

  for (const [campo, aceptable] of [
    ['color', 'dorado_uniforme'],
    ['textura', 'esponjoso'],
    ['sabor', 'caracteristico'],
  ]) {
    if (datos[campo]) {
      estados[campo] = datos[campo] === aceptable
    }
  }

  return estados
}

export function validarCalidad(datos, productos, original = null) {
  const errores = {}

  if (!/^[A-Za-z0-9-]{3,}$/.test(datos.lote.trim())) {
    errores.lote = 'Usa al menos 3 letras, números o guiones.'
  }

  const existeProducto = productos.some(
    (producto) => producto.valor === datos.producto,
  )
  const conservaProducto =
    original !== null && datos.producto === original.producto

  if (!datos.producto || (!existeProducto && !conservaProducto)) {
    errores.producto = 'Selecciona un producto del catálogo.'
  }

  if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]{3,}$/.test(datos.tecnico.trim())) {
    errores.tecnico = 'Ingresa al menos 3 letras.'
  }

  const fecha = new Date(`${datos.fechaInspeccion}T00:00:00`)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  if (!datos.fechaInspeccion || Number.isNaN(fecha.getTime())) {
    errores.fechaInspeccion = 'Selecciona una fecha.'
  } else if (fecha > hoy) {
    errores.fechaInspeccion = 'La fecha no puede ser futura.'
  }

  const evaluaPeso =
    datos.pesoEspecificado !== '' || datos.pesoRegistrado !== ''

  if (evaluaPeso) {
    for (const campo of ['pesoEspecificado', 'pesoRegistrado']) {
      if (
        datos[campo] === '' ||
        !Number.isFinite(Number(datos[campo])) ||
        Number(datos[campo]) <= 0
      ) {
        errores[campo] = 'Ingresa un peso mayor que cero.'
      }
    }
  }

  if (
    datos.humedad !== '' &&
    (
      !Number.isFinite(Number(datos.humedad)) ||
      Number(datos.humedad) < 0 ||
      Number(datos.humedad) > 100
    )
  ) {
    errores.humedad = 'Ingresa un porcentaje entre 0 y 100.'
  }

  for (const campo of ['color', 'textura', 'sabor']) {
    if (
      datos[campo] &&
      !OPCIONES_CALIDAD[campo].some(
        ([valor]) => valor === datos[campo],
      )
    ) {
      errores[campo] = 'Selecciona una opción válida.'
    }
  }

  if (
    !evaluaPeso &&
    datos.humedad === '' &&
    !datos.color &&
    !datos.textura &&
    !datos.sabor
  ) {
    errores.parametros = 'Completa al menos un parámetro de calidad.'
  }

  if (!['Conforme', 'No_conforme'].includes(datos.resultado)) {
    errores.resultado = 'Selecciona un resultado.'
  } else if (
    datos.resultado === 'Conforme' &&
    Object.values(evaluarCalidad(datos)).includes(false)
  ) {
    errores.resultado = 'Hay parámetros que no cumplen.'
  }

  if (
    datos.resultado === 'No_conforme' &&
    !datos.observaciones.trim()
  ) {
    errores.observaciones = 'Indica el defecto o la acción correctiva.'
  }

  return errores
}