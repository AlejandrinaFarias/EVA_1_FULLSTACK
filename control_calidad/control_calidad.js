const formControlCalidad = document.getElementById('formControlCalidad');

const RANGOS_CALIDAD = {
  humedad: { min: 35, max: 40 },
  pesoToleranciaPorcentaje: 5, // ± 5%
};

const VALOR_ACEPTABLE = {
  color_corteza: 'dorado_uniforme',
  textura: 'esponjoso',
  sabor: 'caracteristico',
};

const ETIQUETAS = {
  color_corteza: {
    dorado_uniforme: 'Dorado uniforme',
    palido: 'Palido',
    quemado: 'Quemado',
    disparejo: 'Disparejo / con manchas',
  },
  textura: {
    esponjoso: 'Esponjoso',
    duro: 'Duro',
    seco: 'Seco',
    gomoso: 'Gomoso',
    compacto: 'Compacto / apelmazado',
  },
  sabor: {
    caracteristico: 'Caracteristico',
    acido: 'Acido',
    amargo: 'Amargo',
    insipido: 'Insipido / sin sabor',
    salado: 'Demasiado salado',
    rancio: 'Rancio',
  },
};

const inputPesoEspecificado = document.getElementById('peso_especificado');
const inputPesoRegistrado = document.getElementById('peso_registrado');
const estadoPeso = document.getElementById('estado_peso');

function actualizarEstadoPeso() {
  const especificado = inputPesoEspecificado.value;
  const registrado = inputPesoRegistrado.value;

  if (especificado === '' || registrado === '' || isNaN(especificado) || isNaN(registrado) || Number(especificado) <= 0) {
    estadoPeso.textContent = '';
    estadoPeso.className = 'estado-parametro';
    return;
  }

  const desviacion = Math.abs((Number(registrado) - Number(especificado)) / Number(especificado)) * 100;

  if (desviacion <= RANGOS_CALIDAD.pesoToleranciaPorcentaje) {
    estadoPeso.textContent = `Producto cumple (desviacion ${desviacion.toFixed(1)}%)`;
    estadoPeso.className = 'estado-parametro cumple';
  } else {
    estadoPeso.textContent = `Producto no cumple (desviacion ${desviacion.toFixed(1)}%, supera la tolerancia de ± ${RANGOS_CALIDAD.pesoToleranciaPorcentaje}%)`;
    estadoPeso.className = 'estado-parametro no-cumple';
  }
}

inputPesoEspecificado.addEventListener('input', actualizarEstadoPeso);
inputPesoRegistrado.addEventListener('input', actualizarEstadoPeso);

const inputHumedad = document.getElementById('humedad_registrada');
const estadoHumedad = document.getElementById('estado_humedad');

function actualizarEstadoHumedad() {
  const humedad = inputHumedad.value;

  if (humedad === '' || isNaN(humedad)) {
    estadoHumedad.textContent = '';
    estadoHumedad.className = 'estado-parametro';
    return;
  }

  const dentroDelRango = Number(humedad) >= RANGOS_CALIDAD.humedad.min && Number(humedad) <= RANGOS_CALIDAD.humedad.max;

  if (dentroDelRango) {
    estadoHumedad.textContent = 'Producto cumple';
    estadoHumedad.className = 'estado-parametro cumple';
  } else {
    estadoHumedad.textContent = `Producto no cumple (rango aceptable ${RANGOS_CALIDAD.humedad.min}% - ${RANGOS_CALIDAD.humedad.max}%)`;
    estadoHumedad.className = 'estado-parametro no-cumple';
  }
}

inputHumedad.addEventListener('input', actualizarEstadoHumedad);

function conectarEstadoSensorial(idSelect, idEstado, parametro) {
  const select = document.getElementById(idSelect);
  const estadoEl = document.getElementById(idEstado);

  select.addEventListener('change', function () {
    const valorSeleccionado = this.value;

    if (valorSeleccionado === '') {
      estadoEl.textContent = '';
      estadoEl.className = 'estado-parametro';
      return;
    }

    if (valorSeleccionado === VALOR_ACEPTABLE[parametro]) {
      estadoEl.textContent = 'Producto cumple';
      estadoEl.className = 'estado-parametro cumple';
    } else {
      estadoEl.textContent = `Producto no cumple (${ETIQUETAS[parametro][valorSeleccionado]})`;
      estadoEl.className = 'estado-parametro no-cumple';
    }
  });
}

conectarEstadoSensorial('color_corteza', 'estado_color_corteza', 'color_corteza');
conectarEstadoSensorial('textura', 'estado_textura', 'textura');
conectarEstadoSensorial('sabor', 'estado_sabor', 'sabor');

