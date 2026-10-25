import { useState } from 'react'
import {
  obtenerInspecciones,
  crearInspeccion,
  actualizarInspeccion,
  eliminarInspeccion,
} from '../services/inspecciones.js'
import { obtenerProductosDisponibles } from '../services/productosDisponibles.js'
import { PRODUCTOS_POR_CATEGORIA } from '../services/validacionOrdenes.js'
import {
  INICIAL_CALIDAD,
  OPCIONES_CALIDAD,
  evaluarCalidad,
  validarCalidad,
} from '../services/validacionCalidad.js'

const CAMPOS_GENERALES = [
  ['lote', 'Código de lote', 'text'],
  ['producto', 'Producto', 'select'],
  ['fechaInspeccion', 'Fecha de inspección', 'date'],
  ['tecnico', 'Técnico responsable', 'text'],
]

const CAMPOS_PARAMETROS = [
  ['pesoEspecificado', 'Peso especificado (g)', 'number'],
  ['pesoRegistrado', 'Peso registrado (g)', 'number'],
  ['humedad', 'Humedad registrada (%)', 'number'],
  ['color', 'Color de corteza', 'select'],
  ['textura', 'Textura', 'select'],
  ['sabor', 'Sabor', 'select'],
]

function cargarInicial() {
  try {
    return {
      registros: obtenerInspecciones(),
      productos: obtenerProductosDisponibles(),
      error: '',
    }
  } catch {
    return {
      registros: [],
      productos: [],
      error: 'No se pudieron cargar las inspecciones o el catálogo.',
    }
  }
}

