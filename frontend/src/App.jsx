import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Inicio from './pages/Inicio.jsx'
import OrdenesProduccion from './pages/OrdenesProduccion.jsx'
import ControlCalidad from './pages/ControlCalidad.jsx'
import ProductosIngredientes from './pages/ProductosIngredientes.jsx'
import Trazabilidad from './pages/Trazabilidad.jsx'
import Reportes from './pages/Reportes.jsx'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header nombre="Pan del Sur" />
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route
            path="/productos"
            element={<ProductosIngredientes />}
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
            element={<Trazabilidad />}
          />
          <Route path="/reportes" element={<Reportes />} />
          <Route
            path="*"
            element={<h2>Página no encontrada</h2>}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App