formControlCalidad.addEventListener('submit', function (e) {
  e.preventDefault();

  const erroresSintacticos = [];
  const erroresSemanticos = [];
  const erroresNegocio = [];

  function valor(nombreCampo) {
    const campo = formControlCalidad.elements[nombreCampo];
    return campo ? campo.value.trim() : '';
  }

  const lote = valor('lote');
  if (lote === '') {
    erroresSintacticos.push('El codigo de lote es obligatorio.');
  } else if (!/^[A-Za-z0-9-]{3,}$/.test(lote)) {
    erroresSintacticos.push('El codigo de lote debe tener al menos 3 caracteres (letras, numeros o guiones).');
  }

  if (valor('producto') === '') {
    erroresSintacticos.push('Debes seleccionar un producto.');
  }

  const fechaInspeccion = valor('fecha_inspeccion');
  if (fechaInspeccion === '') {
    erroresSintacticos.push('La fecha de inspeccion es obligatoria.');
  }

  const tecnico = valor('tecnico');
  if (tecnico === '') {
    erroresSintacticos.push('El tecnico responsable es obligatorio.');
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(tecnico)) {
    erroresSintacticos.push('El nombre del tecnico debe tener al menos 3 letras y solo puede contener letras.');
  }

  const pesoEspecificado = valor('peso_especificado');
  const pesoRegistrado = valor('peso_registrado');
  const pesoEvaluado = pesoEspecificado !== '' || pesoRegistrado !== '';
  if (pesoEvaluado) {
    if (pesoEspecificado === '' || pesoRegistrado === '') {
      erroresSintacticos.push('En el parametro Peso debes completar tanto el peso especificado como el peso registrado.');
    } else if (isNaN(pesoEspecificado) || isNaN(pesoRegistrado)) {
      erroresSintacticos.push('El peso especificado y el peso registrado deben ser numeros.');
    }
  }

  const humedadRegistrada = valor('humedad_registrada');
  const humedadEvaluada = humedadRegistrada !== '';
  if (humedadEvaluada && isNaN(humedadRegistrada)) {
    erroresSintacticos.push('La humedad registrada debe ser un numero.');
  }

  const colorCorteza = valor('color_corteza');
  const textura = valor('textura');
  const sabor = valor('sabor');
  const colorEvaluado = colorCorteza !== '';
  const texturaEvaluada = textura !== '';
  const saborEvaluado = sabor !== '';

  const algunParametroEvaluado = pesoEvaluado || humedadEvaluada || colorEvaluado || texturaEvaluada || saborEvaluado;
  if (!algunParametroEvaluado) {
    erroresSintacticos.push('Debes completar al menos uno de los parametros de calidad (Peso, Humedad, Color, Textura o Sabor).');
  }

  const resultado = valor('resultado');
  if (resultado === '') {
    erroresSintacticos.push('Debes seleccionar el resultado de la inspeccion.');
  }

  if (erroresSintacticos.length > 0) {
    alert('Errores de formato:\n\n- ' + erroresSintacticos.join('\n- '));
    return;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaInspeccionDate = new Date(fechaInspeccion + 'T00:00:00');

  if (fechaInspeccionDate > hoy) {
    erroresSemanticos.push('La fecha de inspeccion no puede ser una fecha futura.');
  }

  if (pesoEvaluado && (Number(pesoEspecificado) <= 0 || Number(pesoRegistrado) <= 0)) {
    erroresSemanticos.push('El peso especificado y el peso registrado deben ser mayores a 0.');
  }

  if (humedadEvaluada && (Number(humedadRegistrada) < 0 || Number(humedadRegistrada) > 100)) {
    erroresSemanticos.push('La humedad registrada debe estar entre 0% y 100%.');
  }

  if (erroresSemanticos.length > 0) {
    alert('Errores de logica en los datos:\n\n- ' + erroresSemanticos.join('\n- '));
    return;
  }

  if (pesoEvaluado) {
    const desviacionPorcentaje = Math.abs((Number(pesoRegistrado) - Number(pesoEspecificado)) / Number(pesoEspecificado)) * 100;
    if (desviacionPorcentaje > RANGOS_CALIDAD.pesoToleranciaPorcentaje && resultado === 'Conforme') {
      erroresNegocio.push(`El peso registrado se desvia ${desviacionPorcentaje.toFixed(1)}% del especificado, superando la tolerancia de ± ${RANGOS_CALIDAD.pesoToleranciaPorcentaje}%. No puede marcarse como "Conforme".`);
    }
  }

  if (humedadEvaluada) {
    const humedadDentroDelRango = Number(humedadRegistrada) >= RANGOS_CALIDAD.humedad.min && Number(humedadRegistrada) <= RANGOS_CALIDAD.humedad.max;
    if (!humedadDentroDelRango && resultado === 'Conforme') {
      erroresNegocio.push(`La humedad registrada (${humedadRegistrada}%) esta fuera del rango aceptable (${RANGOS_CALIDAD.humedad.min}% - ${RANGOS_CALIDAD.humedad.max}%). No puede marcarse como "Conforme".`);
    }
  }

  if (colorEvaluado && colorCorteza !== VALOR_ACEPTABLE.color_corteza && resultado === 'Conforme') {
    erroresNegocio.push(`Color de Corteza fue registrado como "${ETIQUETAS.color_corteza[colorCorteza]}" (defecto), por lo que el resultado no puede ser "Conforme".`);
  }

  if (texturaEvaluada && textura !== VALOR_ACEPTABLE.textura && resultado === 'Conforme') {
    erroresNegocio.push(`Textura fue registrada como "${ETIQUETAS.textura[textura]}" (defecto), por lo que el resultado no puede ser "Conforme".`);
  }

  if (saborEvaluado && sabor !== VALOR_ACEPTABLE.sabor && resultado === 'Conforme') {
    erroresNegocio.push(`Sabor fue registrado como "${ETIQUETAS.sabor[sabor]}" (defecto), por lo que el resultado no puede ser "Conforme".`);
  }

  if (resultado === 'No_conforme' && valor('observaciones') === '') {
    erroresNegocio.push('Debes registrar observaciones o acciones correctivas cuando el resultado es "No conforme".');
  }

  if (erroresNegocio.length > 0) {
    alert('La inspeccion no cumple las politicas de calidad:\n\n- ' + erroresNegocio.join('\n- '));
    return;
  }

  alert('¡Inspeccion de calidad registrada correctamente!');
});
