document.addEventListener('DOMContentLoaded', () => {
    initCotizador();
    initNavigation();
});

/**
 * Calcula el precio total estimado según la cantidad ingresada.
 * @param {string} id 
 * @param {number} precio 
 */

function calcularTotal(id, precio) {
            const cantidad = document.getElementById('cant-' + id).value;
            const total = cantidad * precio;
            document.getElementById('total-' + id).innerText = '$' + total.toLocaleString('es-CL') + ' CLP';
        }


function initCotizador() {
    const botonesPedir = document.querySelectorAll('.summary-card .btn-primary');

    botonesPedir.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            const tarjeta = e.target.closest('.summary-card');
            const nombreProducto = tarjeta.querySelector('h3')?.innerText || 'Producto';
            const cantidadInput = tarjeta.querySelector('input[type="number"]');
            const cantidad = cantidadInput ? cantidadInput.value : 1;
            const totalTexto = tarjeta.querySelector('.result-box h3')?.innerText || '$0 CLP';

            alert(`¡Orden agregada!\n\nProducto: ${nombreProducto}\nCantidad: ${cantidad}\nTotal estimado: ${totalTexto}`);
        });
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}