const formOrden = document.getElementById('formOrden');
const selectCategoria = document.getElementById('categoria');
const selectProducto = document.getElementById('producto');

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
};

selectCategoria.addEventListener('change', function () {
  const categoria = this.value;

 selectProducto.innerHTML = '';

  if (categoria === '') {
    selectProducto.disabled = true;
    const opcionInicial = document.createElement('option');
    opcionInicial.value = '';
    opcionInicial.textContent = 'Primero selecciona una categoría';
    selectProducto.appendChild(opcionInicial);
    return;
  }

  selectProducto.disabled = false;
  const opcionPorDefecto = document.createElement('option');
  opcionPorDefecto.value = '';
  opcionPorDefecto.textContent = 'Selecciona una opción';
  selectProducto.appendChild(opcionPorDefecto);

  PRODUCTOS_POR_CATEGORIA[categoria].forEach(function (producto) {
    const opcion = document.createElement('option');
    opcion.value = producto.valor;
    opcion.textContent = producto.texto;
    selectProducto.appendChild(opcion);
  });
});

const REGLAS_NEGOCIO = {
  anticipacionMinimaDias: 1,
  cantidadMinima: 10,
  estadoInicialPermitido: 'Programado',
};

formOrden.addEventListener('submit', function (e) {
  e.preventDefault();

  const erroresSintacticos = [];
  const erroresSemanticos = [];
  const erroresNegocio = [];

  function valor(nombreCampo) {
    const campo = formOrden.elements[nombreCampo];
    return campo ? campo.value.trim() : '';
  }

  const codigo = valor('codigo');
  if (codigo === '') {
    erroresSintacticos.push('El código de producto es obligatorio.');
  } else if (!/^[A-Za-z0-9-]{3,}$/.test(codigo)) {
    erroresSintacticos.push('El código de producto debe tener al menos 3 caracteres (letras, números o guiones).');
  }

  if (valor('categoria') === '') {
    erroresSintacticos.push('Debes seleccionar una categoría.');
  }

  if (valor('producto') === '') {
    erroresSintacticos.push('Debes seleccionar un producto.');
  }

  const cantidad = valor('cantidad');
  if (cantidad === '') {
    erroresSintacticos.push('La cantidad a producir es obligatoria.');
  } else if (isNaN(cantidad)) {
    erroresSintacticos.push('La cantidad a producir debe ser un número.');
  }

  const pesoUnidad = valor('peso_unidad');
  if (pesoUnidad === '') {
    erroresSintacticos.push('El peso por unidad es obligatorio.');
  } else if (isNaN(pesoUnidad)) {
    erroresSintacticos.push('El peso por unidad debe ser un número.');
  }

  const fechaProduccion = valor('fecha_produccion');
  if (fechaProduccion === '') {
    erroresSintacticos.push('La fecha de producción es obligatoria.');
  }

  if (valor('estado') === '') {
    erroresSintacticos.push('Debes seleccionar un estado.');
  }

  if (valor('prioridad') === '') {
    erroresSintacticos.push('Debes seleccionar una prioridad.');
  }

  if (erroresSintacticos.length > 0) {
    alert('Errores de formato:\n\n- ' + erroresSintacticos.join('\n- '));
    return;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaProduccionDate = new Date(fechaProduccion + 'T00:00:00');

  if (fechaProduccionDate < hoy) {
    erroresSemanticos.push('La fecha de producción no puede ser una fecha pasada.');
  }

  if (Number(cantidad) <= 0) {
    erroresSemanticos.push('La cantidad a producir debe ser mayor a 0.');
  } else if (Number(cantidad) > 200) {
    erroresSemanticos.push('La cantidad a producir no puede superar 200 unidades por orden.');
  }

  if (Number(pesoUnidad) <= 0) {
    erroresSemanticos.push('El peso por unidad debe ser mayor a 0.');
  }

  if (erroresSemanticos.length > 0) {
    alert('Errores de lógica en los datos:\n\n- ' + erroresSemanticos.join('\n- '));
    return;
  }

  const diasDiferencia = Math.round((fechaProduccionDate - hoy) / (1000 * 60 * 60 * 24));
  if (diasDiferencia < REGLAS_NEGOCIO.anticipacionMinimaDias) {
    erroresNegocio.push(`La producción debe programarse con al menos ${REGLAS_NEGOCIO.anticipacionMinimaDias} día(s) de anticipación.`);
  }

  if (Number(cantidad) < REGLAS_NEGOCIO.cantidadMinima) {
    erroresNegocio.push(`El lote mínimo de producción es de ${REGLAS_NEGOCIO.cantidadMinima} unidades.`);
  }

  if (valor('estado') !== REGLAS_NEGOCIO.estadoInicialPermitido) {
    erroresNegocio.push(`Toda orden nueva debe crearse en estado "${REGLAS_NEGOCIO.estadoInicialPermitido}".`);
  }

  if (erroresNegocio.length > 0) {
    alert('La orden no cumple las políticas de producción:\n\n- ' + erroresNegocio.join('\n- '));
    return;
  }

  alert('¡Orden de producción válida! Lista para registrar.');
});
