import { useState } from 'react'
import {
  obtenerOrdenes,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
} from '../data/ordenes.js'
import {
  FORMULARIO_INICIAL,
  validarOrden,
  PRODUCTOS_POR_CATEGORIA,
} from '../data/validacionOrdenes.js'
import {
  obtenerProductosDisponibles,
  agruparProductos,
} from '../data/productosDisponibles.js'

const CAMPOS = [
  {
    nombre: 'codigo',
    etiqueta: 'Código de producto',
    tipo: 'text',
  },
  {
    nombre: 'categoria',
    etiqueta: 'Categoría',
    opciones: [
      ['panaderia', 'Panadería'],
      ['pasteleria', 'Pastelería'],
    ],
  },
  {
    nombre: 'producto',
    etiqueta: 'Producto',
    opciones: [],
  },
  {
    nombre: 'cantidad',
    etiqueta: 'Cantidad a producir (unidades)',
    tipo: 'number',
    min: 10,
    max: 200,
    step: 1,
  },
  {
    nombre: 'pesoUnidad',
    etiqueta: 'Peso por unidad (gramos)',
    tipo: 'number',
    step: 'any',
  },
  {
    nombre: 'fechaProduccion',
    etiqueta: 'Fecha de producción',
    tipo: 'date',
  },
  {
    nombre: 'estado',
    etiqueta: 'Estado',
    opciones: [['Programado', 'Programado']],
  },
  {
    nombre: 'prioridad',
    etiqueta: 'Prioridad',
    opciones: [
      ['Baja', 'Baja'],
      ['Media', 'Media'],
      ['Alta', 'Alta'],
    ],
  },
]

function cargarInicial() {
  try {
    return {
      ordenes: obtenerOrdenes(),
      productos: obtenerProductosDisponibles(),
      error: '',
    }
  } catch {
    return {
      ordenes: [],
      productos: [],
      error: 'No se pudieron cargar las órdenes o el catálogo.',
    }
  }
}

