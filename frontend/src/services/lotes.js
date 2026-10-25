export const LOTES = [
  {
    codigo: 'LOT-20261012-001',
    producto: 'Pan amasado',
    cantidad: 2500,
    elaboracion: '12/10/2026 06:30',
    linea: 'Línea 2',
    insumos: [
      {
        codigo: 'HAR-20260920-A',
        nombre: 'Harina Extra Pan',
        proveedor: 'Molinos del Centro',
        cantidad: '150 kg',
        vencimiento: '20/03/2027',
      },
      {
        codigo: 'LEV-20261001-B',
        nombre: 'Levadura fresca',
        proveedor: 'Levaduras Chile',
        cantidad: '5 kg',
        vencimiento: '25/11/2026',
      },
      {
        codigo: 'SAL-20260815-01',
        nombre: 'Sal Industrial',
        proveedor: 'Salinas Sur',
        cantidad: '2,5 kg',
        vencimiento: '15/08/2028',
      },
    ],
    controlesEjemplo: [
      {
        parametro: 'Peso',
        rango: '475 a 525 g',
        valor: '502 g',
        resultado: 'Cumple',
      },
      {
        parametro: 'Humedad',
        rango: '35 a 40 %',
        valor: '37,5 %',
        resultado: 'Cumple',
      },
      {
        parametro: 'Color de corteza',
        rango: 'Dorado uniforme',
        valor: 'Dorado uniforme',
        resultado: 'Cumple',
      },
    ],
    distribucion: [
      {
        pedido: 'PED-8840',
        cliente: 'Supermercados San Bernardo',
        cantidad: 1000,
        despacho: '12/10/2026 10:00',
      },
      {
        pedido: 'PED-8842',
        cliente: 'Minimarket El Roble',
        cantidad: 500,
        despacho: '12/10/2026 11:30',
      },
      {
        pedido: 'PED-8845',
        cliente: 'Panadería Central',
        cantidad: 1000,
        despacho: '12/10/2026 12:15',
      },
    ],
  },
]