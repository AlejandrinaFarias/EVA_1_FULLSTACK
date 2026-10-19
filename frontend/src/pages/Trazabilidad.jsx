import { useState } from 'react'
import { LOTES } from '../data/lotes.js'
import { obtenerInspecciones } from '../data/inspecciones.js'
import { PRODUCTOS_POR_CATEGORIA } from '../data/validacionOrdenes.js'

const PRODUCTOS = Object.values(PRODUCTOS_POR_CATEGORIA).flat()

const ETIQUETAS = {
  dorado_uniforme: 'Dorado uniforme',
  palido: 'Pálido',
  quemado: 'Quemado',
  disparejo: 'Disparejo',
  esponjoso: 'Esponjoso',
  duro: 'Duro',
  seco: 'Seco',
  gomoso: 'Gomoso',
  compacto: 'Compacto',
  caracteristico: 'Característico',
  acido: 'Ácido',
  amargo: 'Amargo',
  insipido: 'Insípido',
  salado: 'Demasiado salado',
  rancio: 'Rancio',
}

function Tabla({ columnas, filas, descripcion }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <caption>{descripcion}</caption>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th scope="col" key={columna.clave}>
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr key={fila.id ?? fila.codigo ?? fila.pedido ?? indice}>
              {columnas.map((columna) => (
                <td key={columna.clave}>
                  {fila[columna.clave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FichaInspeccion({ inspeccion }) {
  const filas = []

  if (
    inspeccion.pesoEspecificado !== '' &&
    inspeccion.pesoRegistrado !== '' &&
    inspeccion.pesoEspecificado != null &&
    inspeccion.pesoRegistrado != null
  ) {
    const esperado = Number(inspeccion.pesoEspecificado)
    const medido = Number(inspeccion.pesoRegistrado)
    const cumple =
      esperado > 0 &&
      Math.abs(medido - esperado) / esperado <= 0.05

    filas.push({
      parametro: 'Peso',
      rango: `${esperado} g ±5 %`,
      valor: `${medido} g`,
      resultado: cumple ? 'Cumple' : 'No cumple',
    })
  }

  if (inspeccion.humedad !== '' && inspeccion.humedad != null) {
    const humedad = Number(inspeccion.humedad)

    filas.push({
      parametro: 'Humedad',
      rango: '35 a 40 %',
      valor: `${humedad} %`,
      resultado:
        humedad >= 35 && humedad <= 40 ? 'Cumple' : 'No cumple',
    })
  }

  for (const [campo, titulo, aceptable] of [
    ['color', 'Color de corteza', 'dorado_uniforme'],
    ['textura', 'Textura', 'esponjoso'],
    ['sabor', 'Sabor', 'caracteristico'],
  ]) {
    if (inspeccion[campo]) {
      filas.push({
        parametro: titulo,
        rango: ETIQUETAS[aceptable],
        valor: ETIQUETAS[inspeccion[campo]] ?? inspeccion[campo],
        resultado:
          inspeccion[campo] === aceptable ? 'Cumple' : 'No cumple',
      })
    }
  }

  return (
    <article className="border rounded p-3 mb-3">
      <div className="d-flex flex-wrap justify-content-between gap-2">
        <h4 className="h6">Inspección: {inspeccion.fechaInspeccion}</h4>
        <span
          className={`badge ${
            inspeccion.resultado === 'Conforme'
              ? 'text-bg-success'
              : 'text-bg-danger'
          }`}
        >
          {inspeccion.resultado === 'Conforme'
            ? 'Conforme'
            : 'No conforme'}
        </span>
      </div>

      <p className="small">Técnico: {inspeccion.tecnico}</p>

      {filas.length > 0 && (
        <Tabla
          columnas={[
            { clave: 'parametro', titulo: 'Parámetro' },
            { clave: 'rango', titulo: 'Rango aceptable' },
            { clave: 'valor', titulo: 'Valor registrado' },
            { clave: 'resultado', titulo: 'Evaluación' },
          ]}
          filas={filas}
          descripcion="Parámetros de la inspección guardada."
        />
      )}

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
      const inspecciones = obtenerInspecciones()

      const lotesEncontrados = LOTES.filter(
        (lote) =>
          lote.codigo === codigo ||
          lote.insumos.some((insumo) => insumo.codigo === codigo),
      )

      const inspeccionesDirectas = inspecciones.filter(
        (inspeccion) =>
          inspeccion.lote.trim().toUpperCase() === codigo,
      )

      const codigos = new Set(
        lotesEncontrados.map((lote) => lote.codigo),
      )

      if (inspeccionesDirectas.length > 0) {
        codigos.add(codigo)
      }

      const fichas = [...codigos].map((codigoLote) => {
        const lote = LOTES.find((item) => item.codigo === codigoLote)

        const controles = inspecciones.filter(
          (inspeccion) =>
            inspeccion.lote.trim().toUpperCase() === codigoLote,
        ).sort((a, b) =>
          b.fechaInspeccion.localeCompare(a.fechaInspeccion) ||
          String(b.fechaRegistro).localeCompare(String(a.fechaRegistro)),
        )

        return { codigo: codigoLote, lote, controles }
      })

      setResultados(fichas)

      if (fichas.length === 0) {
        setMensaje('No se encontraron registros para ese código.')
      }
    } catch {
      setMensaje('No se pudieron consultar las inspecciones guardadas.')
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
              onChange={(evento) => {
                setConsulta(evento.target.value)
                setResultados([])
                setMensaje('')
              }}
              placeholder="Ejemplo: LOT-20261012-001"
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
            También puedes buscar HAR-20260920-A o un lote que hayas
            registrado en Control de calidad.
          </p>
        </form>

        {mensaje && (
          <div className="alert alert-warning" role="status">
            {mensaje}
          </div>
        )}

        {resultados.map(({ codigo, lote, controles }) => {
          const productosInspeccionados = [
            ...new Set(
              controles.map((control) =>
                PRODUCTOS.find(
                  (producto) => producto.valor === control.producto,
                )?.texto ?? control.producto,
              ),
            ),
          ]

          return (
            <article className="border rounded p-3 mb-4" key={codigo}>
              <h3 className="h5">Ficha del lote: {codigo}</h3>

              {lote ? (
                <div className="rounded p-3 mb-3"
                  style={{ backgroundColor: 'var(--bg-pan)' }}
                >
                  <p className="mb-1">
                    <strong>Producto: </strong>{lote.producto}
                  </p>
                  <p className="mb-1">
                    <strong>Cantidad: </strong>
                    {lote.cantidad.toLocaleString('es-CL')} unidades
                  </p>
                  <p className="mb-1">
                    <strong>Elaboración: </strong>
                    {lote.elaboracion} — {lote.linea}
                  </p>
                  <p className="small mb-0">
                    Datos de ejemplo conservados de la primera evaluación.
                  </p>
                </div>
              ) : (
                <p>
                  <strong>Productos inspeccionados: </strong>
                  {productosInspeccionados.join(', ')}
                </p>
              )}

              <h4 className="h6 mt-4">1. Insumos utilizados</h4>

              {lote ? (
                <Tabla
                  columnas={[
                    { clave: 'nombre', titulo: 'Insumo' },
                    { clave: 'codigo', titulo: 'Lote de insumo' },
                    { clave: 'proveedor', titulo: 'Proveedor' },
                    { clave: 'cantidad', titulo: 'Cantidad usada' },
                    { clave: 'vencimiento', titulo: 'Vencimiento' },
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
                    Sin inspecciones guardadas. Se muestran los controles
                    de ejemplo originales.
                  </p>
                  <Tabla
                    columnas={[
                      { clave: 'parametro', titulo: 'Parámetro' },
                      { clave: 'rango', titulo: 'Rango aceptable' },
                      { clave: 'valor', titulo: 'Valor registrado' },
                      { clave: 'resultado', titulo: 'Evaluación' },
                    ]}
                    filas={lote.controlesEjemplo}
                    descripcion="Controles de ejemplo de la primera evaluación."
                  />
                </>
              ) : (
                <p>No hay inspecciones guardadas.</p>
              )}

              <h4 className="h6 mt-4">3. Distribución a clientes</h4>

              {lote ? (
                <Tabla
                  columnas={[
                    { clave: 'cliente', titulo: 'Cliente' },
                    { clave: 'pedido', titulo: 'Pedido / guía' },
                    { clave: 'cantidad', titulo: 'Unidades' },
                    { clave: 'despacho', titulo: 'Despacho' },
                  ]}
                  filas={lote.distribucion}
                  descripcion="Distribución del lote de ejemplo original."
                />
              ) : (
                <p className="mb-0">
                  No hay despachos vinculados a este lote.
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Trazabilidad