function OrdenesProduccion() {
  const [datos, setDatos] = useState(cargarInicial)
  const [formulario, setFormulario] = useState({ ...FORMULARIO_INICIAL })
  const [original, setOriginal] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [aviso, setAviso] = useState(null)

  const errores = enviado
    ? validarOrden(formulario, original, datos.productos)
    : {}

  const grupos = agruparProductos(datos.productos)
  const disponibles = grupos[formulario.categoria] ?? []

  const productoRetirado =
    original !== null &&
    formulario.categoria === original.categoria &&
    !disponibles.some(
      (producto) => producto.valor === original.producto,
    )

  function nombreProducto(orden) {
    return datos.productos.find(
      (producto) => producto.valor === orden.producto,
    )?.texto ??
      orden.productoNombre ??
      PRODUCTOS_POR_CATEGORIA[orden.categoria]?.find(
        (producto) => producto.valor === orden.producto,
      )?.texto ??
      orden.producto
  }

  function limpiar() {
    setFormulario({ ...FORMULARIO_INICIAL })
    setOriginal(null)
    setEnviado(false)
  }

  function cambiar(evento) {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === 'categoria' ? { producto: '' } : {}),
    }))

    setAviso(null)
  }

  function guardar(evento) {
    evento.preventDefault()
    setEnviado(true)
    setAviso(null)

    if (
      Object.keys(
        validarOrden(formulario, original, datos.productos),
      ).length > 0
    ) {
      return
    }

    const seleccionado = datos.productos.find(
      (producto) => producto.valor === formulario.producto,
    )

    const valores = {
      ...formulario,
      codigo: formulario.codigo.trim().toUpperCase(),
      cantidad: Number(formulario.cantidad),
      pesoUnidad: Number(formulario.pesoUnidad),
      productoNombre:
        seleccionado?.texto ??
        original?.productoNombre ??
        nombreProducto(formulario),
    }

    try {
      const registro = original
        ? actualizarOrden(original.id, valores)
        : crearOrden(valores)

      setDatos((anterior) => ({
        ...anterior,
        ordenes: original
          ? anterior.ordenes.map((orden) =>
              orden.id === original.id ? registro : orden,
            )
          : [...anterior.ordenes, registro],
      }))

      setAviso({
        tipo: 'success',
        texto: original
          ? 'Orden actualizada.'
          : 'Orden guardada.',
      })

      limpiar()
    } catch {
      setAviso({
        tipo: 'danger',
        texto: 'No se pudo guardar. Los campos se conservaron.',
      })
    }
  }

  function editar(orden) {
    setOriginal(orden)

    setFormulario(
      Object.fromEntries(
        Object.keys(FORMULARIO_INICIAL).map((campo) => [
          campo,
          String(orden[campo] ?? ''),
        ]),
      ),
    )

    setEnviado(false)
    setAviso(null)
    document.getElementById('codigo')?.focus()
  }

  function eliminar(orden) {
    if (!window.confirm(`¿Eliminar la orden de ${orden.codigo}?`)) {
      return
    }

    try {
      eliminarOrden(orden.id)

      setDatos((anterior) => ({
        ...anterior,
        ordenes: anterior.ordenes.filter(
          (item) => item.id !== orden.id,
        ),
      }))

      if (original?.id === orden.id) {
        limpiar()
      }

      setAviso({ tipo: 'success', texto: 'Orden eliminada.' })
    } catch {
      setAviso({
        tipo: 'danger',
        texto: 'No se pudo eliminar la orden.',
      })
    }
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2>Órdenes de producción</h2>
        <p>
          {original
            ? 'Modifica la orden seleccionada.'
            : 'Completa los datos para registrar una nueva orden.'}
        </p>

        {(datos.error || aviso) && (
          <div
            className={`alert alert-${datos.error ? 'danger' : aviso.tipo}`}
            role={datos.error || aviso?.tipo === 'danger' ? 'alert' : 'status'}
          >
            {datos.error || aviso.texto}
          </div>
        )}

        <h3 className="h5 mt-4">
          {original ? 'Editar orden' : 'Nueva orden'}
        </h3>

        <form onSubmit={guardar} noValidate>
          <div className="row g-3">
            {CAMPOS.map((campo) => {
              const opciones = campo.nombre === 'producto'
                ? disponibles.map((producto) => [
                    producto.valor,
                    producto.texto,
                  ])
                : campo.opciones

              const propiedades = {
                id: campo.nombre,
                name: campo.nombre,
                value: formulario[campo.nombre],
                onChange: cambiar,
                required: true,
                className: `${
                  opciones ? 'form-select' : 'form-control'
                }${errores[campo.nombre] ? ' is-invalid' : ''}`,
                'aria-invalid': Boolean(errores[campo.nombre]),
                'aria-describedby': errores[campo.nombre]
                  ? `error-${campo.nombre}`
                  : undefined,
              }

              return (
                <div
                  className={
                    campo.nombre === 'codigo'
                      ? 'col-12'
                      : 'col-12 col-md-6'
                  }
                  key={campo.nombre}
                >
                  <label htmlFor={campo.nombre} className="form-label">
                    {campo.etiqueta}
                  </label>

                  {opciones ? (
                    <select
                      {...propiedades}
                      disabled={
                        campo.nombre === 'producto' &&
                        !formulario.categoria
                      }
                    >
                      <option value="">Selecciona una opción</option>

                      {campo.nombre === 'producto' && productoRetirado && (
                        <option value={original.producto}>
                          {nombreProducto(original)} (fuera del catálogo)
                        </option>
                      )}

                      {opciones.map(([valor, texto]) => (
                        <option key={valor} value={valor}>
                          {texto}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...propiedades}
                      type={campo.tipo}
                      min={campo.min}
                      max={campo.max}
                      step={campo.step}
                    />
                  )}

                  {errores[campo.nombre] && (
                    <div
                      id={`error-${campo.nombre}`}
                      className="invalid-feedback"
                    >
                      {errores[campo.nombre]}
                    </div>
                  )}
                </div>
              )
            })}
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
              {original ? 'Guardar cambios' : 'Guardar orden'}
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
          Órdenes registradas ({datos.ordenes.length})
        </h3>

        {datos.error ? (
          <p>No se pudieron cargar los registros.</p>
        ) : datos.ordenes.length === 0 ? (
          <p>No hay órdenes registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <caption>Órdenes guardadas en este navegador.</caption>
              <thead>
                <tr>
                  {[
                    'Código', 'Producto', 'Cantidad', 'Peso (g)',
                    'Fecha', 'Estado', 'Prioridad', 'Acciones',
                  ].map((titulo) => (
                    <th scope="col" key={titulo}>{titulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.codigo}</td>
                    <td>{nombreProducto(orden)}</td>
                    <td>{orden.cantidad}</td>
                    <td>{orden.pesoUnidad}</td>
                    <td>{orden.fechaProduccion}</td>
                    <td>{orden.estado}</td>
                    <td>{orden.prioridad}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => editar(orden)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => eliminar(orden)}
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

export default OrdenesProduccion