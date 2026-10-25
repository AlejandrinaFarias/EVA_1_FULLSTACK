# 🍞 Pan del Sur | Sistema de Producción y Control de Calidad

**Proyecto académico — Desarrollo Fullstack II (DSY1104)**

**Evaluación Parcial N.º 2 | Migración del frontend a React**

Pan del Sur es una aplicación web orientada a apoyar la administración de los procesos productivos de una empresa de panadería y pastelería. El sistema permite gestionar órdenes de producción, registrar inspecciones de calidad, consultar productos e ingredientes, realizar búsquedas de trazabilidad y generar reportes.

El proyecto fue desarrollado inicialmente con HTML, CSS y JavaScript. Para la segunda evaluación, el frontend fue migrado a **React con Vite**, manteniendo la identidad visual original e incorporando una estructura modular basada en componentes reutilizables.

## 1. Objetivo del proyecto

Desarrollar una plataforma web que permita organizar y centralizar la información de Pan del Sur, facilitando el control de producción, el seguimiento de lotes, la administración de productos e ingredientes y la evaluación de calidad.

Los principales objetivos son:

- Digitalizar el registro y seguimiento de órdenes de producción.
- Facilitar el control de calidad de los productos elaborados.
- Organizar la información del catálogo y el inventario.
- Permitir la búsqueda y consulta de trazabilidad de lotes.
- Proporcionar reportes de apoyo a la gestión.
- Ofrecer una interfaz clara, responsiva y consistente.

## 2. Evolución del proyecto

### Evaluación Parcial 1 — Desarrollo inicial

Durante la primera etapa se construyeron las interfaces utilizando HTML, CSS y JavaScript.

Se desarrollaron las pantallas de Inicio, Órdenes de Producción, Control de Calidad, Productos e Ingredientes, Trazabilidad y Reportes.

También se implementaron formularios, validaciones, búsquedas, cálculos y elementos interactivos.

### Evaluación Parcial 2 — Migración a React

En esta etapa se reorganizó el frontend utilizando React y Vite.

Las principales mejoras fueron:

- Migración de las pantallas originales a componentes React.
- Incorporación de navegación mediante React Router.
- Implementación de componentes reutilizables.
- Gestión de formularios mediante estados.
- Uso de props para comunicar información entre componentes.
- Implementación de operaciones CRUD.
- Persistencia de registros mediante `localStorage`.
- Incorporación de validaciones sintácticas, semánticas y de negocio.
- Adaptación responsiva mediante Bootstrap y CSS.
- Implementación de pruebas automatizadas con Jasmine y Karma.

Esta migración permitió mejorar la organización del código y separar las responsabilidades de presentación, lógica y manejo de datos.

## 3. Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| React 19 | Construcción de interfaces mediante componentes, props y estados. |
| Vite | Entorno de desarrollo y compilación. |
| JavaScript y JSX | Lógica de la aplicación y definición de componentes. |
| React Router DOM 7 | Navegación entre las vistas del sistema. |
| Bootstrap 5 | Diseño responsivo. |
| CSS | Estilos personalizados e identidad visual. |
| localStorage | Persistencia local de registros. |
| Jasmine | Definición de pruebas unitarias. |
| Karma | Ejecución automatizada de pruebas. |
| Webpack y Babel | Procesamiento de JSX en el entorno de testing. |
| Git y GitHub | Control de versiones y colaboración. |

## 4. Módulos del sistema

### 4.1. Inicio

La página principal presenta información general de Pan del Sur, su identidad visual y productos disponibles.

Incluye tarjetas de cotización que permiten seleccionar cantidades y calcular automáticamente el valor total de los productos.

### 4.2. Órdenes de producción

Permite registrar, consultar, modificar y eliminar órdenes de producción.

El formulario utiliza una selección dependiente: al elegir una categoría, como Panadería o Pastelería, se actualizan las opciones de productos disponibles.

Las validaciones se organizan en tres niveles:

- **Sintácticas:** verifican formatos y campos obligatorios.
- **Semánticas:** comprueban que fechas y valores numéricos tengan sentido.
- **De negocio:** aplican reglas propias de Pan del Sur, como la cantidad mínima de producción.

Los registros se almacenan localmente y pueden recuperarse al actualizar la página.

### 4.3. Control de calidad

