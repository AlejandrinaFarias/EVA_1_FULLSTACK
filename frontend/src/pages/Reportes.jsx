import { useState } from 'react'
import { obtenerOrdenes } from '../data/ordenes.js'
import { obtenerInspecciones } from '../data/inspecciones.js'
import { obtenerCatalogo } from '../data/catalogo.js'

const TIPOS = {
  ordenes: {
    titulo: 'Órdenes de producción',
    fecha: 'fechaProduccion',
    columnas: [
      ['codigo', 'Código'],
      ['producto', 'Producto'],
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
      ['producto', 'Producto'],
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
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function cargarDatos() {
  return {
    ordenes: obtenerOrdenes(),
    inspecciones: obtenerInspecciones(),
    productos: obtenerCatalogo('productos'),
    ingredientes: obtenerCatalogo('ingredientes'),
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

  if (/^[\s]*[=+\-@]/.test(texto)) {
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

  const unidadesProgramadas = datos
    ? datos.ordenes.reduce(
        (total, orden) => total + Number(orden.cantidad),
        0,
      )
    : 0

  const noConformes = datos
    ? datos.inspecciones.filter(
        (inspeccion) => inspeccion.resultado === 'No_conforme',
      ).length
    : 0

  const bajoStock = datos
    ? datos.ingredientes.filter(
        (ingrediente) => ingrediente.stock < ingrediente.minimo,
      ).length
    : 0

  function cambiarFiltros() {
    setReporte(null)
    setErrores({})
    setMensaje('')
  }

  function generar(evento) {
    evento.preventDefault()
    setMensaje('')
    setReporte(null)

    const nuevosErrores = {}

    if (usaFechas) {
      if (!inicio) {
        nuevosErrores.inicio = 'Selecciona una fecha.'
      }

      if (!fin) {
        nuevosErrores.fin = 'Selecciona una fecha.'
      }

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
      setFuente({ datos: actuales, error: '' })

      const configuracion = TIPOS[tipo]
      let filas = actuales[tipo]

      if (configuracion.fecha) {
        filas = filas.filter((fila) => {
          const fecha = fila[configuracion.fecha]
          return fecha >= inicio && fecha <= fin
        })
      }

      filas = filas.map((fila) => ({
        ...fila,
        resultado: fila.resultado === 'No_conforme'
          ? 'No conforme'
          : fila.resultado,
        estadoStock: tipo === 'ingredientes'
          ? fila.stock < fila.minimo ? 'Bajo stock' : 'OK'
          : '',
      }))

      setReporte({
        tipo,
        titulo: configuracion.titulo,
        columnas: configuracion.columnas,
        filas,
        periodo: configuracion.fecha
          ? `${inicio} al ${fin}`
          : 'Existencias actuales, sin filtro de fechas',
        generado: new Date().toLocaleString('es-CL'),
      })
    } catch {
      setFuente({
        datos: null,
        error: 'No se pudieron leer los datos. Revisa el almacenamiento.',
      })
    }
  }

  function descargar() {
    if (!reporte || reporte.filas.length === 0) {
      return
    }

    const lineas = [
      reporte.columnas.map(([, titulo]) => celdaCSV(titulo)).join(';'),
      ...reporte.filas.map((fila) =>
        reporte.columnas
          .map(([campo]) => celdaCSV(fila[campo]))
          .join(';'),
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
        <p>Consulta los registros y descarga la información de Pan del Sur.</p>

        {fuente.error && (
          <div className="alert alert-danger" role="alert">
            {fuente.error}
          </div>
        )}

        {datos && (
          <>
            <h3 className="h5 mt-4">Resumen general actual</h3>

            <div className="row g-3 mb-4">
              {[
                ['Órdenes registradas', datos.ordenes.length],
                ['Unidades programadas', unidadesProgramadas],
                ['Inspecciones no conformes', noConformes],
                ['Ingredientes bajo stock', bajoStock],
              ].map(([titulo, valor]) => (
                <div className="col-12 col-sm-6 col-xl-3" key={titulo}>
                  <div
                    className="rounded p-3 h-100"
                    style={{ backgroundColor: 'var(--bg-pan)' }}
                  >
                    <p className="h3 mb-1">
                      {valor.toLocaleString('es-CL')}
                    </p>
                    <p className="small mb-0">{titulo}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="small">
              El resumen considera todos los registros guardados.
              Las unidades programadas no representan producción terminada.
            </p>
          </>
        )}

        <hr className="my-4" />

        <h3 className="h5">Generar reporte</h3>

        <form onSubmit={generar} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="tipo-reporte" className="form-label">
                Tipo de reporte
              </label>
              <select
                id="tipo-reporte"
                className="form-select"
                value={tipo}
                onChange={(evento) => {
                  setTipo(evento.target.value)
                  cambiarFiltros()
                }}
              >
                {Object.entries(TIPOS).map(([clave, configuracion]) => (
                  <option key={clave} value={clave}>
                    {configuracion.titulo}
                  </option>
                ))}
              </select>
            </div>

            {usaFechas ? (
              <>
                <div className="col-12 col-md-6">
                  <label htmlFor="fecha-inicio" className="form-label">
                    Fecha de inicio
                  </label>
                  <input
                    id="fecha-inicio"
                    type="date"
                    className={`form-control${errores.inicio ? ' is-invalid' : ''}`}
                    value={inicio}
                    required
                    aria-invalid={Boolean(errores.inicio)}
                    aria-describedby={errores.inicio ? 'error-inicio' : undefined}
                    onChange={(evento) => {
                      setInicio(evento.target.value)
                      cambiarFiltros()
                    }}
                  />
                  {errores.inicio && (
                    <div id="error-inicio" className="invalid-feedback">
                      {errores.inicio}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="fecha-fin" className="form-label">
                    Fecha de término
                  </label>
                  <input
                    id="fecha-fin"
                    type="date"
                    className={`form-control${errores.fin ? ' is-invalid' : ''}`}
                    value={fin}
                    required
                    aria-invalid={Boolean(errores.fin)}
                    aria-describedby={errores.fin ? 'error-fin' : undefined}
                    onChange={(evento) => {
                      setFin(evento.target.value)
                      cambiarFiltros()
                    }}
                  />
                  {errores.fin && (
                    <div id="error-fin" className="invalid-feedback">
                      {errores.fin}
                    </div>
                  )}
                </div>

                <p className="small mb-0">
                  {tipo === 'ordenes'
                    ? 'Se filtra por fecha de producción.'
                    : 'Se filtra por fecha de inspección.'}
                </p>
              </>
            ) : (
              <p className="small mb-0">
                Este reporte muestra las existencias actuales.
                No hay historial de stock por fecha.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn mt-4"
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
                      {reporte.filas.map((fila) => (
                        <tr key={fila.id}>
                          {reporte.columnas.map(([campo]) => (
                            <td key={campo}>{fila[campo] ?? ''}</td>
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
          <p className="text-success mt-3" role="status">
            {mensaje}
          </p>
        )}
      </div>
    </section>
  )
}

export default Reportes