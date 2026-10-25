# 🍞 Pan del Sur — Sistema de Producción y Control de Calidad

Aplicación web desarrollada con **React y Vite** para apoyar la gestión de producción, el control de calidad, el inventario de productos e ingredientes y la trazabilidad de lotes de la empresa ficticia Pan del Sur.

Este proyecto corresponde a la **Evaluación Parcial N.º 2 de Desarrollo Fullstack II (DSY1104)**, en la cual se realizó la migración del frontend inicial a una arquitectura basada en componentes React, incorporando navegación dinámica, formularios interactivos, validaciones, operaciones CRUD, persistencia local y pruebas automatizadas.

## 1. Objetivo del proyecto

Desarrollar una plataforma web que permita centralizar y organizar información relacionada con los procesos productivos de Pan del Sur, facilitando el registro de operaciones, la consulta de información y el seguimiento de los controles de calidad.

La aplicación busca mejorar la organización de los registros y ofrecer una interfaz clara, reutilizable y adaptable a diferentes dispositivos.

## 2. Tecnologías utilizadas

| Tecnología | Uso dentro del proyecto |
|---|---|
| React 19 | Construcción de interfaces mediante componentes, props y estados. |
| Vite | Entorno de desarrollo y compilación del frontend. |
| JavaScript y JSX | Implementación de lógica, componentes y validaciones. |
| React Router DOM 7 | Navegación entre las distintas páginas de la aplicación. |
| Bootstrap 5 | Diseño responsivo y componentes visuales. |
| CSS | Personalización de estilos e identidad visual. |
| localStorage | Almacenamiento local de registros. |
| Jasmine | Creación de pruebas unitarias y verificaciones de comportamiento. |
| Karma | Ejecución automatizada de pruebas en navegador. |
| Webpack y Babel | Procesamiento del código y JSX en el entorno de testing. |
| Git y GitHub | Control de versiones y almacenamiento del código fuente. |

## 3. Funcionalidades principales

### Inicio

Presenta información general de Pan del Sur y permite consultar productos y realizar cotizaciones mediante el cálculo del valor total según la cantidad seleccionada.

### Órdenes de producción

Permite registrar, consultar, editar y eliminar órdenes de producción. Incluye validaciones de campos obligatorios, cantidades, categorías y otros datos relacionados con la fabricación.

### Control de calidad

Permite registrar inspecciones asociadas a los lotes, evaluar parámetros de calidad y consultar resultados conformes o no conformes. Incluye validaciones y gestión de observaciones.

### Productos e ingredientes

Permite administrar el catálogo de productos e ingredientes, consultar existencias, buscar registros e identificar situaciones de stock bajo.

### Lotes y trazabilidad

Permite buscar lotes y consultar antecedentes relacionados con la producción, los ingredientes y las inspecciones de calidad.

### Reportes

Permite consultar información de producción, calidad e inventario, aplicando filtros y períodos según el tipo de reporte seleccionado.

## 4. Estructura del proyecto

La aplicación está organizada de forma modular para separar la interfaz, las páginas funcionales, el manejo de datos y las pruebas.

```text
frontend/
├── public/
│   └── images/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Inicio.jsx
│   │   ├── OrdenesProduccion.jsx
│   │   ├── ControlCalidad.jsx
│   │   ├── ProductosIngredientes.jsx
│   │   ├── Trazabilidad.jsx
│   │   └── Reportes.jsx
│   ├── data/
│   │   ├── catalogo.js
│   │   ├── ordenes.js
│   │   ├── inspecciones.js
│   │   ├── lotes.js
│   │   ├── validacionOrdenes.js
│   │   └── validacionCalidad.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── tests/
│   ├── componentes.spec.jsx
│   └── pantallas.spec.jsx
├── karma.conf.cjs
├── package.json
├── vite.config.js
└── README.md
```

## 5. Instalación y ejecución

### Requisitos previos

Se requiere tener instalados:

- Node.js y npm.
- Visual Studio Code u otro editor de código.
- Un navegador web moderno.
- Google Chrome para ejecutar las pruebas con ChromeHeadless.

### Clonar el repositorio

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

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará una dirección local, normalmente:

```text
http://localhost:5173/
```

Abrir esa dirección en el navegador para utilizar la aplicación.

## 6. Navegación de la aplicación

