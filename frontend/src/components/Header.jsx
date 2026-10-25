function Header({ nombre }) {
  return (
    <header className="main-header py-4">
      <div className="container d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3">
        <img
          src={`${import.meta.env.BASE_URL}images/logo_pan_sur.png`}
          alt="Logo de Pan del Sur"
          width="64"
          height="64"
          className="rounded-circle bg-white p-1"
          style={{ objectFit: 'contain' }}
        />

        <div>
          <h1>{nombre}</h1>
          <p className="mt-2 mb-0">
            Sistema de producción y control de calidad
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header