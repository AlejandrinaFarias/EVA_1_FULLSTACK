import { useState } from 'react'
import {
  obtenerCatalogo,
  guardarRegistro,
  eliminarRegistro,
} from '../services/catalogo.js'

const CAMPOS_COMUNES = [
  { nombre: 'codigo', etiqueta: 'Código', tipo: 'text' },
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
]

const CONFIGURACION = {
  productos: {
    titulo: 'Productos',
    singular: 'producto',
    campos: [
      ...CAMPOS_COMUNES,
      {
        nombre: 'categoria',
        etiqueta: 'Categoría',
        opciones: ['Pan', 'Pastelería'],
      },
      {
        nombre: 'tiempo',
        etiqueta: 'Tiempo de producción (min)',
        tipo: 'number',
      },
      {
        nombre: 'precio',
        etiqueta: 'Precio (CLP)',
        tipo: 'number',
      },
      {
        nombre: 'stock',
        etiqueta: 'Stock actual (unidades)',
        tipo: 'number',
      },
    ],
  },
  ingredientes: {
    titulo: 'Ingredientes',
    singular: 'ingrediente',
    campos: [
      ...CAMPOS_COMUNES,
      {
        nombre: 'unidad',
        etiqueta: 'Unidad',
        opciones: ['kg', 'litros', 'unidades'],
      },
      {
        nombre: 'stock',
        etiqueta: 'Stock actual',
        tipo: 'number',
      },
      {
        nombre: 'minimo',
        etiqueta: 'Stock mínimo',
        tipo: 'number',
      },
    ],
  },
}

function formularioVacio(campos) {
  return Object.fromEntries(
    campos.map((campo) => [campo.nombre, '']),
  )
}

function cargar(tipo) {
  try {
    return { registros: obtenerCatalogo(tipo), error: '' }
  } catch {
    return {
      registros: [],
      error: 'No se pudieron leer los datos guardados.',
    }
  }
}

function validar(formulario, campos, tipo) {
  const errores = {}

  for (const campo of campos) {
    const valor = formulario[campo.nombre].trim()

    if (valor === '') {
      errores[campo.nombre] = 'Completa este campo.'
      continue
    }

    if (
      campo.opciones &&
      !campo.opciones.includes(valor)
    ) {
      errores[campo.nombre] = 'Selecciona una opción válida.'
    }

    if (campo.tipo === 'number') {
      const numero = Number(valor)
      const admiteCero = ['stock', 'minimo'].includes(campo.nombre)

      if (
        !Number.isFinite(numero) ||
        (admiteCero ? numero < 0 : numero <= 0)
      ) {
        errores[campo.nombre] = admiteCero
          ? 'Ingresa cero o un número positivo.'
          : 'Ingresa un número mayor que cero.'
      } else {
        const requiereEntero =
          campo.nombre === 'tiempo' ||
          campo.nombre === 'precio' ||
          (
            ['stock', 'minimo'].includes(campo.nombre) &&
            (
              tipo === 'productos' ||
              formulario.unidad === 'unidades'
            )
          )

        if (requiereEntero && !Number.isInteger(numero)) {
          errores[campo.nombre] = 'Ingresa un número entero.'
        }
      }
    }
  }

  if (!/^[A-Za-z0-9-]{3,}$/.test(formulario.codigo.trim())) {
    errores.codigo = 'Usa al menos 3 letras, números o guiones.'
  }

  if (formulario.nombre.trim().length < 3) {
    errores.nombre = 'Ingresa al menos 3 caracteres.'
  }

  return errores
}

