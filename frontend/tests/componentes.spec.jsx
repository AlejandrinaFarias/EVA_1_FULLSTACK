/* global describe, it, expect, beforeEach, afterEach, spyOn */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Header from '../src/components/Header.jsx'
import Navbar from '../src/components/Navbar.jsx'
import OrdenesProduccion from '../src/pages/OrdenesProduccion.jsx'
import ControlCalidad from '../src/pages/ControlCalidad.jsx'

window.IS_REACT_ACT_ENVIRONMENT = true

let contenedor
let root
let almacenamiento
let guardarSpy

beforeEach(() => {
  almacenamiento = new Map()

  spyOn(Storage.prototype, 'getItem').and.callFake(
    (clave) => almacenamiento.get(String(clave)) ?? null,
  )

  guardarSpy = spyOn(Storage.prototype, 'setItem').and.callFake(
    (clave, valor) => {
      almacenamiento.set(String(clave), String(valor))
    },
  )

  spyOn(Storage.prototype, 'removeItem').and.callFake(
    (clave) => almacenamiento.delete(String(clave)),
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
    throw new Error(`No se encontró el campo ${selector}`)
  }

  const prototipo = elemento instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : elemento instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
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

async function pulsarTexto(texto) {
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

function fechaLocal(desplazamiento = 0) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + desplazamiento)

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-')
}

function ordenGuardada() {
  return {
    id: 'orden-prueba-1',
    codigo: 'PR001',
    categoria: 'panaderia',
    producto: 'pan_amasado',
    productoNombre: 'Pan amasado',
    cantidad: 10,
    pesoUnidad: 100,
    fechaProduccion: fechaLocal(2),
    estado: 'Programado',
    prioridad: 'Media',
    fechaRegistro: new Date().toISOString(),
  }
}

function prepararOrden() {
  almacenamiento.set(
    'pan-del-sur-ordenes',
    JSON.stringify([ordenGuardada()]),
  )
}

function leerOrdenes() {
  return JSON.parse(
    almacenamiento.get('pan-del-sur-ordenes') ?? '[]',
  )
}

async function completarOrden() {
  await cambiar('#codigo', 'PR001')
  await cambiar('#categoria', 'panaderia')
  await cambiar('#producto', 'pan_amasado')
  await cambiar('#cantidad', '10')
  await cambiar('#pesoUnidad', '100')
  await cambiar('#fechaProduccion', fechaLocal(2))
  await cambiar('#prioridad', 'Media')
}

async function completarInspeccion() {
  await cambiar('#lote', 'LOT-PRUEBA-001')
  await cambiar('#producto', 'pan_amasado')
  await cambiar('#fechaInspeccion', fechaLocal())
  await cambiar('#tecnico', 'Ana Perez')
  await cambiar('#humedad', '45')
}

describe('Componentes de Pan del Sur', () => {
  it('01. Header muestra el nombre recibido mediante props', async () => {
    await mostrar(<Header nombre="Pan del Sur Prueba" />)

    expect(contenedor.querySelector('h1').textContent)
      .toBe('Pan del Sur Prueba')

    expect(contenedor.querySelector('img').getAttribute('alt'))
      .toBe('Logo de Pan del Sur')
  })

  it('02. Navbar muestra seis enlaces y marca la ruta activa', async () => {
    await mostrar(
      <MemoryRouter initialEntries={['/calidad']}>
        <Navbar />
      </MemoryRouter>,
    )

    expect(contenedor.querySelectorAll('nav a').length).toBe(6)

    expect(
      contenedor.querySelector('a[aria-current="page"]').textContent.trim(),
    ).toBe('Control de calidad')
  })

  it('03. El campo código actualiza su valor controlado', async () => {
    await mostrar(<OrdenesProduccion />)
    await cambiar('#codigo', 'PR999')

    expect(contenedor.querySelector('#codigo').value).toBe('PR999')
  })

  it('04. Cambiar categoría reinicia el producto seleccionado', async () => {
    await mostrar(<OrdenesProduccion />)

    expect(contenedor.querySelector('#producto').disabled).toBeTrue()

    await cambiar('#categoria', 'panaderia')
    await cambiar('#producto', 'pan_amasado')
    await cambiar('#categoria', 'pasteleria')

    const selector = contenedor.querySelector('#producto')

    expect(selector.value).toBe('')
    expect(
      [...selector.options].map((opcion) => opcion.value),
    ).toContain('pastel_manzana')

    expect(
      [...selector.options].map((opcion) => opcion.value),
    ).not.toContain('pan_amasado')
  })

  it('05. Una orden vacía muestra errores y no se guarda', async () => {
    await mostrar(<OrdenesProduccion />)
    await enviar()

    expect(
      contenedor.querySelectorAll('.invalid-feedback').length,
    ).toBeGreaterThan(0)

    expect(guardarSpy).not.toHaveBeenCalled()
  })

  it('06. Una orden válida se guarda, aparece en tabla y limpia campos', async () => {
    await mostrar(<OrdenesProduccion />)
    await completarOrden()
    await enviar()

    const ordenes = leerOrdenes()

    expect(ordenes.length).toBe(1)
    expect(ordenes[0].cantidad).toBe(10)
    expect(ordenes[0].productoNombre).toBe('Pan amasado')
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(1)
    expect(contenedor.querySelector('#codigo').value).toBe('')
  })

  it('07. Editar actualiza la misma orden sin duplicarla', async () => {
    prepararOrden()
    await mostrar(<OrdenesProduccion />)
    await pulsarTexto('Editar')
    await cambiar('#cantidad', '20')
    await enviar()

    const ordenes = leerOrdenes()

    expect(ordenes.length).toBe(1)
    expect(ordenes[0].id).toBe('orden-prueba-1')
    expect(ordenes[0].cantidad).toBe(20)
  })

  it('08. Cancelar edición conserva los datos guardados', async () => {
    prepararOrden()
    await mostrar(<OrdenesProduccion />)
    await pulsarTexto('Editar')
    await cambiar('#cantidad', '30')
    await pulsarTexto('Cancelar edición')

    expect(leerOrdenes()[0].cantidad).toBe(10)
    expect(contenedor.querySelector('#codigo').value).toBe('')
    expect(guardarSpy).not.toHaveBeenCalled()
  })

  it('09. Eliminar requiere confirmación y actualiza almacenamiento y tabla', async () => {
    prepararOrden()
    const confirmar = spyOn(window, 'confirm').and.returnValue(false)

    await mostrar(<OrdenesProduccion />)
    await pulsarTexto('Eliminar')

    expect(leerOrdenes().length).toBe(1)

    confirmar.and.returnValue(true)
    await pulsarTexto('Eliminar')

    expect(leerOrdenes().length).toBe(0)
    expect(contenedor.querySelector('tbody')).toBeNull()
  })

  it('10. Un fallo de almacenamiento conserva los campos y muestra error', async () => {
    guardarSpy.and.callFake(() => {
      throw new Error('Almacenamiento no disponible')
    })

    await mostrar(<OrdenesProduccion />)
    await completarOrden()
    await enviar()

    expect(contenedor.querySelector('#codigo').value).toBe('PR001')
    expect(contenedor.querySelector('[role="alert"]').textContent)
      .toContain('No se pudo guardar')
    expect(leerOrdenes().length).toBe(0)
  })

  it('11. Calidad impide marcar Conforme con humedad fuera de rango', async () => {
    await mostrar(<ControlCalidad />)
    await completarInspeccion()
    await cambiar('#resultado', 'Conforme')
    await enviar()

    expect(contenedor.querySelector('#error-resultado').textContent)
      .toContain('Hay parámetros que no cumplen')

    expect(guardarSpy).not.toHaveBeenCalled()
  })

  it('12. No conforme exige observaciones y permite guardar al completarlas', async () => {
    await mostrar(<ControlCalidad />)
    await completarInspeccion()
    await cambiar('#resultado', 'No_conforme')
    await enviar()

    expect(contenedor.querySelector('#error-observaciones'))
      .not.toBeNull()

    expect(guardarSpy).not.toHaveBeenCalled()

    await cambiar('#observaciones', 'Retener lote y revisar humedad.')
    await enviar()

    const inspecciones = JSON.parse(
      almacenamiento.get('pan-del-sur-inspecciones') ?? '[]',
    )

    expect(inspecciones.length).toBe(1)
    expect(inspecciones[0].resultado).toBe('No_conforme')
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(1)
  })
})