La navegación se administra mediante React Router DOM.

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/ordenes` | Órdenes de producción |
| `/calidad` | Control de calidad |
| `/productos` | Productos e ingredientes |
| `/trazabilidad` | Lotes y trazabilidad |
| `/reportes` | Reportes |
| Otras rutas | Página no encontrada |

El componente `App.jsx` define las rutas y organiza los componentes comunes de la aplicación.

## 7. Arquitectura y componentes React

El frontend utiliza una arquitectura basada en componentes reutilizables.

**Componentes comunes:** `Header`, `Navbar` y `Footer` permiten mantener una estructura visual consistente en todas las páginas.

**Páginas:** representan los módulos funcionales del sistema y contienen los formularios, tablas, búsquedas y acciones disponibles.

**Props:** permiten transmitir información entre componentes. Por ejemplo, el componente `Header` recibe el nombre de la empresa mediante una propiedad.

**Estados:** mediante `useState`, los componentes administran información dinámica como valores de formularios, registros seleccionados, mensajes de validación y resultados de búsqueda.

**Módulos de datos:** centralizan operaciones de consulta, almacenamiento y validación, evitando concentrar toda la lógica dentro de los componentes visuales.

Esta estructura facilita el mantenimiento y la reutilización del código.

## 8. Gestión de datos y persistencia

Durante esta etapa, la aplicación utiliza módulos JavaScript y `localStorage` para simular el almacenamiento de información.

Las operaciones CRUD permiten:

- **Create:** registrar nuevos datos.
- **Read:** consultar información existente.
- **Update:** modificar registros.
- **Delete:** eliminar registros.

Los cambios persistidos pueden recuperarse al actualizar la página, siempre que se utilice el mismo navegador y no se eliminen los datos locales.

**Limitación:** el proyecto no utiliza actualmente una base de datos centralizada ni un backend para sincronizar información entre dispositivos.

## 9. Pruebas unitarias

El proyecto incorpora pruebas automatizadas utilizando Jasmine y Karma.

Las pruebas están distribuidas en dos archivos:

| Archivo | Pruebas escritas | Alcance |
|---|---:|---|
| `tests/componentes.spec.jsx` | 12 | Header, Navbar, órdenes de producción y control de calidad. |
| `tests/pantallas.spec.jsx` | 10 | Inicio, productos, ingredientes, trazabilidad y reportes. |
| **Total** | **22** | Verificaciones de lógica, validaciones, estados, DOM y persistencia. |

### Ejecutar las pruebas

```bash
npm test
```

Este comando ejecuta las pruebas mediante Karma y ChromeHeadless y genera el informe de cobertura configurado.

Para utilizar el modo de observación durante el desarrollo:

```bash
npm run test:watch
```

### Consultar la cobertura

Después de ejecutar las pruebas, revisar el resumen de cobertura en la terminal y abrir:

```text
coverage/html/index.html
```

Las métricas consideradas son:

- **Statements:** sentencias ejecutadas.
- **Branches:** ramas condicionales ejecutadas.
- **Functions:** funciones ejecutadas.
- **Lines:** líneas de código ejecutadas.

Los resultados reales de ejecución y porcentajes de cobertura se documentan por separado en el informe de cobertura de testing.

## 10. Validación y calidad del código

El proyecto incluye herramientas para verificar la calidad del código y generar una versión compilada.

### Revisar el código con ESLint

```bash
npm run lint
```

### Generar una versión de producción

```bash
npm run build
```

### Previsualizar la compilación

```bash
npm run preview
```

La compilación generada por Vite permite preparar el frontend para su despliegue en un servicio de alojamiento web.

## 11. Diseño responsivo

La interfaz utiliza Bootstrap y CSS personalizado para adaptarse a diferentes resoluciones.

El diseño mantiene una identidad visual basada en tonos café, cobre y beige, relacionados con la imagen de Pan del Sur.

Se busca conservar una navegación clara y una presentación consistente de formularios, tarjetas, tablas y botones en computadores, tablets y dispositivos móviles.

La compatibilidad visual debe comprobarse mediante pruebas manuales en diferentes resoluciones y navegadores.

## 12. Limitaciones actuales

El proyecto corresponde a una implementación frontend académica y presenta algunas limitaciones:

- No dispone de autenticación ni autorización centralizada por roles.
- No utiliza una base de datos remota.
- Los registros almacenados localmente no se sincronizan entre dispositivos.
- La cotización no constituye todavía un pedido formal persistente.
- Algunas funcionalidades de trazabilidad requieren validación adicional de sus antecedentes.
- Las pruebas automatizadas no sustituyen las verificaciones visuales, de accesibilidad o de funcionamiento completo.

Estas limitaciones podrán abordarse en futuras etapas mediante la incorporación de un backend y una base de datos centralizada.

## 13. Documentación del proyecto

El proyecto cuenta con documentación relacionada con el análisis, los requisitos y las pruebas:

- **Especificación de Requisitos de Software (ERS):** describe los requisitos funcionales y no funcionales, el alcance y las condiciones del sistema.
- **Documento de cobertura de testing:** presenta el entorno de pruebas, los casos implementados, los mocks y las métricas de cobertura.
- **Código fuente:** contiene la implementación del frontend React y los archivos de pruebas automatizadas.

## 14. Repositorio

**Repositorio principal:**

https://github.com/AlejandrinaFarias/EVA_1_FULLSTACK

**Rama de la Evaluación Parcial 2:**

`evaluacion-2-react`

**Carpeta del frontend:**

https://github.com/AlejandrinaFarias/EVA_1_FULLSTACK/tree/evaluacion-2-react/frontend

---

## 15. Contexto académico

**Institución:** Duoc UC

**Asignatura:** Desarrollo Fullstack II – DSY1104

**Evaluación:** Evaluación Parcial N.º 2

**Proyecto:** Pan del Sur – Sistema de Producción y Control de Calidad

**Objetivo académico:** aplicar React para desarrollar interfaces basadas en componentes, implementar navegación, formularios y gestión de estados, y verificar funcionalidades mediante pruebas unitarias con Jasmine y Karma.

---

**Pan del Sur — Proyecto académico de Desarrollo Fullstack II.**
