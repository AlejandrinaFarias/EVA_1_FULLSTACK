import { useState } from 'react'
import {
  obtenerInspecciones,
  crearInspeccion,
  actualizarInspeccion,
  eliminarInspeccion,
} from '../data/inspecciones.js'
import { PRODUCTOS_POR_CATEGORIA } from '../data/validacionOrdenes.js'

const PRODUCTOS = Object.values(PRODUCTOS_POR_CATEGORIA).flat()

const INICIAL = {
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

const OPCIONES = {
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
    ['insipido', 'Insípido / sin sabor'],
    ['salado', 'Demasiado salado'],
    ['rancio', 'Rancio'],
  ],
}

const ACEPTABLE = {
  color: 'dorado_uniforme',
  textura: 'esponjoso',
  sabor: 'caracteristico',
}

function evaluar(datos) {
  const estados = {}

  const especificado = Number(datos.pesoEspecificado)
  const registrado = Number(datos.pesoRegistrado)

  if (
    datos.pesoEspecificado !== '' &&
    datos.pesoRegistrado !== '' &&
    Number.isFinite(especificado) &&
    Number.isFinite(registrado) &&
    especificado > 0 &&
    registrado > 0
  ) {
    estados.peso =
      Math.abs(registrado - especificado) / especificado <= 0.05
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

  for (const campo of ['color', 'textura', 'sabor']) {
    if (datos[campo]) {
      estados[campo] = datos[campo] === ACEPTABLE[campo]
    }
  }

  return estados
}

function validar(datos) {
  const errores = {}

  if (!/^[A-Za-z0-9-]{3,}$/.test(datos.lote.trim())) {
    errores.lote = 'Usa al menos 3 caracteres: letras, números o guiones.'
  }

  if (!PRODUCTOS.some((producto) => producto.valor === datos.producto)) {
    errores.producto = 'Selecciona un producto.'
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
    (!Number.isFinite(Number(datos.humedad)) ||
      Number(datos.humedad) < 0 ||
      Number(datos.humedad) > 100)
  ) {
    errores.humedad = 'Ingresa un porcentaje entre 0 y 100.'
  }

  for (const campo of ['color', 'textura', 'sabor']) {
    if (
      datos[campo] &&
      !OPCIONES[campo].some(([valor]) => valor === datos[campo])
    ) {
      errores[campo] = 'Selecciona una opción válida.'
    }
  }

  const algunParametro =
    evaluaPeso ||
    datos.humedad !== '' ||
    datos.color !== '' ||
    datos.textura !== '' ||
    datos.sabor !== ''

  if (!algunParametro) {
    errores.parametros = 'Completa al menos un parámetro de calidad.'
  }

  if (!['Conforme', 'No_conforme'].includes(datos.resultado)) {
    errores.resultado = 'Selecciona un resultado.'
  } else if (
    datos.resultado === 'Conforme' &&
    Object.values(evaluar(datos)).includes(false)
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

function cargarInicial() {
  try {
    return { registros: obtenerInspecciones(), error: '' }
  } catch {
    return {
      registros: [],
      error: 'No se pudieron leer las inspecciones guardadas.',
    }
  }
}

function ControlCalidad() {
  const [datos, setDatos] = useState(cargarInicial)
  const [formulario, setFormulario] = useState({ ...INICIAL })
  const [idEdicion, setIdEdicion] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [aviso, setAviso] = useState(null)

  const errores = enviado ? validar(formulario) : {}
  const estados = evaluar(formulario)

  function cambiar(evento) {
    const { name, value } = evento.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
    setAviso(null)
  }

  function limpiar() {
    setFormulario({ ...INICIAL })
    setIdEdicion(null)
    setEnviado(false)
  }

  function guardar(evento) {
    evento.preventDefault()
    setEnviado(true)
    setAviso(null)

    if (Object.keys(validar(formulario)).length > 0) {
      return
    }

    const valores = {
      ...formulario,
      lote: formulario.lote.trim().toUpperCase(),
      tecnico: formulario.tecnico.trim(),
      observaciones: formulario.observaciones.trim(),
    }

    try {
      const registro = idEdicion
        ? actualizarInspeccion(idEdicion, valores)
        : crearInspeccion(valores)

      setDatos((anterior) => ({
        registros: idEdicion
          ? anterior.registros.map((item) =>
              item.id === idEdicion ? registro : item,
            )
          : [...anterior.registros, registro],
        error: '',
      }))

      setAviso({
        tipo: 'success',
        texto: idEdicion
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
    const campos = Object.fromEntries(
      Object.keys(INICIAL).map((campo) => [
        campo,
        String(registro[campo] ?? ''),
      ]),
    )

    setFormulario(campos)
    setIdEdicion(registro.id)
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
        registros: anterior.registros.filter(
          (item) => item.id !== registro.id,
        ),
        error: '',
      }))

      if (idEdicion === registro.id) {
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

  function propiedades(nombre, esSelect = false) {
    return {
      id: nombre,
      name: nombre,
      value: formulario[nombre],
      onChange: cambiar,
      className: `${esSelect ? 'form-select' : 'form-control'}${
        errores[nombre] ? ' is-invalid' : ''
      }`,
      'aria-invalid': Boolean(errores[nombre]),
      'aria-describedby': errores[nombre]
        ? `error-${nombre}`
        : undefined,
    }
  }

  function errorCampo(nombre) {
    return errores[nombre] ? (
      <div id={`error-${nombre}`} className="invalid-feedback">
        {errores[nombre]}
      </div>
    ) : null
  }

  function indicador(nombre) {
    if (estados[nombre] === undefined) {
      return null
    }

    return (
      <p
        className={`small mt-2 mb-0 ${
          estados[nombre] ? 'text-success' : 'text-danger'
        }`}
      >
        {estados[nombre] ? 'Cumple' : 'No cumple'}
      </p>
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
          {idEdicion ? 'Editar inspección' : 'Nueva inspección'}
        </h3>

        <form onSubmit={guardar} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="lote" className="form-label">
                Código de lote
              </label>
              <input type="text" required {...propiedades('lote')} />
              {errorCampo('lote')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="producto" className="form-label">
                Producto
              </label>
              <select required {...propiedades('producto', true)}>
                <option value="">Selecciona un producto</option>
                {PRODUCTOS.map((producto) => (
                  <option key={producto.valor} value={producto.valor}>
                    {producto.texto}
                  </option>
                ))}
              </select>
              {errorCampo('producto')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="fechaInspeccion" className="form-label">
                Fecha de inspección
              </label>
              <input
                type="date"
                required
                {...propiedades('fechaInspeccion')}
              />
              {errorCampo('fechaInspeccion')}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="tecnico" className="form-label">
                Técnico responsable
              </label>
              <input type="text" required {...propiedades('tecnico')} />
              {errorCampo('tecnico')}
            </div>
          </div>

          <fieldset className="border rounded p-3 mt-4">
            <legend className="float-none w-auto px-2 fs-6 fw-bold">
              Parámetros de calidad
            </legend>

            <p className="small">
              Completa al menos uno. Peso: tolerancia ±5 %. Humedad:
              rango aceptable de 35 a 40 %.
            </p>

            {errores.parametros && (
              <p className="text-danger small" role="alert">
                {errores.parametros}
              </p>
            )}

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="pesoEspecificado" className="form-label">
                  Peso especificado (g)
                </label>
                <input
                  type="number"
                  step="any"
                  {...propiedades('pesoEspecificado')}
                />
                {errorCampo('pesoEspecificado')}
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="pesoRegistrado" className="form-label">
                  Peso registrado (g)
                </label>
                <input
                  type="number"
                  step="any"
                  {...propiedades('pesoRegistrado')}
                />
                {errorCampo('pesoRegistrado')}
                {indicador('peso')}
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="humedad" className="form-label">
                  Humedad registrada (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  {...propiedades('humedad')}
                />
                {errorCampo('humedad')}
                {indicador('humedad')}
              </div>

              {[
                ['color', 'Color de corteza'],
                ['textura', 'Textura'],
                ['sabor', 'Sabor'],
              ].map(([campo, etiqueta]) => (
                <div className="col-12 col-md-6" key={campo}>
                  <label htmlFor={campo} className="form-label">
                    {etiqueta}
                  </label>
                  <select {...propiedades(campo, true)}>
                    <option value="">Sin evaluar</option>
                    {OPCIONES[campo].map(([valor, texto]) => (
                      <option key={valor} value={valor}>
                        {texto}
                      </option>
                    ))}
                  </select>
                  {errorCampo(campo)}
                  {indicador(campo)}
                </div>
              ))}
            </div>
          </fieldset>

          <div className="row g-3 mt-2">
            <div className="col-12 col-md-6">
              <label htmlFor="resultado" className="form-label">
                Resultado
              </label>
              <select required {...propiedades('resultado', true)}>
                <option value="">Selecciona un resultado</option>
                <option value="Conforme">Conforme</option>
                <option value="No_conforme">No conforme</option>
              </select>
              {errorCampo('resultado')}
            </div>

            <div className="col-12">
              <label htmlFor="observaciones" className="form-label">
                Observaciones / acciones correctivas
              </label>
              <textarea
                rows="3"
                required={formulario.resultado === 'No_conforme'}
                {...propiedades('observaciones')}
              />
              {errorCampo('observaciones')}
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
              {idEdicion ? 'Guardar cambios' : 'Guardar inspección'}
            </button>

            {idEdicion && (
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
          <p className="mb-0">Todavía no hay inspecciones registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <caption>Inspecciones guardadas en este navegador.</caption>
              <thead>
                <tr>
                  {[
                    'Lote',
                    'Producto',
                    'Fecha',
                    'Técnico',
                    'Resultado',
                    'Observaciones',
                    'Acciones',
                  ].map((titulo) => (
                    <th scope="col" key={titulo}>{titulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.registros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.lote}</td>
                    <td>
                      {PRODUCTOS.find(
                        (producto) => producto.valor === registro.producto,
                      )?.texto ?? registro.producto}
                    </td>
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
                          aria-label={`Editar inspección de ${registro.lote}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => eliminar(registro)}
                          aria-label={`Eliminar inspección de ${registro.lote}`}
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