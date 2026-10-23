import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerCatalogo } from '../data/catalogo.js'

const DESTACADOS = [
  {
    codigo: 'PR001',
    imagen: 'amasado.jpg',
    unidad: 'kg',
  },
  {
    codigo: 'PR002',
    imagen: 'molde.jpg',
    unidad: 'unidad',
  },
  {
    codigo: 'PR003',
    imagen: 'marraqueta.jpg',
    unidad: 'kg',
  },
]

function moneda(valor) {
  return valor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}

function cargarProductos() {
  try {
    return {
      productos: obtenerCatalogo('productos'),
      error: '',
    }
  } catch {
    return {
      productos: [],
      error: 'No se pudo cargar el catálogo.',
    }
  }
}

function TarjetaCotizador({ producto, imagen, unidad }) {
  const [cantidad, setCantidad] = useState('1')
  const [mostrarResumen, setMostrarResumen] = useState(false)

  const numero = Number(cantidad)

  const cantidadValida =
    cantidad.trim() !== '' &&
    Number.isFinite(numero) &&
    numero > 0 &&
    (unidad === 'kg' || Number.isInteger(numero))

  const total = cantidadValida
    ? numero * Number(producto.precio)
    : 0

  function cotizar(evento) {
    evento.preventDefault()
    setMostrarResumen(true)
  }

  return (
    <article className="card h-100 border-0 shadow-sm">
      <img
        src={`${import.meta.env.BASE_URL}images/${imagen}`}
        alt={producto.nombre}
        className="card-img-top"
        style={{ height: 190, objectFit: 'cover' }}
      />

      <div className="card-body d-flex flex-column">
        <h3 className="h5">{producto.nombre}</h3>
        <p className="small mb-1">{producto.codigo}</p>
        <p>
          <strong>{moneda(Number(producto.precio))}</strong>
          {' / '}{unidad}
        </p>

        <form onSubmit={cotizar} noValidate className="mt-auto">
          <label
            htmlFor={`cantidad-${producto.id}`}
            className="form-label"
          >
            Cantidad ({unidad})
          </label>

          <input
            id={`cantidad-${producto.id}`}
            type="number"
            min={unidad === 'kg' ? '0.01' : '1'}
            step={unidad === 'kg' ? '0.01' : '1'}
            className={`form-control${
              !cantidadValida ? ' is-invalid' : ''
            }`}
            value={cantidad}
            aria-invalid={!cantidadValida}
            aria-describedby={
              !cantidadValida ? `error-${producto.id}` : undefined
            }
            onChange={(evento) => {
              setCantidad(evento.target.value)
              setMostrarResumen(false)
            }}
          />

          {!cantidadValida && (
            <div
              id={`error-${producto.id}`}
              className="invalid-feedback"
            >
              {unidad === 'kg'
                ? 'Ingresa una cantidad mayor que cero.'
                : 'Ingresa una cantidad entera mayor que cero.'}
            </div>
          )}

          <div
            className="rounded p-3 my-3"
            style={{ backgroundColor: 'var(--bg-pan)' }}
          >
            <p className="small mb-1">Total estimado</p>
            <p className="h4 mb-0">
              {cantidadValida ? moneda(total) : '—'}
            </p>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: 'var(--cafe-oscuro)',
              color: 'var(--blanco)',
            }}
          >
            Ver cotización
          </button>
        </form>

        {mostrarResumen && cantidadValida && (
          <div className="alert alert-success mt-3 mb-0" role="status">
            {producto.nombre}: {numero.toLocaleString('es-CL')}
            {' '}{unidad}. Total: {moneda(total)}.
          </div>
        )}
      </div>
    </article>
  )
}

function Inicio() {
  const [datos] = useState(cargarProductos)

  return (
    <>
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2>Nuestra historia</h2>
          <p className="mb-0">
            Desde hace más de 20 años, en Pan del Sur trabajamos
            con pasión para llevar la magia del pan artesanal a
            miles de familias y locales. Con base en San Bernardo,
            producimos más de 15.000 unidades diarias combinando
            tradición, sabor e innovación digital en cada horneada.
          </p>
        </div>
      </section>

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2>Tiendas y sucursales</h2>
          <p>Conoce nuestras plantas y puntos de distribución:</p>

          <ul className="mb-0">
            <li>
              <strong>Planta Central San Bernardo: </strong>
              Av. Industrial 1200, San Bernardo.
            </li>
            <li>
              <strong>Sucursal Santiago Centro: </strong>
              Av. Matta 450, Santiago.
            </li>
            <li>
              <strong>Sucursal Providencia: </strong>
              Av. Holanda 123, Providencia.
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-4">
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body p-4">
            <h2>Catálogo y cotizador</h2>
            <p>
              Ingresa la cantidad para calcular el costo estimado.
              Los precios provienen del catálogo de productos.
            </p>
            <p className="small mb-0">
              La cotización no registra una orden de producción.
              Las órdenes se gestionan en su módulo.
            </p>
          </div>
        </div>

        {datos.error ? (
          <div className="alert alert-danger" role="alert">
            {datos.error}
          </div>
        ) : (
          <div className="row g-3">
            {DESTACADOS.map((destacado) => {
              const producto = datos.productos.find(
                (item) => item.codigo === destacado.codigo,
              )

              return producto ? (
                <div className="col-12 col-md-6 col-xl-4" key={producto.id}>
                  <TarjetaCotizador
                    producto={producto}
                    imagen={destacado.imagen}
                    unidad={destacado.unidad}
                  />
                </div>
              ) : null
            })}
          </div>
        )}

        <div className="mt-3">
          <Link
            to="/productos"
            className="btn btn-outline-secondary me-2 mb-2"
          >
            Administrar catálogo
          </Link>
          <Link
            to="/ordenes"
            className="btn btn-outline-secondary mb-2"
          >
            Ir a órdenes de producción
          </Link>
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2>Nuestros servicios</h2>
          <ul className="mb-0">
            <li>
              Envío diario y trazabilidad asegurada a locales
              comerciales en la Región Metropolitana.
            </li>
            <li>
              Inspección y control de calidad bajo normas de
              inocuidad alimentaria.
            </li>
            <li>
              Devolución garantizada en caso de lote no conforme.
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

export default Inicio