Permite registrar y administrar inspecciones de calidad asociadas a los productos elaborados.

El formulario contempla cinco parámetros:

1. Peso.
2. Humedad.
3. Color de corteza.
4. Textura.
5. Sabor.

Los parámetros se evalúan mediante reglas de validación y muestran retroalimentación visual.

El sistema evita registrar una inspección como «Conforme» cuando los parámetros evaluados incumplen las condiciones establecidas.

Cuando corresponde registrar una inspección «No conforme», se solicitan observaciones.

### 4.4. Productos e ingredientes

Permite consultar y administrar información de productos e ingredientes.

Entre sus funcionalidades se encuentran:

- Visualización del catálogo.
- Búsqueda de productos.
- Registro de nuevos productos.
- Validación de códigos duplicados.
- Actualización de información.
- Eliminación de registros.
- Consulta de existencias.
- Identificación de ingredientes con stock bajo.

### 4.5. Lotes y trazabilidad

Permite consultar información de lotes de producción mediante criterios de búsqueda.

La trazabilidad considera información relacionada con:

- Identificación y estado del lote.
- Productos elaborados.
- Materias primas utilizadas.
- Proveedores.
- Inspecciones de calidad.
- Antecedentes de clientes y distribución disponibles.

Este módulo facilita el seguimiento de la información asociada a los procesos productivos.

### 4.6. Reportes

Permite consultar información relacionada con las operaciones de Pan del Sur.

Incluye selección de tipos de reporte, validación de períodos y presentación de resultados basados en los registros disponibles.

Entre las consultas consideradas se encuentran producción, control de calidad e inventario de ingredientes.

## 5. Estructura del repositorio

La rama `evaluacion-2-react` conserva el desarrollo del proyecto y contiene la carpeta `frontend`, donde se encuentra la aplicación React.

```text
EVA_1_FULLSTACK/
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Inicio.jsx
│   │   │   ├── OrdenesProduccion.jsx
│   │   │   ├── ControlCalidad.jsx
│   │   │   ├── ProductosIngredientes.jsx
│   │   │   ├── Trazabilidad.jsx
│   │   │   └── Reportes.jsx
│   │   ├── data/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tests/
│   │   ├── componentes.spec.jsx
│   │   └── pantallas.spec.jsx
│   ├── karma.conf.cjs
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── README.md
```

La carpeta `src/components` contiene los elementos reutilizables de la interfaz.

La carpeta `src/pages` contiene las páginas funcionales.

La carpeta `src/data` organiza los datos, las operaciones CRUD y las validaciones.

La carpeta `tests` contiene las pruebas automatizadas.

## 6. Instalación y ejecución

### Requisitos previos

Se recomienda disponer de una versión reciente de Node.js compatible con las dependencias del proyecto, npm y Google Chrome.

### Clonar la rama

```bash
git clone -b evaluacion-2-react https://github.com/AlejandrinaFarias/EVA_1_FULLSTACK.git
```

### Ingresar al frontend

```bash
cd EVA_1_FULLSTACK/frontend
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar la aplicación

```bash
npm run dev
```

La terminal mostrará la dirección local del servidor Vite, normalmente:

`http://localhost:5173/`

Abrir la dirección indicada en el navegador.

## 7. Navegación

La aplicación utiliza React Router para administrar las rutas.

| Ruta | Módulo |
|---|---|
| `/` | Inicio |
| `/productos` | Productos e Ingredientes |
| `/ordenes` | Órdenes de Producción |
| `/calidad` | Control de Calidad |
| `/trazabilidad` | Lotes y Trazabilidad |
| `/reportes` | Reportes |

Las rutas se encuentran definidas en `src/App.jsx`.

Cuando se ingresa una ruta inexistente, se presenta una página de respaldo.

## 8. Componentes, props y estados

La aplicación utiliza componentes React para organizar la interfaz.

Los componentes comunes son:

- `Header.jsx`: presenta el encabezado y recibe información mediante props.
- `Navbar.jsx`: administra los enlaces de navegación.
- `Footer.jsx`: presenta información común al pie de las páginas.

Las páginas utilizan estados para controlar formularios, búsquedas, registros seleccionados, mensajes y resultados.

Por ejemplo, cuando un usuario cambia la categoría en el formulario de órdenes, el estado se actualiza y React modifica las opciones disponibles del selector de productos.

