/* global describe, it, expect, beforeEach, afterEach, spyOn */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Inicio from '../src/pages/Inicio.jsx'
import ProductosIngredientes from '../src/pages/ProductosIngredientes.jsx'
import Trazabilidad from '../src/pages/Trazabilidad.jsx'
import Reportes from '../src/pages/Reportes.jsx'

describe('Entorno aislado', () => {
window.IS_REACT_ACT_ENVIRONMENT = true

let contenedor
let root
let almacenamiento

beforeEach(() => {
  almacenamiento = new Map()

  spyOn(Storage.prototype, 'getItem').and.callFake(
    (clave) => almacenamiento.get(String(clave)) ?? null,
  )

  spyOn(Storage.prototype, 'setItem').and.callFake(
    (clave, valor) => {
      almacenamiento.set(String(clave), String(valor))
    },
  )

  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  root = createRoot(contenedor)
})

afterEach(async () => {
  await act(async () => {
    root.unmount()
  })

  contenedor.remove()
})

async function mostrar(componente) {
  await act(async () => {
    root.render(componente)
  })
}

async function cambiar(selector, valor) {
  const elemento = contenedor.querySelector(selector)

  if (!elemento) {
    throw new Error(`No se encontró ${selector}`)
  }

  const prototipo = elemento instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype

  const setter = Object.getOwnPropertyDescriptor(
    prototipo,
    'value',
  ).set

  await act(async () => {
    setter.call(elemento, valor)

    elemento.dispatchEvent(
      new Event(
        elemento instanceof HTMLSelectElement ? 'change' : 'input',
        { bubbles: true },
      ),
    )
  })
}

async function enviar() {
  await act(async () => {
    contenedor.querySelector('form').dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      }),
    )
  })
}

async function pulsar(texto) {
  const boton = [...contenedor.querySelectorAll('button')].find(
    (elemento) => elemento.textContent.trim() === texto,
  )

  if (!boton) {
    throw new Error(`No se encontró el botón ${texto}`)
  }

  await act(async () => {
    boton.click()
  })
}

