
import {
  obtenerInspecciones,
  crearInspeccion,
  actualizarInspeccion,
  eliminarInspeccion,
} from '../src/services/inspecciones'

describe('Pruebas de gestión de inspecciones - Pan del Sur', () => {
  let almacenamiento

  beforeEach(() => {
    almacenamiento = {}

    spyOn(Storage.prototype, 'getItem').and.callFake(
      (clave) => almacenamiento[clave] ?? null,
    )

    spyOn(Storage.prototype, 'setItem').and.callFake(
      (clave, valor) => {
        almacenamiento[clave] = String(valor)
      },
    )
  })

  it('retorna un arreglo vacío cuando no existen inspecciones', () => {
    expect(obtenerInspecciones()).toEqual([])
  })

  it('rechaza datos almacenados que no son un arreglo', () => {
    almacenamiento['pan-del-sur-inspecciones'] = JSON.stringify({
      dato: 'incorrecto',
    })

    expect(() => obtenerInspecciones()).toThrowError(
      'Los datos de inspecciones no son válidos.',
    )
  })

  it('recupera las inspecciones almacenadas correctamente', () => {
    const registros = [{ id: 'INS-01', lote: 'LOT-001' }]

    almacenamiento['pan-del-sur-inspecciones'] =
      JSON.stringify(registros)

    expect(obtenerInspecciones()).toEqual(registros)
  })

  it('crea una inspección normalizando lote y técnico', () => {
    const nueva = crearInspeccion({
      lote: '  lot-001  ',
      tecnico: '  María Pérez  ',
      resultado: 'Conforme',
    })

    expect(nueva.lote).toBe('LOT-001')
    expect(nueva.tecnico).toBe('María Pérez')
    expect(typeof nueva.id).toBe('string')
    expect(nueva.fechaRegistro).toBeDefined()
    expect(obtenerInspecciones().length).toBe(1)
  })

  it('actualiza una inspección conservando ID y fecha', () => {
    const original = crearInspeccion({
      lote: 'LOT-001',
      tecnico: 'Ana',
      resultado: 'Conforme',
    })

    const actualizada = actualizarInspeccion(original.id, {
      resultado: 'No conforme',
      id: 'ID-ALTERADO',
      fechaRegistro: '2000-01-01',
    })

    expect(actualizada.resultado).toBe('No conforme')
    expect(actualizada.id).toBe(original.id)
    expect(actualizada.fechaRegistro).toBe(original.fechaRegistro)
    expect(obtenerInspecciones().length).toBe(1)
  })

  it('rechaza actualizar una inspección inexistente', () => {
    expect(() =>
      actualizarInspeccion('ID-INEXISTENTE', {
        resultado: 'Conforme',
      }),
    ).toThrowError('No se encontró la inspección.')
  })

  it('elimina una inspección existente', () => {
    const primera = crearInspeccion({
      lote: 'LOT-001',
      tecnico: 'Ana',
    })

    const segunda = crearInspeccion({
      lote: 'LOT-002',
      tecnico: 'Pedro',
    })

    eliminarInspeccion(primera.id)

    const restantes = obtenerInspecciones()

    expect(restantes.length).toBe(1)
    expect(restantes[0].id).toBe(segunda.id)
  })

  it('rechaza eliminar una inspección inexistente', () => {
    expect(() =>
      eliminarInspeccion('ID-INEXISTENTE'),
    ).toThrowError('No se encontró la inspección.')
  })
})
