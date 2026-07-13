const UI = (() => {
  const elementos = {};

  // Guarda referencias a elementos del DOM.
  function iniciar() {
    elementos.fechaActual = document.querySelector("#fechaActual");
    elementos.mensaje = document.querySelector("#mensaje");
    elementos.estadoPartida = document.querySelector("#estadoPartida");
    elementos.intentos = document.querySelector("#intentos");
    elementos.puntos = document.querySelector("#puntos");
    elementos.tiempo = document.querySelector("#tiempo");
    elementos.fallos = document.querySelector("#fallos");
    elementos.palabraOculta = document.querySelector("#palabraOculta");
    elementos.pista = document.querySelector("#pista");
    elementos.pistaBox = document.querySelector("#pistaBox");
    elementos.letrasIncorrectas = document.querySelector("#letrasIncorrectas");
    elementos.tablaScores = document.querySelector("#tablaScores");
    elementos.canvas = document.querySelector("#canvasAhorcado");
  }

  // Formatea una fecha en dia/mes/anio.
  function formatearFecha(fecha = new Date()) {
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Muestra un mensaje estetico en pantalla.
  function mostrarMensaje(texto, tipo = "info") {
    elementos.mensaje.textContent = texto;
    elementos.mensaje.className = `message-box is-${tipo}`;
  }

  // Actualiza la fecha visible.
  function mostrarFechaActual() {
    elementos.fechaActual.textContent = formatearFecha();
  }

  // Prepara el trazo del canvas.
  function prepararTrazo(ctx, color, ancho = 8) {
    ctx.lineWidth = ancho;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
  }

  // Dibuja el ahorcado segun los fallos.
  function dibujarAhorcado(fallos = 0) {
    const canvas = elementos.canvas;
    const ctx = canvas.getContext("2d");
    const estilos = getComputedStyle(document.body);
    const colorTexto = estilos.getPropertyValue("--text").trim();
    const colorPrimario = estilos.getPropertyValue("--primary").trim();
    const colorLinea = estilos.getPropertyValue("--line").trim();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "rgba(20, 32, 51, 0.16)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    prepararTrazo(ctx, colorLinea, 5);
    ctx.beginPath();
    ctx.moveTo(75, 285);
    ctx.lineTo(445, 285);
    ctx.stroke();

    prepararTrazo(ctx, colorTexto, 8);
    ctx.beginPath();
    ctx.moveTo(150, 285);
    ctx.lineTo(150, 45);
    ctx.lineTo(310, 45);
    ctx.lineTo(310, 78);
    ctx.stroke();

    prepararTrazo(ctx, colorPrimario, 8);

    if (fallos >= 1) {
      ctx.beginPath();
      ctx.arc(310, 105, 28, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (fallos >= 2) {
      ctx.beginPath();
      ctx.moveTo(310, 135);
      ctx.lineTo(310, 205);
      ctx.stroke();
    }

    if (fallos >= 3) {
      ctx.beginPath();
      ctx.moveTo(310, 155);
      ctx.lineTo(265, 180);
      ctx.stroke();
    }

    if (fallos >= 4) {
      ctx.beginPath();
      ctx.moveTo(310, 155);
      ctx.lineTo(355, 180);
      ctx.stroke();
    }

    if (fallos >= 5) {
      ctx.beginPath();
      ctx.moveTo(310, 205);
      ctx.lineTo(270, 250);
      ctx.stroke();
    }

    if (fallos >= 6) {
      ctx.beginPath();
      ctx.moveTo(310, 205);
      ctx.lineTo(350, 250);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  // Renderiza la informacion de una partida.
  function renderizarJuego(juego) {
    if (!juego) {
      elementos.intentos.textContent = "6";
      elementos.puntos.textContent = "0";
      elementos.tiempo.textContent = "0s";
      elementos.fallos.textContent = "0";
      elementos.palabraOculta.textContent = "_ _ _ _ _ _ _";
      elementos.pista.textContent = "Sin pista";
      elementos.letrasIncorrectas.textContent = "Ninguna";
      elementos.estadoPartida.textContent = "Esperando jugador";
      dibujarAhorcado(0);
      return;
    }

    elementos.intentos.textContent = juego.obtenerIntentosRestantes();
    elementos.puntos.textContent = juego.calcularPuntos();
    elementos.tiempo.textContent = `${juego.obtenerTiempo()}s`;
    elementos.fallos.textContent = juego.letrasIncorrectas.length;
    elementos.palabraOculta.textContent = juego.obtenerPalabraOculta();
    elementos.pista.textContent = juego.pista;
    elementos.letrasIncorrectas.textContent = juego.letrasIncorrectas.length
      ? juego.letrasIncorrectas.map((letra) => letra.toUpperCase()).join(", ")
      : "Ninguna";
    elementos.estadoPartida.textContent = juego.finalizado
      ? juego.gano
        ? "Victoria"
        : "Derrota"
      : "En juego";
    dibujarAhorcado(juego.letrasIncorrectas.length);
  }

  // Alterna la pista con doble click.
  function alternarPista() {
    elementos.pistaBox.classList.toggle("is-hidden");
  }

  // Renderiza la tabla de posiciones.
  function renderizarScores(scores) {
    if (!scores.length) {
      elementos.tablaScores.innerHTML = '<tr><td class="empty-table" colspan="5">Todavia no hay scores.</td></tr>';
      return;
    }

    elementos.tablaScores.innerHTML = scores
      .map(
        (score, indice) => `
          <tr>
            <td>${indice + 1}</td>
            <td>${escaparHTML(score.nombre)}</td>
            <td>${score.puntos}</td>
            <td>${score.tiempo}s</td>
            <td>${score.fecha}</td>
          </tr>
        `
      )
      .join("");
  }

  // Escapa texto antes de insertarlo como HTML.
  function escaparHTML(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    iniciar,
    formatearFecha,
    mostrarMensaje,
    mostrarFechaActual,
    renderizarJuego,
    renderizarScores,
    alternarPista,
    dibujarAhorcado
  };
})();

window.UI = UI;