function EditorCatalogo({ tipo }) {
  const configuracion = CONFIGURACION[tipo]
  const { campos, titulo, singular } = configuracion

  const [datos, setDatos] = useState(() => cargar(tipo))
  const [formulario, setFormulario] = useState(
    () => formularioVacio(campos),
  )
  const [idEdicion, setIdEdicion] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [aviso, setAviso] = useState(null)

  const errores = enviado ? validar(formulario, campos, tipo) : {}

  const codigo = formulario.codigo.trim().toUpperCase()

  if (
    enviado &&
    datos.registros.some(
      (registro) =>
        registro.codigo.toUpperCase() === codigo &&
        registro.id !== idEdicion,
    )
  ) {
    errores.codigo = 'Ese código ya existe.'
  }

  const consulta = busqueda.trim().toLocaleLowerCase('es-CL')

  const visibles = datos.registros.filter((registro) =>
    `${registro.codigo} ${registro.nombre} ${
      registro.categoria ?? registro.unidad ?? ''
    }`.toLocaleLowerCase('es-CL').includes(consulta),
  )

  function limpiar() {
    setFormulario(formularioVacio(campos))
    setIdEdicion(null)
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

    const nuevosErrores = validar(formulario, campos, tipo)
    const duplicado = datos.registros.some(
      (registro) =>
        registro.codigo.toUpperCase() === codigo &&
        registro.id !== idEdicion,
    )

    if (Object.keys(nuevosErrores).length > 0 || duplicado) {
      return
    }

    try {
      const registros = guardarRegistro(tipo, formulario, idEdicion)

      setDatos({ registros, error: '' })
      setAviso({
        tipo: 'success',
        texto: idEdicion
          ? 'Cambios guardados.'
          : 'Registro agregado.',
      })

      limpiar()
    } catch (error) {
      setAviso({
        tipo: 'danger',
        texto: error.message === 'Ese código ya existe.'
          ? error.message
          : 'No se pudo guardar. Los campos se conservaron.',
      })
    }
  }

  function editar(registro) {
    setFormulario(
      Object.fromEntries(
        campos.map((campo) => [
          campo.nombre,
          String(registro[campo.nombre] ?? ''),
        ]),
      ),
    )

    setIdEdicion(registro.id)
    setEnviado(false)
    setAviso(null)
    document.getElementById(`${tipo}-codigo`)?.focus()
  }

  function eliminar(registro) {
    if (!window.confirm(`¿Eliminar ${registro.nombre}?`)) {
      return
    }

    try {
      const registros = eliminarRegistro(tipo, registro.id)
      setDatos({ registros, error: '' })

      if (idEdicion === registro.id) {
        limpiar()
      }

      setAviso({ tipo: 'success', texto: 'Registro eliminado.' })
    } catch {
      setAviso({
        tipo: 'danger',
        texto: 'No se pudo eliminar el registro.',
      })
    }
  }

  function mostrarValor(registro, campo) {
    const valor = registro[campo.nombre]

    if (campo.nombre === 'precio') {
      return Number(valor).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      })
    }

    return campo.tipo === 'number'
      ? Number(valor).toLocaleString('es-CL')
      : valor
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <h3 className="h5 mb-0">
          {titulo} registrados: {datos.registros.length}
        </h3>

        {tipo === 'productos' && (
          <span>
            Categorías: {
              new Set(datos.registros.map((item) => item.categoria)).size
            }
          </span>
        )}
      </div>

      {(datos.error || aviso) && (
        <div
          className={`alert alert-${datos.error ? 'danger' : aviso.tipo}`}
          role={datos.error || aviso?.tipo === 'danger' ? 'alert' : 'status'}
        >
          {datos.error || aviso.texto}
        </div>
      )}

      <h3 className="h5">
        {idEdicion ? `Editar ${singular}` : `Agregar ${singular}`}
      </h3>

      <form onSubmit={guardar} noValidate>
        <div className="row g-3">
          {campos.map((campo) => {
            const id = `${tipo}-${campo.nombre}`
            const propiedades = {
              id,
              name: campo.nombre,
              value: formulario[campo.nombre],
              onChange: cambiar,
              required: true,
              className: `${
                campo.opciones ? 'form-select' : 'form-control'
              }${errores[campo.nombre] ? ' is-invalid' : ''}`,
              'aria-invalid': Boolean(errores[campo.nombre]),
              'aria-describedby': errores[campo.nombre]
                ? `${id}-error`
                : undefined,
            }

            return (
              <div className="col-12 col-md-6" key={campo.nombre}>
                <label htmlFor={id} className="form-label">
                  {campo.etiqueta}
                </label>

                {campo.opciones ? (
                  <select {...propiedades}>
                    <option value="">Selecciona una opción</option>
                    {campo.opciones.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...propiedades}
                    type={campo.tipo}
                    step={campo.tipo === 'number' ? 'any' : undefined}
                  />
                )}

                {errores[campo.nombre] && (
                  <div id={`${id}-error`} className="invalid-feedback">
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
            {idEdicion ? 'Guardar cambios' : `Guardar ${singular}`}
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

      <label htmlFor={`${tipo}-buscar`} className="form-label">
        Buscar por código, nombre o {tipo === 'productos' ? 'categoría' : 'unidad'}
      </label>
      <input
        id={`${tipo}-buscar`}
        type="search"
        className="form-control mb-3"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        placeholder={`Buscar ${titulo.toLowerCase()}`}
      />

      {datos.error ? (
        <p>No se pudieron cargar los registros.</p>
      ) : visibles.length === 0 ? (
        <p>No hay registros que mostrar.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <caption>
              {visibles.length} registros visibles de {datos.registros.length}.
            </caption>
            <thead>
              <tr>
                {campos.map((campo) => (
                  <th scope="col" key={campo.nombre}>
                    {campo.etiqueta}
                  </th>
                ))}
                {tipo === 'ingredientes' && (
                  <th scope="col">Estado</th>
                )}
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((registro) => (
                <tr key={registro.id}>
                  {campos.map((campo) => (
                    <td key={campo.nombre}>
                      {mostrarValor(registro, campo)}
                    </td>
                  ))}

                  {tipo === 'ingredientes' && (
                    <td>
                      <span
                        className={`badge ${
                          registro.stock < registro.minimo
                            ? 'text-bg-warning'
                            : 'text-bg-success'
                        }`}
                      >
                        {registro.stock < registro.minimo
                          ? 'Bajo stock'
                          : 'OK'}
                      </span>
                    </td>
                  )}

                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        aria-label={`Editar ${registro.nombre}`}
                        onClick={() => editar(registro)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        aria-label={`Eliminar ${registro.nombre}`}
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
    </>
  )
}

function ProductosIngredientes() {
  const [tipo, setTipo] = useState('productos')

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2>Productos e ingredientes</h2>
        <p>Administra el catálogo y las existencias de Pan del Sur.</p>

        <div
          className="d-flex flex-wrap gap-2 my-4"
          role="group"
          aria-label="Seleccionar catálogo"
        >
          {Object.entries(CONFIGURACION).map(([clave, configuracion]) => (
            <button
              key={clave}
              type="button"
              className="btn"
              aria-pressed={tipo === clave}
              onClick={() => setTipo(clave)}
              style={{
                backgroundColor:
                  tipo === clave
                    ? 'var(--cafe-oscuro)'
                    : 'var(--bg-pan)',
                color:
                  tipo === clave
                    ? 'var(--blanco)'
                    : 'var(--cafe-oscuro)',
              }}
            >
              {configuracion.titulo}
            </button>
          ))}
        </div>

        <EditorCatalogo key={tipo} tipo={tipo} />
      </div>
    </section>
  )
}

export default ProductosIngredientes