import { useState } from 'react'
import { obtenerOrdenes } from '../data/ordenes.js'
import { obtenerInspecciones } from '../data/inspecciones.js'
import { obtenerCatalogo } from '../data/catalogo.js'
import {
  obtenerNombresProductos,
  resolverNombreProducto,
} from '../data/nombresProductos.js'

const TIPOS = {
  ordenes: {
    titulo: 'Órdenes de producción',
    fecha: 'fechaProduccion',
    columnas: [
      ['codigo', 'Código'],
      ['productoNombre', 'Producto'],
      ['cantidad', 'Unidades programadas'],
      ['pesoUnidad', 'Peso por unidad (g)'],
      ['fechaProduccion', 'Fecha de producción'],
      ['estado', 'Estado'],
      ['prioridad', 'Prioridad'],
    ],
  },
  inspecciones: {
    titulo: 'Inspecciones de calidad',
    fecha: 'fechaInspeccion',
    columnas: [
      ['lote', 'Lote'],
      ['productoNombre', 'Producto'],
      ['fechaInspeccion', 'Fecha de inspección'],
      ['tecnico', 'Técnico'],
      ['resultado', 'Resultado'],
      ['observaciones', 'Observaciones'],
    ],
  },
  productos: {
    titulo: 'Existencias de productos',
    columnas: [
      ['codigo', 'Código'],
      ['nombre', 'Nombre'],
      ['categoria', 'Categoría'],
      ['tiempo', 'Tiempo (min)'],
      ['precio', 'Precio (CLP)'],
      ['stock', 'Stock actual'],
    ],
  },
  ingredientes: {
    titulo: 'Existencias de ingredientes',
    columnas: [
      ['codigo', 'Código'],
      ['nombre', 'Nombre'],
      ['unidad', 'Unidad'],
      ['stock', 'Stock actual'],
      ['minimo', 'Stock mínimo'],
      ['estadoStock', 'Estado'],
    ],
  },
}

function fechaLocal(fecha = new Date()) {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-')
}

function cargarDatos() {
  const productos = obtenerNombresProductos()

  function conNombre(registro) {
    return {
      ...registro,
      productoNombre: resolverNombreProducto(registro, productos),
    }
  }

  return {
    ordenes: obtenerOrdenes().map(conNombre),
    inspecciones: obtenerInspecciones().map((registro) => ({
      ...conNombre(registro),
      resultado: registro.resultado === 'No_conforme'
        ? 'No conforme'
        : registro.resultado,
    })),
    productos: obtenerCatalogo('productos'),
    ingredientes: obtenerCatalogo('ingredientes').map((registro) => ({
      ...registro,
      estadoStock: registro.stock < registro.minimo
        ? 'Bajo stock'
        : 'OK',
    })),
  }
}

function cargarInicial() {
  try {
    return { datos: cargarDatos(), error: '' }
  } catch {
    return {
      datos: null,
      error: 'No se pudieron leer los datos para los reportes.',
    }
  }
}

function celdaCSV(valor) {
  let texto = String(valor ?? '')

  if (/^\s*[=+\-@]/.test(texto)) {
    texto = `'${texto}`
  }

  return `"${texto.replaceAll('"', '""')}"`
}

