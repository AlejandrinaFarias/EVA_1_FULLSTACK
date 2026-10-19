function Header({ nombre }) {
  return (
    <header className="main-header py-4">
      <div className="container">
        <h1>{nombre}</h1>
        <p className="mt-2 mb-0">
          Sistema de producción y control de calidad
        </p>
      </div>
    </header>
  )
}

export default Header