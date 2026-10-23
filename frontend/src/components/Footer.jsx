function Footer() {
  return (
    <footer
      className="text-center p-3 mt-auto"
      style={{
        backgroundColor: 'var(--corteza-cobre)',
        color: 'var(--alerta-nuez)',
      }}
    >
      <p className="mb-0">
        © {new Date().getFullYear()} Pan del Sur · Calidad y tradición
      </p>
    </footer>
  )
}

export default Footer