## 9. Persistencia y operaciones CRUD

La aplicación utiliza `localStorage` para conservar información en el navegador.

Los módulos de datos administran operaciones de creación, consulta, modificación y eliminación.

Este mecanismo permite simular la persistencia de registros sin utilizar todavía una base de datos externa.

**Importante:** los datos se almacenan en el navegador utilizado. No existe sincronización automática entre diferentes dispositivos o usuarios.

## 10. Pruebas unitarias

El proyecto incorpora un entorno de pruebas automatizadas utilizando Jasmine y Karma.

Se han escrito **22 casos de prueba**, distribuidos en dos archivos:

| Archivo | Cantidad | Funcionalidades |
|---|---:|---|
| `componentes.spec.jsx` | 12 | Header, Navbar, órdenes de producción y control de calidad. |
| `pantallas.spec.jsx` | 10 | Inicio, productos e ingredientes, trazabilidad y reportes. |
| **Total** | **22** | Componentes, lógica, validaciones, DOM y persistencia simulada. |

Las pruebas verifican comportamientos como:

- Renderizado de componentes y recepción de props.
- Navegación y rutas activas.
- Actualización de estados.
- Validación de formularios.
- Registro, modificación y eliminación de órdenes.
- Manejo de errores de almacenamiento.
- Validación de inspecciones de calidad.
- Cálculo de cotizaciones.
- Búsqueda y registro de productos.
- Identificación de stock bajo.
- Búsqueda de lotes.
- Validación de fechas y filtrado de reportes.

### Ejecutar las pruebas

Desde la carpeta `frontend`:

```bash
npm test
```

### Ejecutar pruebas en modo observación

```bash
npm run test:watch
```

### Consultar cobertura

Una vez finalizada la ejecución, revisar el resumen en la terminal y abrir:

```text
frontend/coverage/html/index.html
```

El informe permite analizar la cobertura de sentencias, ramas, funciones y líneas.

**Nota:** las 22 pruebas están implementadas en el código. Su resultado final y los porcentajes de cobertura deben confirmarse mediante una ejecución exitosa.

## 11. Verificación de calidad del código

### Ejecutar ESLint

```bash
npm run lint
```

### Compilar la aplicación

```bash
npm run build
```

### Previsualizar la compilación

```bash
npm run preview
```

Estos comandos permiten revisar el código, generar una compilación y comprobar su presentación antes del despliegue.

## 12. Identidad visual y diseño responsivo

El proyecto conserva la identidad visual establecida en la primera evaluación, con una paleta de colores inspirada en la panadería.

Se utilizan tonos café, cobre y beige, junto con componentes y estilos consistentes entre módulos.

Bootstrap y CSS personalizado permiten adaptar la distribución de los elementos a diferentes tamaños de pantalla.

El diseño busca facilitar la navegación y el uso de formularios tanto en computadores como en dispositivos móviles.

## 13. Documentación

La documentación de la Evaluación Parcial 2 contempla:

- **Especificación de Requisitos de Software (ERS):** descripción del alcance, requisitos funcionales y no funcionales.
- **Documento de cobertura de testing:** descripción de las pruebas, configuración, mocks, cobertura funcional y análisis de resultados.
- **Repositorio GitHub:** código fuente, componentes, módulos de datos y archivos de pruebas.

## 14. Limitaciones y mejoras futuras

La versión actual corresponde a un frontend académico.

Entre sus limitaciones se encuentran la ausencia de autenticación centralizada, backend y base de datos remota.

La información persistente depende del almacenamiento local del navegador.

Como mejoras futuras se consideran la incorporación de una API, una base de datos centralizada, gestión de usuarios, sincronización entre dispositivos y ampliación de las pruebas automatizadas.

## 15. Repositorio y rama de desarrollo

**Repositorio:** https://github.com/AlejandrinaFarias/EVA_1_FULLSTACK

**Rama:** `evaluacion-2-react`

**Frontend React:** https://github.com/AlejandrinaFarias/EVA_1_FULLSTACK/tree/evaluacion-2-react/frontend

---

**Pan del Sur — Sistema de Producción y Control de Calidad**

Proyecto académico desarrollado para la Evaluación Parcial N.º 2 de Desarrollo Fullstack II, DSY1104.
