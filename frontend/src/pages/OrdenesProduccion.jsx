import { useState } from 'react'
import {
  obtenerOrdenes,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
} from '../data/ordenes.js'
import {
  PRODUCTOS_POR_CATEGORIA,
  FORMULARIO_INICIAL,
  validarOrden,
  nombreProducto,
} from '../data/validacionOrdenes.js'

function cargarDatosIniciales() {
  try {
    return { ordenes: obtenerOrdenes(), error: '' }
  } catch {
    return {
      ordenes: [],
      error: 'No se pudieron leer las órdenes guardadas.',
    }
  }
}

function OrdenesProduccion() {
  const [datos, setDatos] = useState(cargarDatosIniciales)
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [ordenOriginal, setOrdenOriginal] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorOperacion, setErrorOperacion] = useState('')

  const editando = ordenOriginal !== null
  const errores = enviado
    ? validarOrden(formulario, ordenOriginal)
    : {}

  const productosDisponibles =
    PRODUCTOS_POR_CATEGORIA[formulario.categoria] ?? []

  function cambiarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === 'categoria' ? { producto: '' } : {}),
    }))

    setMensaje('')
    setErrorOperacion('')
  }

  function limpiarFormulario() {
    setFormulario({ ...FORMULARIO_INICIAL })
    setOrdenOriginal(null)
    setEnviado(false)
  }

  function enviarFormulario(evento) {
    evento.preventDefault()
    setEnviado(true)
    setMensaje('')
    setErrorOperacion('')

    if (
      Object.keys(validarOrden(formulario, ordenOriginal)).length > 0
    ) {
      return
    }

    try {
      if (editando) {
        const cambios = {
          ...formulario,
          codigo: formulario.codigo.trim().toUpperCase(),
          cantidad: Number(formulario.cantidad),
          pesoUnidad: Number(formulario.pesoUnidad),
        }

        const ordenActualizada = actualizarOrden(
          ordenOriginal.id,
          cambios,
        )

        setDatos((anterior) => ({
          ordenes: anterior.ordenes.map((orden) =>
            orden.id === ordenActualizada.id
              ? ordenActualizada
              : orden,
          ),
          error: '',
        }))

        setMensaje('Orden actualizada correctamente.')
      } else {
        const nuevaOrden = crearOrden(formulario)

        setDatos((anterior) => ({
          ordenes: [...anterior.ordenes, nuevaOrden],
          error: '',
        }))

        setMensaje('Orden guardada correctamente.')
      }

      limpiarFormulario()
    } catch {
      setErrorOperacion(
        'No se pudieron guardar los cambios. Los campos se conservaron.',
      )
    }
  }

  function editarOrden(orden) {
    setOrdenOriginal(orden)

    setFormulario({
      codigo: orden.codigo,
      categoria: orden.categoria,
      producto: orden.producto,
      cantidad: String(orden.cantidad),
      pesoUnidad: String(orden.pesoUnidad),
      fechaProduccion: orden.fechaProduccion,
      estado: orden.estado,
      prioridad: orden.prioridad,
    })

    setEnviado(false)
    setMensaje('')
    setErrorOperacion('')

    document.getElementById('codigo')?.focus()
  }

  function cancelarEdicion() {
    limpiarFormulario()
    setMensaje('')
    setErrorOperacion('')
  }

  function borrarOrden(orden) {
    if (!window.confirm(`¿Eliminar la orden de ${orden.codigo}?`)) {
      return
    }

    setMensaje('')
    setErrorOperacion('')

    try {
      eliminarOrden(orden.id)

      setDatos((anterior) => ({
        ordenes: anterior.ordenes.filter(
          (elemento) => elemento.id !== orden.id,
        ),
        error: '',
      }))

      if (ordenOriginal?.id === orden.id) {
        limpiarFormulario()
      }

      setMensaje('Orden eliminada.')
    } catch {
      setErrorOperacion('No se pudo eliminar la orden.')
    }
  }

  function claseCampo(nombre, esSelect = false) {
    const clase = esSelect ? 'form-select' : 'form-control'
    return `${clase}${errores[nombre] ? ' is-invalid' : ''}`
  }

  function mensajeError(nombre) {
    return errores[nombre] ? (
      <div id={`error-${nombre}`} className="invalid-feedback">
        {errores[nombre]}
      </div>
    ) : null
  }

  function atributosError(nombre) {
    return {
      'aria-invalid': Boolean(errores[nombre]),
      'aria-describedby': errores[nombre]
        ? `error-${nombre}`
        : undefined,
    }
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2>Órdenes de producción</h2>
        <p className="mb-4">
          {editando
            ? 'Modifica los datos de la orden seleccionada.'
            : 'Completa los datos para registrar una nueva orden.'}
        </p>

        {mensaje && (
          <div className="alert alert-success" role="status">
            {mensaje}
          </div>
        )}

        {(datos.error || errorOperacion) && (
          <div className="alert alert-danger" role="alert">
            {errorOperacion || datos.error}
          </div>
        )}

        <h3 className="h5 mb-3">
          {editando ? 'Editar orden' : 'Nueva orden'}
        </h3>

        <form onSubmit={enviarFormulario} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="codigo" className="form-label">
                Código de producto
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                className={claseCampo('codigo')}
                value={formulario.codigo}
                onChange={cambiarCampo}
                required
                {...atributosError('codigo')}
              />
              {mensajeError('codigo')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="categoria" className="form-label">
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                className={claseCampo('categoria', true)}
                value={formulario.categoria}
                onChange={cambiarCampo}
                required
                {...atributosError('categoria')}
              >
                <option value="">Selecciona una categoría</option>
                <option value="panaderia">Panadería</option>
                <option value="pasteleria">Pastelería</option>
              </select>
              {mensajeError('categoria')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="producto" className="form-label">
                Producto
              </label>
              <select
                id="producto"
                name="producto"
                className={claseCampo('producto', true)}
                value={formulario.producto}
                onChange={cambiarCampo}
                disabled={!formulario.categoria}
                required
                {...atributosError('producto')}
              >
                <option value="">
                  {formulario.categoria
                    ? 'Selecciona un producto'
                    : 'Primero selecciona una categoría'}
                </option>
                {productosDisponibles.map((producto) => (
                  <option key={producto.valor} value={producto.valor}>
                    {producto.texto}
                  </option>
                ))}
              </select>
              {mensajeError('producto')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="cantidad" className="form-label">
                Cantidad a producir (unidades)
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="10"
                max="200"
                step="1"
                className={claseCampo('cantidad')}
                value={formulario.cantidad}
                onChange={cambiarCampo}
                required
                {...atributosError('cantidad')}
              />
              {mensajeError('cantidad')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="pesoUnidad" className="form-label">
                Peso por unidad (gramos)
              </label>
              <input
                id="pesoUnidad"
                name="pesoUnidad"
                type="number"
                step="any"
                className={claseCampo('pesoUnidad')}
                value={formulario.pesoUnidad}
                onChange={cambiarCampo}
                required
                {...atributosError('pesoUnidad')}
              />
              {mensajeError('pesoUnidad')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="fechaProduccion" className="form-label">
                Fecha de producción
              </label>
              <input
                id="fechaProduccion"
                name="fechaProduccion"
                type="date"
                className={claseCampo('fechaProduccion')}
                value={formulario.fechaProduccion}
                onChange={cambiarCampo}
                required
                {...atributosError('fechaProduccion')}
              />
              {mensajeError('fechaProduccion')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="estado" className="form-label">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className={claseCampo('estado', true)}
                value={formulario.estado}
                onChange={cambiarCampo}
                required
                {...atributosError('estado')}
              >
                <option value="Programado">Programado</option>
              </select>
              {mensajeError('estado')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="prioridad" className="form-label">
                Prioridad
              </label>
              <select
                id="prioridad"
                name="prioridad"
                className={claseCampo('prioridad', true)}
                value={formulario.prioridad}
                onChange={cambiarCampo}
                required
                {...atributosError('prioridad')}
              >
                <option value="">Selecciona una prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
              {mensajeError('prioridad')}
            </div>
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
              {editando ? 'Guardar cambios' : 'Guardar orden'}
            </button>

            {editando && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cancelarEdicion}
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
          <p className="mb-0">Todavía no hay órdenes registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <caption>Órdenes guardadas en este navegador.</caption>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Peso (g)</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Prioridad</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.codigo}</td>
                    <td>
                      {nombreProducto(orden.categoria, orden.producto)}
                    </td>
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
                          aria-label={`Editar orden de ${orden.codigo}`}
                          onClick={() => editarOrden(orden)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          aria-label={`Eliminar orden de ${orden.codigo}`}
                          onClick={() => borrarOrden(orden)}
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