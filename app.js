document.getElementById("ventaForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precio = parseFloat(document.getElementById("precio").value);

  if (producto && cantidad && precio) {
    agregarVenta({
      producto,
      cantidad,
      precio,
      total: cantidad * precio,
      fecha: new Date().toISOString() // Guardamos la fecha correctamente
    });

    e.target.reset();
  }
});

function mostrarVentas() {
  obtenerVentas((ventas) => {
    const lista = document.getElementById("listaVentas");
    lista.innerHTML = "";

    ventas.forEach(v => {
      // Evitar errores con ventas sin fecha válida
      if (!v.fecha) return;

      const fechaVenta = new Date(v.fecha);
      const li = document.createElement("li");
      li.textContent = `${formatearFecha(fechaVenta)} - ${v.producto} x${v.cantidad} ($${v.precio} c/u) = $${v.total.toFixed(2)}`;
      lista.appendChild(li);
    });
  });
}

function calcularTotales() {
  obtenerVentas((ventas) => {
    const hoy = new Date();
    const inicioSemana = new Date();
    inicioSemana.setDate(hoy.getDate() - 6); // últimos 7 días

    let totalGeneral = 0;
    let totalDiario = 0;
    let totalSemanal = 0;

    ventas.forEach(v => {
      if (!v.fecha) return;

      const fechaVenta = new Date(v.fecha);
      const totalVenta = v.total;

      totalGeneral += totalVenta;

      if (esMismaFecha(fechaVenta, hoy)) {
        totalDiario += totalVenta;
      }

      if (fechaVenta >= inicioSemana && fechaVenta <= hoy) {
        totalSemanal += totalVenta;
      }
    });

    document.getElementById("totalGeneral").textContent = totalGeneral.toFixed(2);
    document.getElementById("totalDiario").textContent = totalDiario.toFixed(2);
    document.getElementById("totalSemanal").textContent = totalSemanal.toFixed(2);
  });
}

function esMismaFecha(f1, f2) {
  return f1.getFullYear() === f2.getFullYear() &&
        f1.getMonth() === f2.getMonth() &&
        f1.getDate() === f2.getDate();
}

function formatearFecha(fecha) {
  if (isNaN(fecha.getTime())) return "Fecha inválida";

  return `${fecha.getDate().toString().padStart(2, '0')}/${
          (fecha.getMonth() + 1).toString().padStart(2, '0')}/${
          fecha.getFullYear()} ${
          fecha.getHours().toString().padStart(2, '0')}:${
          fecha.getMinutes().toString().padStart(2, '0')}`;
}
document.getElementById("borrarVentas").addEventListener("click", () => {
  if (confirm("¿Estás seguro que deseas borrar TODAS las ventas? Esta acción no se puede deshacer.")) {
    const tx = db.transaction("ventas", "readwrite");
    const store = tx.objectStore("ventas");
    const request = store.clear();

    request.onsuccess = () => {
      alert("Ventas borradas exitosamente.");
      mostrarVentas();
      calcularTotales();
    };

    request.onerror = () => {
      alert("Ocurrió un error al borrar las ventas.");
    };
  }
});