describe('Pantallas restantes de Pan del Sur', () => {
  it('13. Inicio muestra tres cotizadores y calcula el total', async () => {
    await mostrar(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>,
    )

    expect(contenedor.querySelectorAll('article').length).toBe(3)

    await cambiar('#cantidad-PR001', '2')

    const tarjeta = contenedor.querySelector('article')

    expect(tarjeta.textContent)
      .toContain((3000).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }))
  })

  it('14. El catálogo inicial muestra seis productos y permite buscar', async () => {
    await mostrar(<ProductosIngredientes />)

    expect(contenedor.querySelectorAll('tbody tr').length).toBe(6)

    await cambiar('#productos-buscar', 'Marraqueta')

    expect(contenedor.querySelectorAll('tbody tr').length).toBe(1)
    expect(contenedor.querySelector('tbody').textContent)
      .toContain('Marraqueta')
  })

  it('15. El catálogo rechaza un código de producto duplicado', async () => {
    await mostrar(<ProductosIngredientes />)

    await cambiar('#productos-codigo', 'PR001')
    await cambiar('#productos-nombre', 'Producto repetido')
    await cambiar('#productos-categoria', 'Pan')
    await cambiar('#productos-tiempo', '30')
    await cambiar('#productos-precio', '1000')
    await cambiar('#productos-stock', '10')
    await enviar()

    expect(
      contenedor.querySelector('#productos-codigo-error').textContent,
    ).toContain('Ese código ya existe')

    expect(almacenamiento.has('pan-del-sur-productos')).toBeFalse()
  })

  it('16. Un producto nuevo se guarda y aparece en la tabla', async () => {
    await mostrar(<ProductosIngredientes />)

    await cambiar('#productos-codigo', 'PR999')
    await cambiar('#productos-nombre', 'Pan integral')
    await cambiar('#productos-categoria', 'Pan')
    await cambiar('#productos-tiempo', '50')
    await cambiar('#productos-precio', '1800')
    await cambiar('#productos-stock', '100')
    await enviar()

    const productos = JSON.parse(
      almacenamiento.get('pan-del-sur-productos'),
    )

    expect(productos.length).toBe(7)
    expect(productos.find((producto) => producto.codigo === 'PR999').precio)
      .toBe(1800)

    expect(contenedor.querySelectorAll('tbody tr').length).toBe(7)
  })

  it('17. Ingredientes muestra ocho registros y detecta bajo stock', async () => {
    await mostrar(<ProductosIngredientes />)
    await pulsar('Ingredientes')

    expect(contenedor.querySelectorAll('tbody tr').length).toBe(8)

    const filaMantequilla = [
      ...contenedor.querySelectorAll('tbody tr'),
    ].find((fila) => fila.textContent.includes('Mantequilla'))

    expect(filaMantequilla.textContent).toContain('Bajo stock')
  })

  it('18. Trazabilidad encuentra el lote por su insumo', async () => {
    await mostrar(<Trazabilidad />)
    await cambiar('#buscar-lote', 'HAR-20260920-A')
    await enviar()

    expect(contenedor.textContent).toContain('LOT-20261012-001')
    expect(contenedor.textContent).toContain('Molinos del Centro')
    expect(contenedor.textContent).toContain('Supermercados San Bernardo')
  })

  it('19. Trazabilidad consulta inspecciones guardadas y sus nombres', async () => {
    almacenamiento.set(
      'pan-del-sur-inspecciones',
      JSON.stringify([
        {
          id: 'inspeccion-prueba',
          lote: 'LOT-NUEVO-001',
          producto: 'producto-nuevo',
          productoNombre: 'Pan especial',
          fechaInspeccion: '2026-10-18',
          tecnico: 'Ana Perez',
          pesoEspecificado: '',
          pesoRegistrado: '',
          humedad: '37',
          color: '',
          textura: '',
          sabor: '',
          resultado: 'Conforme',
          observaciones: '',
          fechaRegistro: '2026-10-18T12:00:00Z',
        },
      ]),
    )

    await mostrar(<Trazabilidad />)
    await cambiar('#buscar-lote', 'lot-nuevo-001')
    await enviar()

    expect(contenedor.textContent).toContain('Pan especial')
    expect(contenedor.textContent).toContain('Ana Perez')
    expect(contenedor.textContent).toContain('Conforme')
    expect(contenedor.textContent).not.toContain('Molinos del Centro')
  })

  it('20. Reportes rechaza un período invertido', async () => {
    await mostrar(<Reportes />)

    await cambiar('#inicio', '2026-10-20')
    await cambiar('#fin', '2026-10-01')
    await enviar()

    expect(contenedor.querySelector('#error-fin').textContent)
      .toContain('Debe ser igual o posterior al inicio')
  })

  it('21. Reportes muestra solo órdenes dentro del período', async () => {
    almacenamiento.set(
      'pan-del-sur-ordenes',
      JSON.stringify([
        {
          id: 'orden-dentro',
          codigo: 'PR001',
          producto: 'pan_amasado',
          cantidad: 10,
          pesoUnidad: 100,
          fechaProduccion: '2026-10-15',
          estado: 'Programado',
          prioridad: 'Media',
        },
        {
          id: 'orden-fuera',
          codigo: 'PR002',
          producto: 'pan_molde',
          cantidad: 20,
          pesoUnidad: 200,
          fechaProduccion: '2026-11-15',
          estado: 'Programado',
          prioridad: 'Alta',
        },
      ]),
    )

    await mostrar(<Reportes />)
    await cambiar('#inicio', '2026-10-01')
    await cambiar('#fin', '2026-10-31')
    await enviar()

    const filas = contenedor.querySelectorAll('tbody tr')

    expect(filas.length).toBe(1)
    expect(filas[0].textContent).toContain('Pan amasado')
    expect(filas[0].textContent).not.toContain('Pan de molde')
  })

  it('22. Reporte de ingredientes muestra existencias sin filtro de fechas', async () => {
    await mostrar(<Reportes />)
    await cambiar('#tipo-reporte', 'ingredientes')
    await enviar()

    expect(contenedor.querySelector('#inicio')).toBeNull()
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(8)
    expect(contenedor.querySelector('tbody').textContent)
      .toContain('Bajo stock')
  })
})
})

