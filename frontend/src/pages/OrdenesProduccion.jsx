import { useState } from 'react'

function OrdenesProduccion() {
  const [codigo, setCodigo] = useState('')
  const codigoInvalido =
  codigo.trim() !== '' && !/^[A-Za-z0-9-]{3,}$/.test(codigo.trim())

  return (
    <section>
      <h2>Órdenes de producción</h2>
      <p>Registra y consulta las órdenes de producción de Pan del Sur.</p>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h3 className="h5">Nueva orden</h3>

          <label htmlFor="codigo" className="form-label">
            Código de producto
          </label>

          <input
            id="codigo"
            name="codigo"
            type="text"
            className="form-control"
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value)}
          />
          {codigoInvalido && (
            <p className="text-danger mt-2" role="alert">
                El código debe tener al menos 3 caracteres y usar solo letras,
                números o guiones.
                </p>
            )}

          <p className="mt-3 mb-0">
            Código ingresado: <strong>{codigo}</strong>
          </p>
        </div>
      </div>
    </section>
  )
}

export default OrdenesProduccion