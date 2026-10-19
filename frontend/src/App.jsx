import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Navbar from './components/Navbar.jsx'
import OrdenesProduccion from './pages/OrdenesProduccion.jsx'
import ControlCalidad from './pages/ControlCalidad.jsx'

function App() {
  return (
    <>
      <Header nombre="Pan del Sur" />
      <Navbar />

      <main className="container py-4">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h2>Inicio</h2>
                <p>Bienvenido al sistema de Pan del Sur.</p>
              </>
            }
          />
          <Route
            path="/productos"
            element={<h2>Productos e ingredientes</h2>}
          />
          <Route
            path="/ordenes"
            element={<OrdenesProduccion />}
          />
          <Route
            path="/calidad"
            element={<ControlCalidad />}
          />
          <Route
            path="/trazabilidad"
            element={<h2>Trazabilidad</h2>}
          />
          <Route
            path="/reportes"
            element={<h2>Reportes</h2>}
          />
          <Route
            path="*"
            element={<h2>Página no encontrada</h2>}
          />
        </Routes>
      </main>
    </>
  )
}

export default App