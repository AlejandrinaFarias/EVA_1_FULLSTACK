document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-producto");
    const tabla = document.getElementById("tabla-productos");
    const contador = document.getElementById("contador-productos");
    const mensaje = document.getElementById("mensaje-producto");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const codigo = document.getElementById("codigo").value.trim().toUpperCase();
        const nombre = document.getElementById("nombre").value.trim();
        const categoria = document.getElementById("categoria").value;
        const tiempo = document.getElementById("tiempo").value;
        const precio = document.getElementById("precio").value;
        const stock = document.getElementById("stock").value;

        if (!codigo || !nombre || !categoria || !tiempo || !precio || !stock) {
            mostrarMensaje("Todos los campos son obligatorios.", "var(--alerta-naranja)");
            return;
        }

        const codigosExistentes = Array.from(tabla.querySelectorAll("tr td:first-child"))
            .map(td => td.textContent.trim().toUpperCase());

        if (codigosExistentes.includes(codigo)) {
            mostrarMensaje(`El código ${codigo} ya existe. Usa otro.`, "var(--alerta-naranja)");
            return;
        }

        const precioFormateado = Number(precio).toLocaleString("es-CL");
        const stockFormateado = Number(stock).toLocaleString("es-CL");

        const nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${codigo}</td>
            <td>${nombre}</td>
            <td>${categoria}</td>
            <td>${tiempo}</td>
            <td>${precioFormateado}</td>
            <td>${stockFormateado}</td>
        `;
        tabla.appendChild(nuevaFila);

        contador.textContent = Number(contador.textContent) + 1;

        mostrarMensaje(
            `Producto <strong>${nombre}</strong> (${codigo}) agregado correctamente.`,
            "var(--verde-exito)"
        );

        form.reset();
    });

    function mostrarMensaje(texto, color) {
        mensaje.innerHTML = texto;
        mensaje.style.borderLeft = `5px solid ${color}`;
        mensaje.style.display = "block";

        clearTimeout(mensaje._timeout);
        mensaje._timeout = setTimeout(() => {
            mensaje.style.display = "none";
        }, 4000);
    }
});