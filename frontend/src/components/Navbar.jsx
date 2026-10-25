import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="main-nav" aria-label="Navegación principal">
      <div className="container">
        <ul className="nav flex-column flex-md-row">
          <li className="nav-item">
            <NavLink to="/" end className="nav-link">
              Inicio
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/productos" className="nav-link">
              Productos e ingredientes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/ordenes" className="nav-link">
              Órdenes de producción
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/calidad" className="nav-link">
              Control de calidad
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/trazabilidad" className="nav-link">
              Trazabilidad
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/reportes" className="nav-link">
              Reportes
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar