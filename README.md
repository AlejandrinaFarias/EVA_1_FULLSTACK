# EVA_1_FULLSTACK

Órdenes de Producción y Control de Calidad (Alejandrina)

- Formulario de registro de órdenes de producción con selección dependiente: al elegir la categoría (Panadería/Pastelería), el select de producto se filtra automáticamente mostrando solo los productos de esa categoría.
- Formulario de registro de inspecciones de control de calidad con 5 bloques de parámetros independientes y opcionales (Peso, Humedad, Color de Corteza, Textura, Sabor), cada uno con retroalimentación en vivo apenas se ingresa el valor, sin esperar a enviar el formulario.
- Validaciones en ambos formularios organizadas en 3 niveles: sintácticas (formato y campos obligatorios), semánticas (fechas y números con sentido lógico) y de negocio (reglas propias de la panadería, como lote mínimo de 10 unidades o que una inspección no pueda marcarse "Conforme" si algún parámetro está fuera de rango).
- Se mantiene el uso del stylesheet CSS creado anteriormente por Anthony, con agregados propios para estos dos formularios: clases .campo / .fila para el layout de los inputs, .grupo-parametro para encapsular cada parámetro de calidad, y .estado-parametro (.cumple / .no-cumple) para el feedback visual en vivo.
