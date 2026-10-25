import { useState } from 'react'
import { LOTES } from '../services/lotes.js'
import { obtenerInspecciones } from '../services/inspecciones.js'
import {
  obtenerNombresProductos,
  resolverNombreProducto,
} from '../services/nombresProductos.js'
import {
  OPCIONES_CALIDAD,
  evaluarCalidad,
} from '../services/validacionCalidad.js'

function Tabla({ columnas, filas, descripcion }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <caption>{descripcion}</caption>
        <thead>
          <tr>
            {columnas.map(([campo, titulo]) => (
              <th scope="col" key={campo}>{titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr key={fila.id ?? fila.codigo ?? fila.pedido ?? indice}>
              {columnas.map(([campo]) => (
                <td key={campo}>{fila[campo]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const COLUMNAS_CALIDAD = [
  ['parametro', 'Parámetro'],
  ['rango', 'Rango aceptable'],
  ['valor', 'Valor registrado'],
  ['resultado', 'Evaluación'],
]

function FichaInspeccion({ inspeccion }) {
  const estados = evaluarCalidad(inspeccion)
  const filas = []

  if (estados.peso !== undefined) {
    filas.push({
      parametro: 'Peso',
      rango: `${inspeccion.pesoEspecificado} g ±5 %`,
      valor: `${inspeccion.pesoRegistrado} g`,
      resultado: estados.peso ? 'Cumple' : 'No cumple',
    })
  }

  if (estados.humedad !== undefined) {
    filas.push({
      parametro: 'Humedad',
      rango: '35 a 40 %',
      valor: `${inspeccion.humedad} %`,
      resultado: estados.humedad ? 'Cumple' : 'No cumple',
    })
  }

  for (const [campo, titulo] of [
    ['color', 'Color de corteza'],
    ['textura', 'Textura'],
    ['sabor', 'Sabor'],
  ]) {
    if (inspeccion[campo]) {
      filas.push({
        parametro: titulo,
        rango: OPCIONES_CALIDAD[campo][0][1],
        valor: OPCIONES_CALIDAD[campo].find(
          ([valor]) => valor === inspeccion[campo],
        )?.[1] ?? inspeccion[campo],
        resultado: estados[campo] ? 'Cumple' : 'No cumple',
      })
    }
  }

  return (
    <article className="border rounded p-3 mb-3">
      <h5 className="h6">
        {inspeccion.fechaInspeccion} — {inspeccion.nombreVisible}
      </h5>

      <p className="mb-1">Técnico: {inspeccion.tecnico}</p>
      <p>
        <strong>
          {inspeccion.resultado === 'Conforme'
            ? 'Conforme'
            : 'No conforme'}
        </strong>
      </p>

      <Tabla
        columnas={COLUMNAS_CALIDAD}
        filas={filas}
        descripcion="Parámetros de la inspección guardada."
      />

      <p className="mb-0">
        <strong>Observaciones: </strong>
        {inspeccion.observaciones || 'Sin observaciones.'}
      </p>
    </article>
  )
}

function Trazabilidad() {
  const [consulta, setConsulta] = useState('')
  const [resultados, setResultados] = useState([])
  const [mensaje, setMensaje] = useState('')

  function buscar(evento) {
    evento.preventDefault()
    setResultados([])
    setMensaje('')

    const codigo = consulta.trim().toUpperCase()

    if (!codigo) {
      setMensaje('Ingresa un código de lote o insumo.')
      return
    }

    try {
      const productos = obtenerNombresProductos()

      const inspecciones = obtenerInspecciones().map((registro) => ({
        ...registro,
        nombreVisible: resolverNombreProducto(registro, productos),
      }))

      const lotesEncontrados = LOTES.filter(
        (lote) =>
          lote.codigo === codigo ||
          lote.insumos.some((insumo) => insumo.codigo === codigo),
      )

      const codigos = new Set(
        lotesEncontrados.map((lote) => lote.codigo),
      )

      if (
        inspecciones.some(
          (registro) => registro.lote.trim().toUpperCase() === codigo,
        )
      ) {
        codigos.add(codigo)
      }

      const fichas = [...codigos].map((codigoLote) => ({
        codigo: codigoLote,
        lote: LOTES.find((lote) => lote.codigo === codigoLote),
        controles: inspecciones.filter(
          (registro) =>
            registro.lote.trim().toUpperCase() === codigoLote,
        ).sort((a, b) =>
          b.fechaInspeccion.localeCompare(a.fechaInspeccion) ||
          String(b.fechaRegistro).localeCompare(String(a.fechaRegistro)),
        ),
      }))

      setResultados(fichas)

      if (fichas.length === 0) {
        setMensaje('No se encontraron registros para ese código.')
      }
    } catch {
      setMensaje('No se pudieron consultar los datos guardados.')
    }
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2>Lotes y trazabilidad</h2>
        <p>Consulta insumos, inspecciones y distribución por lote.</p>

        <form onSubmit={buscar} className="mb-4">
          <label htmlFor="buscar-lote" className="form-label">
            Código de lote o lote de insumo
          </label>

          <div className="d-flex flex-column flex-sm-row gap-2">
            <input
              id="buscar-lote"
              type="search"
              className="form-control"
              value={consulta}
              placeholder="Ejemplo: LOT-20261012-001"
              onChange={(evento) => {
                setConsulta(evento.target.value)
                setResultados([])
                setMensaje('')
              }}
            />
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: 'var(--cafe-oscuro)',
                color: 'var(--blanco)',
              }}
            >
              Buscar
            </button>
          </div>

          <p className="small mt-2">
            Busca un lote registrado en Calidad o el insumo
            HAR-20260920-A del ejemplo original.
          </p>
        </form>

        {mensaje && (
          <div className="alert alert-warning" role="status">
            {mensaje}
          </div>
        )}

        {resultados.map(({ codigo, lote, controles }) => (
          <article className="border rounded p-3 mb-4" key={codigo}>
            <h3 className="h5">Ficha del lote: {codigo}</h3>

            {lote && (
              <div
                className="rounded p-3 my-3"
                style={{ backgroundColor: 'var(--bg-pan)' }}
              >
                <p className="mb-1">
                  <strong>Producto original: </strong>{lote.producto}
                </p>
                <p className="mb-1">
                  <strong>Cantidad: </strong>
                  {lote.cantidad.toLocaleString('es-CL')} unidades
                </p>
                <p className="mb-1">
                  {lote.elaboracion} — {lote.linea}
                </p>
                <p className="small mb-0">
                  Datos de ejemplo de la primera evaluación.
                </p>
              </div>
            )}

            <h4 className="h6 mt-4">1. Insumos utilizados</h4>

            {lote ? (
              <Tabla
                columnas={[
                  ['nombre', 'Insumo'],
                  ['codigo', 'Lote de insumo'],
                  ['proveedor', 'Proveedor'],
                  ['cantidad', 'Cantidad usada'],
                  ['vencimiento', 'Vencimiento'],
                ]}
                filas={lote.insumos}
                descripcion="Insumos del lote de ejemplo original."
              />
            ) : (
              <p>No hay insumos vinculados a este lote.</p>
            )}

            <h4 className="h6 mt-4">2. Control de calidad</h4>

            {controles.length > 0 ? (
              controles.map((inspeccion) => (
                <FichaInspeccion
                  key={inspeccion.id}
                  inspeccion={inspeccion}
                />
              ))
            ) : lote ? (
              <>
                <p className="small">
                  Sin inspecciones guardadas. Se muestran los
                  controles de ejemplo originales.
                </p>
                <Tabla
                  columnas={COLUMNAS_CALIDAD}
                  filas={lote.controlesEjemplo}
                  descripcion="Controles de ejemplo originales."
                />
              </>
            ) : (
              <p>No hay inspecciones guardadas.</p>
            )}

            <h4 className="h6 mt-4">3. Distribución a clientes</h4>

            {lote ? (
              <Tabla
                columnas={[
                  ['cliente', 'Cliente'],
                  ['pedido', 'Pedido / guía'],
                  ['cantidad', 'Unidades'],
                  ['despacho', 'Despacho'],
                ]}
                filas={lote.distribucion}
                descripcion="Distribución del lote de ejemplo original."
              />
            ) : (
              <p>No hay despachos vinculados a este lote.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default Trazabilidad