import { useState } from 'react'

const PRODUCTOS_POR_CATEGORIA = {
  panaderia: [
    { valor: 'pan_amasado', texto: 'Pan amasado' },
    { valor: 'pan_molde', texto: 'Pan de molde' },
    { valor: 'marraqueta', texto: 'Marraqueta' },
    { valor: 'hallulla', texto: 'Hallulla' },
  ],
  pasteleria: [
    { valor: 'pastel_manzana', texto: 'Pastel de manzana' },
    { valor: 'queque_vainilla', texto: 'Queque de vainilla' },
  ],
}

const FORMULARIO_INICIAL = {
  codigo: '',
  categoria: '',
  producto: '',
  cantidad: '',
  pesoUnidad: '',
  fechaProduccion: '',
  estado: 'Programado',
  prioridad: '',
}

function validarOrden(datos) {
  const errores = {}

  if (!/^[A-Za-z0-9-]{3,}$/.test(datos.codigo.trim())) {
    errores.codigo = 'Usa al menos 3 caracteres: letras, números o guiones.'
  }

  const productos = PRODUCTOS_POR_CATEGORIA[datos.categoria] ?? []

  if (!PRODUCTOS_POR_CATEGORIA[datos.categoria]) {
    errores.categoria = 'Selecciona una categoría.'
  }

  if (!productos.some((producto) => producto.valor === datos.producto)) {
    errores.producto = 'Selecciona un producto.'
  }

  const cantidad = Number(datos.cantidad)

  if (
    datos.cantidad.trim() === '' ||
    !Number.isInteger(cantidad) ||
    cantidad < 10 ||
    cantidad > 200
  ) {
    errores.cantidad = 'Ingresa entre 10 y 200 unidades enteras.'
  }

  const peso = Number(datos.pesoUnidad)

  if (
    datos.pesoUnidad.trim() === '' ||
    !Number.isFinite(peso) ||
    peso <= 0
  ) {
    errores.pesoUnidad = 'Ingresa un peso mayor que cero.'
  }

  const fecha = new Date(`${datos.fechaProduccion}T00:00:00`)
  const manana = new Date()
  manana.setHours(0, 0, 0, 0)
  manana.setDate(manana.getDate() + 1)

  if (!datos.fechaProduccion || Number.isNaN(fecha.getTime())) {
    errores.fechaProduccion = 'Selecciona una fecha.'
  } else if (fecha < manana) {
    errores.fechaProduccion = 'Selecciona desde mañana.'
  }

  if (datos.estado !== 'Programado') {
    errores.estado = 'El estado inicial debe ser Programado.'
  }

  if (!['Baja', 'Media', 'Alta'].includes(datos.prioridad)) {
    errores.prioridad = 'Selecciona una prioridad.'
  }

  return errores
}

function OrdenesProduccion() {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [enviado, setEnviado] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const errores = enviado ? validarOrden(formulario) : {}

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
  }

  function enviarFormulario(evento) {
    evento.preventDefault()
    setEnviado(true)
    setMensaje('')

    if (Object.keys(validarOrden(formulario)).length > 0) {
      return
    }

    setMensaje('Orden válida. Aún no se ha guardado.')
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
          Completa los datos para registrar una nueva orden.
        </p>

        {mensaje && (
          <div className="alert alert-success" role="status">
            {mensaje}
          </div>
        )}

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
                Estado inicial
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

          <button
            type="submit"
            className="btn mt-4"
            style={{
              backgroundColor: 'var(--cafe-oscuro)',
              color: 'var(--blanco)',
            }}
          >
            Validar orden
          </button>
        </form>
      </div>
    </section>
  )
}

export default OrdenesProduccion