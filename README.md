# EVA_1_FULLSTACK

Órdenes de Producción y Control de Calidad (Alejandrina)

- Formulario de registro de órdenes de producción con selección dependiente: al elegir la categoría (Panadería/Pastelería), el select de producto se filtra automáticamente mostrando solo los productos de esa categoría.
- Formulario de registro de inspecciones de control de calidad con 5 bloques de parámetros independientes y opcionales (Peso, Humedad, Color de Corteza, Textura, Sabor), cada uno con retroalimentación en vivo apenas se ingresa el valor, sin esperar a enviar el formulario.
- Validaciones en ambos formularios organizadas en 3 niveles: sintácticas (formato y campos obligatorios), semánticas (fechas y números con sentido lógico) y de negocio (reglas propias de la panadería, como lote mínimo de 10 unidades o que una inspección no pueda marcarse "Conforme" si algún parámetro está fuera de rango).
- Se mantiene el uso del stylesheet CSS creado anteriormente por Anthony, con agregados propios para estos dos formularios: clases .campo / .fila para el layout de los inputs, .grupo-parametro para encapsular cada parámetro de calidad, y .estado-parametro (.cumple / .no-cumple) para el feedback visual en vivo.




---
# Melissa (o･ω･o)
---
## Archivos 
- reportes.html -> Pagina de reportes con KPIs, generador pers. y ultimos lotes.
- reportes.js -> validacion fechas, calculo dias del periodo y mostrar mensaje dinamico al generar reporte.
- prod_ing.html -> pagina productos e ingredientes con catalogo, stock y formulario
- prod_ing.js -> agregar productos dinamicamente a la tabla, valida dupes y actualiza contador
- Style.css -> cambio de la paleta de colores y class para status
---
## funcionalidades
**reportes.js**
- validacion de fechas (inicio <= fin)
- calculo automatico de dias del periodo
- mensaje dinamico con tipo de reporte y del rango seleccionado

**prod_ing.js**
- insercion denamica de nuevos productos en tabla
- validacion campos obligatorios y codigo dupe
- actualizacion automatica del contador de productos
- formato de precio y stock con separador de miles
- mensaje de exito/error con cierre automatico a los  4seg

**Style.css**
- cambio de los colores base de la paleta de colores
- añadir status para los data cell 
---
## uso
abrir reportes.html o prod_ing.html en navegador ambas cargan js automaticamente
---
## notas
- los js deben estar en la misma carpeta que sus html respectivos
- el css se mantiene sin camibos

## Anthony

Inicio y Tranzabilidad 

- El archivo "inicio.html" define la disposición de la pantalla principal de "Pan del Sur"; muestra el logotipo y el eslogan de la empresa, así como las opciones de navegación para los 6 módulos del sistema. Presenta la historia de la compañía, su producción diaria de 15.000 unidades en San Bernardo, la ubicación de sus sucursales y las garantías de servicio. El script "inicio.js" complementa esta interfaz haciendo interactivo el menú de navegación, permitiendo el cálculo de precios en tiempo real (calcularTotal()) y gestionando las notificaciones de confirmación al generar cotizaciones (initCotizador()).

- El archivo Tranzabilidad.html define la estructura del módulo de control de lotes y trazabilidad bidireccional para Pan del Sur. Incluye un formulario de búsqueda para escanear o introducir códigos de lote o de materia prima, un panel con información general del producto (código, estado de calidad, fecha de producción y línea de producción) y tres tablas detalladas que abarcan: las materias primas utilizadas, incluidos los datos del proveedor y las fechas de caducidad (trazabilidad ascendente); los parámetros de control de calidad; y los destinos finales de las unidades suministradas a los clientes (trazabilidad descendente). Por su parte, el archivo trazabilidad.js habilita la interactividad de la herramienta de búsqueda mediante la función initBuscadorLote(), la cual valida la entrada del usuario e inicia el proceso de consulta de lotes.
