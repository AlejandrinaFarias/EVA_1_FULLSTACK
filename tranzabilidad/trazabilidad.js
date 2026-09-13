document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTrazabilidad();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initTrazabilidad() {
    const btnBuscar = document.querySelector('.btn-primary');
    const inputBuscar = document.getElementById('buscar-lote');
    
    const lotesBaseDatos = {
        "LOT-20261012-001": {
            producto: "PR001 - Pan Amasado (2.500 un.)",
            estado: "CONFORME",
            statusClass: "status-ok",
            fecha: "12/10 - 06:30 hrs (Línea 2)"
        },
        "LOT-20261012-002": {
            producto: "PR003 - Marraqueta (3.000 un.)",
            estado: "NO CONFORME",
            statusClass: "status-review",
            fecha: "12/10 - 08:00 hrs (Línea 1)"
        }
    };

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener('click', () => {
            ejecutarBusqueda(inputBuscar.value.trim().toUpperCase());
        });

        inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                ejecutarBusqueda(inputBuscar.value.trim().toUpperCase());
            }
        });
    }

    function ejecutarBusqueda(codigo) {
        if (!codigo) {
            alert('Por favor, ingresa o escanea un código de lote o insumo.');
            return;
        }

        if (lotesBaseDatos[codigo]) {
            const data = lotesBaseDatos[codigo];
            
            const tituloFicha = document.querySelector('.dashboard-summary h2');
            if (tituloFicha) tituloFicha.textContent = `Ficha del Lote: ${codigo}`;

            const badgeEstado = document.querySelector('.summary-card .badge');
            if (badgeEstado) {
                badgeEstado.textContent = data.estado;
                badgeEstado.className = `badge ${data.statusClass}`;
            }

            alert(`Lote ${codigo} encontrado correctamente.`);
        } else {
            alert(`El código de lote o insumo "${codigo}" no existe en la base de datos de prueba.\n\nPrueba con: LOT-20261012-001 o LOT-20261012-002`);
        }
    }
}