function ControlCalidad() {
  const [datos, setDatos] = useState(cargarInicial)
  const [formulario, setFormulario] = useState({ ...INICIAL_CALIDAD })
  const [original, setOriginal] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [aviso, setAviso] = useState(null)

  const errores = enviado
    ? validarCalidad(formulario, datos.productos, original)
    : {}

  const estados = evaluarCalidad(formulario)

  function nombreProducto(registro) {
    return datos.productos.find(
      (producto) => producto.valor === registro.producto,
    )?.texto ??
      registro.productoNombre ??
      Object.values(PRODUCTOS_POR_CATEGORIA).flat().find(
        (producto) => producto.valor === registro.producto,
      )?.texto ??
      registro.producto
  }

  function limpiar() {
    setFormulario({ ...INICIAL_CALIDAD })
    setOriginal(null)
    setEnviado(false)
  }

  function cambiar(evento) {
    const { name, value } = evento.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
    setAviso(null)
  }

  function guardar(evento) {
    evento.preventDefault()
    setEnviado(true)
    setAviso(null)

    if (
      Object.keys(
        validarCalidad(formulario, datos.productos, original),
      ).length > 0
    ) {
      return
    }

    const valores = {
      ...formulario,
      lote: formulario.lote.trim().toUpperCase(),
      tecnico: formulario.tecnico.trim(),
      observaciones: formulario.observaciones.trim(),
      productoNombre: nombreProducto(formulario),
    }

    try {
      const registro = original
        ? actualizarInspeccion(original.id, valores)
        : crearInspeccion(valores)

      setDatos((anterior) => ({
        ...anterior,
        registros: original
          ? anterior.registros.map((item) =>
              item.id === original.id ? registro : item,
            )
          : [...anterior.registros, registro],
      }))

      setAviso({
        tipo: 'success',
        texto: original
          ? 'Inspección actualizada.'
          : 'Inspección guardada.',
      })

      limpiar()
    } catch {
      setAviso({
        tipo: 'danger',
        texto: 'No se pudo guardar. Los campos se conservaron.',
      })
    }
  }

  function editar(registro) {
    setFormulario(
      Object.fromEntries(
        Object.keys(INICIAL_CALIDAD).map((campo) => [
          campo,
          String(registro[campo] ?? ''),
        ]),
      ),
    )
    setOriginal(registro)
    setEnviado(false)
    setAviso(null)
    document.getElementById('lote')?.focus()
  }

  function eliminar(registro) {
    if (!window.confirm(`¿Eliminar la inspección de ${registro.lote}?`)) {
      return
    }

    try {
      eliminarInspeccion(registro.id)

      setDatos((anterior) => ({
        ...anterior,
        registros: anterior.registros.filter(
          (item) => item.id !== registro.id,
        ),
      }))

      if (original?.id === registro.id) {
        limpiar()
      }

      setAviso({ tipo: 'success', texto: 'Inspección eliminada.' })
    } catch {
      setAviso({
        tipo: 'danger',
        texto: 'No se pudo eliminar la inspección.',
      })
    }
  }

  function mostrarCampo(nombre, etiqueta, tipo, obligatorio = false) {
    let opciones = OPCIONES_CALIDAD[nombre] ?? []

    if (nombre === 'producto') {
      opciones = datos.productos.map(
        (producto) => [producto.valor, producto.texto],
      )

      if (
        original &&
        !opciones.some(([valor]) => valor === original.producto)
      ) {
        opciones = [
          ...opciones,
          [
            original.producto,
            `${nombreProducto(original)} (fuera del catálogo)`,
          ],
        ]
      }
    }

    if (nombre === 'resultado') {
      opciones = [
        ['Conforme', 'Conforme'],
        ['No_conforme', 'No conforme'],
      ]
    }

    const propiedades = {
      id: nombre,
      name: nombre,
      value: formulario[nombre],
      onChange: cambiar,
      required: obligatorio,
      className: `${
        tipo === 'select' ? 'form-select' : 'form-control'
      }${errores[nombre] ? ' is-invalid' : ''}`,
      'aria-invalid': Boolean(errores[nombre]),
      'aria-describedby': errores[nombre]
        ? `error-${nombre}`
        : undefined,
    }

    const parametro = nombre === 'pesoRegistrado' ? 'peso' : nombre

    return (
      <div
        className={tipo === 'textarea' ? 'col-12' : 'col-12 col-md-6'}
        key={nombre}
      >
        <label htmlFor={nombre} className="form-label">
          {etiqueta}
        </label>

        {tipo === 'select' ? (
          <select {...propiedades}>
            <option value="">
              {obligatorio ? 'Selecciona una opción' : 'Sin evaluar'}
            </option>
            {opciones.map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        ) : tipo === 'textarea' ? (
          <textarea {...propiedades} rows="3" />
        ) : (
          <input
            {...propiedades}
            type={tipo}
            step={tipo === 'number' ? 'any' : undefined}
          />
        )}

        {errores[nombre] && (
          <div id={`error-${nombre}`} className="invalid-feedback">
            {errores[nombre]}
          </div>
        )}

        {estados[parametro] !== undefined && (
          <p
            className={`small mt-2 mb-0 ${
              estados[parametro] ? 'text-success' : 'text-danger'
            }`}
          >
            {estados[parametro] ? 'Cumple' : 'No cumple'}
          </p>
        )}
      </div>
    )
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2>Control de calidad</h2>
        <p>Registra y consulta las inspecciones de los lotes.</p>

        {(datos.error || aviso) && (
          <div
            className={`alert alert-${datos.error ? 'danger' : aviso.tipo}`}
            role={datos.error || aviso?.tipo === 'danger' ? 'alert' : 'status'}
          >
            {datos.error || aviso.texto}
          </div>
        )}

        <h3 className="h5 mt-4">
          {original ? 'Editar inspección' : 'Nueva inspección'}
        </h3>

        <form onSubmit={guardar} noValidate>
          <div className="row g-3">
            {CAMPOS_GENERALES.map(([nombre, etiqueta, tipo]) =>
              mostrarCampo(nombre, etiqueta, tipo, true),
            )}
          </div>

          <fieldset className="border rounded p-3 mt-4">
            <legend className="float-none w-auto px-2 fs-6 fw-bold">
              Parámetros de calidad
            </legend>

            <p className="small">
              Completa al menos uno. Peso: tolerancia ±5 %.
              Humedad: rango aceptable de 35 a 40 %.
            </p>

            {errores.parametros && (
              <p className="text-danger small" role="alert">
                {errores.parametros}
              </p>
            )}

            <div className="row g-3">
              {CAMPOS_PARAMETROS.map(([nombre, etiqueta, tipo]) =>
                mostrarCampo(nombre, etiqueta, tipo),
              )}
            </div>
          </fieldset>

          <div className="row g-3 mt-2">
            {mostrarCampo('resultado', 'Resultado', 'select', true)}
            {mostrarCampo(
              'observaciones',
              'Observaciones / acciones correctivas',
              'textarea',
              formulario.resultado === 'No_conforme',
            )}
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              type="submit"
              className="btn"
              disabled={Boolean(datos.error)}
              style={{
                backgroundColor: 'var(--cafe-oscuro)',
                color: 'var(--blanco)',
              }}
            >
              {original ? 'Guardar cambios' : 'Guardar inspección'}
            </button>

            {original && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  limpiar()
                  setAviso(null)
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        <hr className="my-4" />

        <h3 className="h5">
          Inspecciones registradas ({datos.registros.length})
        </h3>

        {datos.error ? (
          <p>No se pudieron cargar los registros.</p>
        ) : datos.registros.length === 0 ? (
          <p>No hay inspecciones registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <caption>Inspecciones guardadas en este navegador.</caption>
              <thead>
                <tr>
                  {[
                    'Lote', 'Producto', 'Fecha', 'Técnico',
                    'Resultado', 'Observaciones', 'Acciones',
                  ].map((titulo) => (
                    <th scope="col" key={titulo}>{titulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.registros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.lote}</td>
                    <td>{nombreProducto(registro)}</td>
                    <td>{registro.fechaInspeccion}</td>
                    <td>{registro.tecnico}</td>
                    <td>
                      {registro.resultado === 'Conforme'
                        ? 'Conforme'
                        : 'No conforme'}
                    </td>
                    <td>{registro.observaciones || '—'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => editar(registro)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => eliminar(registro)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default ControlCalidad