function Reportes() {
  const [fuente, setFuente] = useState(cargarInicial)
  const [tipo, setTipo] = useState('ordenes')
  const [inicio, setInicio] = useState(() => {
    const fecha = new Date()
    fecha.setDate(1)
    return fechaLocal(fecha)
  })
  const [fin, setFin] = useState(() => fechaLocal())
  const [reporte, setReporte] = useState(null)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')

  const datos = fuente.datos
  const usaFechas = Boolean(TIPOS[tipo].fecha)

  const indicadores = datos ? [
    ['Órdenes registradas', datos.ordenes.length],
    [
      'Unidades programadas',
      datos.ordenes.reduce(
        (total, orden) => total + Number(orden.cantidad),
        0,
      ),
    ],
    [
      'Inspecciones no conformes',
      datos.inspecciones.filter(
        (registro) => registro.resultado === 'No conforme',
      ).length,
    ],
    [
      'Ingredientes bajo stock',
      datos.ingredientes.filter(
        (registro) => registro.stock < registro.minimo,
      ).length,
    ],
  ] : []

  function limpiarReporte() {
    setReporte(null)
    setErrores({})
    setMensaje('')
  }

  function generar(evento) {
    evento.preventDefault()
    setReporte(null)
    setMensaje('')

    const nuevosErrores = {}

    if (usaFechas) {
      if (!inicio) nuevosErrores.inicio = 'Selecciona una fecha.'
      if (!fin) nuevosErrores.fin = 'Selecciona una fecha.'

      if (inicio && fin && inicio > fin) {
        nuevosErrores.fin = 'Debe ser igual o posterior al inicio.'
      }
    }

    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      return
    }

    try {
      const actuales = cargarDatos()
      const configuracion = TIPOS[tipo]

      const filas = actuales[tipo].filter((registro) => {
        if (!configuracion.fecha) return true
        const fecha = registro[configuracion.fecha]
        return fecha >= inicio && fecha <= fin
      })

      setFuente({ datos: actuales, error: '' })
      setReporte({
        tipo,
        titulo: configuracion.titulo,
        columnas: configuracion.columnas,
        filas,
        periodo: usaFechas
          ? `${inicio} al ${fin}`
          : 'Existencias actuales, sin filtro de fechas',
        generado: new Date().toLocaleString('es-CL'),
      })
    } catch {
      setFuente({
        datos: null,
        error: 'No se pudieron consultar los datos guardados.',
      })
    }
  }

  function descargar() {
    if (!reporte?.filas.length) return

    const lineas = [
      reporte.columnas.map(([, titulo]) => celdaCSV(titulo)).join(';'),
      ...reporte.filas.map((registro) =>
        reporte.columnas.map(
          ([campo]) => celdaCSV(registro[campo]),
        ).join(';'),
      ),
    ]

    const archivo = new Blob(
      ['\uFEFF', lineas.join('\r\n')],
      { type: 'text/csv;charset=utf-8;' },
    )

    const direccion = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')
    enlace.href = direccion
    enlace.download = `pan-del-sur-${reporte.tipo}-${fechaLocal()}.csv`
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    window.setTimeout(() => URL.revokeObjectURL(direccion), 1000)

    setMensaje('Se solicitó la descarga del archivo CSV.')
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2>Reportes</h2>
        <p>Consulta y descarga los registros de Pan del Sur.</p>

        {fuente.error && (
          <div className="alert alert-danger" role="alert">
            {fuente.error}
          </div>
        )}

        {datos && (
          <>
            <h3 className="h5 mt-4">Resumen general actual</h3>
            <div className="row g-3 mb-3">
              {indicadores.map(([titulo, valor]) => (
                <div className="col-12 col-sm-6 col-xl-3" key={titulo}>
                  <div
                    className="rounded p-3 h-100"
                    style={{ backgroundColor: 'var(--bg-pan)' }}
                  >
                    <p className="h3">{valor.toLocaleString('es-CL')}</p>
                    <p className="small mb-0">{titulo}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="small">
              El resumen considera todos los registros.
              Las unidades programadas no representan producción terminada.
            </p>
          </>
        )}

        <hr className="my-4" />
        <h3 className="h5">Generar reporte</h3>

        <form onSubmit={generar} noValidate>
          <label htmlFor="tipo-reporte" className="form-label">
            Tipo de reporte
          </label>
          <select
            id="tipo-reporte"
            className="form-select"
            value={tipo}
            onChange={(evento) => {
              setTipo(evento.target.value)
              limpiarReporte()
            }}
          >
            {Object.entries(TIPOS).map(([clave, configuracion]) => (
              <option key={clave} value={clave}>
                {configuracion.titulo}
              </option>
            ))}
          </select>

          {usaFechas ? (
            <>
              <div className="row g-3 mt-1">
                {[
                  ['inicio', 'Fecha de inicio', inicio, setInicio],
                  ['fin', 'Fecha de término', fin, setFin],
                ].map(([nombre, titulo, valor, actualizar]) => (
                  <div className="col-12 col-md-6" key={nombre}>
                    <label htmlFor={nombre} className="form-label">
                      {titulo}
                    </label>
                    <input
                      id={nombre}
                      type="date"
                      className={`form-control${
                        errores[nombre] ? ' is-invalid' : ''
                      }`}
                      value={valor}
                      required
                      aria-invalid={Boolean(errores[nombre])}
                      aria-describedby={
                        errores[nombre] ? `error-${nombre}` : undefined
                      }
                      onChange={(evento) => {
                        actualizar(evento.target.value)
                        limpiarReporte()
                      }}
                    />
                    {errores[nombre] && (
                      <div
                        id={`error-${nombre}`}
                        className="invalid-feedback"
                      >
                        {errores[nombre]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="small mt-2">
                {tipo === 'ordenes'
                  ? 'Filtro por fecha de producción.'
                  : 'Filtro por fecha de inspección.'}
              </p>
            </>
          ) : (
            <p className="small mt-2">
              Existencias actuales. No hay historial de stock por fecha.
            </p>
          )}

          <button
            type="submit"
            className="btn mt-2"
            style={{
              backgroundColor: 'var(--cafe-oscuro)',
              color: 'var(--blanco)',
            }}
          >
            Generar reporte
          </button>
        </form>

        {reporte && (
          <section className="mt-4 border-top pt-4">
            <h3 className="h5">{reporte.titulo}</h3>
            <p className="mb-1">{reporte.periodo}</p>
            <p className="small">Generado: {reporte.generado}</p>

            {reporte.filas.length === 0 ? (
              <p role="status">No hay registros para esta selección.</p>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary mb-3"
                  onClick={descargar}
                >
                  Descargar CSV
                </button>

                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <caption>
                      {reporte.filas.length} registros encontrados.
                    </caption>
                    <thead>
                      <tr>
                        {reporte.columnas.map(([campo, titulo]) => (
                          <th scope="col" key={campo}>{titulo}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.filas.map((registro) => (
                        <tr key={registro.id}>
                          {reporte.columnas.map(([campo]) => (
                            <td key={campo}>{registro[campo] ?? ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        {mensaje && (
          <p className="text-success mt-3" role="status">{mensaje}</p>
        )}
      </div>
    </section>
  )
}

export default Reportes