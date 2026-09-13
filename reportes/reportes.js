document.addEventListener("DOMContentLoaded", () => {
    const btnGenerar = document.getElementById("btn-generar");
    const mensaje = document.getElementById("mensaje-reporte");

    const fechaInicio = document.getElementById("fecha-inicio");
    const fechaFin = document.getElementById("fecha-fin");
    const tipoReporte = document.getElementById("tipo-reporte");

    const hoy = new Date().toISOString().split("T")[0];
    if (fechaFin) fechaFin.value = hoy;

    btnGenerar.addEventListener("click", () => {
        const inicio = fechaInicio.value;
        const fin = fechaFin.value;

        if (!inicio || !fin) {
            mostrarMensaje("Debes seleccionar ambas fechas.", "var(--alerta-naranja)");
            return;
        }

        if (inicio > fin) {
            mostrarMensaje("La fecha de inicio no puede ser mayor que la fecha de término.", "var(--alerta-naranja)");
            return;
        }

        const tipoTexto = tipoReporte.options[tipoReporte.selectedIndex].text;
        const dias = calcularDias(inicio, fin);

        mostrarMensaje(
            `Reporte generado correctamente.<br>
             <strong>Tipo:</strong> ${tipoTexto}<br>
             <strong>Período:</strong> ${inicio} al ${fin} (${dias} día${dias !== 1 ? "s" : ""})<br>
             <em>El archivo se descargará automáticamente.</em>`,
            "var(--verde-exito)"
        );
    });

    function calcularDias(inicio, fin) {
        const d1 = new Date(inicio);
        const d2 = new Date(fin);
        const diff = Math.abs(d2 - d1);
        return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    function mostrarMensaje(texto, color) {
        mensaje.innerHTML = texto;
        mensaje.style.borderLeft = `5px solid ${color}`;
        mensaje.style.display = "block";
    }
});
