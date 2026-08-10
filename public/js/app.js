document.addEventListener("DOMContentLoaded", () => {
  const nombreInput = document.querySelector("#nombreJugador");
  const letraInput = document.querySelector("#letraInput");
  const busquedaScore = document.querySelector("#busquedaScore");
  const ordenarScore = document.querySelector("#ordenarScore");
  const direccionScore = document.querySelector("#direccionScore");
  const btnIniciar = document.querySelector("#btnIniciar");
  const btnProbar = document.querySelector("#btnProbar");
  const btnGuardar = document.querySelector("#btnGuardar");
  const btnActualizar = document.querySelector("#btnActualizar");
  const btnPdf = document.querySelector("#btnPdf");
  const btnExcel = document.querySelector("#btnExcel");
  const btnTema = document.querySelector("#btnTema");
  const btnPista = document.querySelector("#btnPista");
  const pistaTexto = document.querySelector("#pista");
  const pistaBox = document.querySelector("#pistaBox");

  let juego = null;
  let palabraActual = "";
  let reloj = null;
  let scoreGuardado = false;
  let temporizadorBusqueda = null;

  UI.iniciar();
  UI.mostrarFechaActual();
  UI.renderizarJuego(null);
  aplicarTemaGuardado();
  reiniciarPista(false);
  listarScores();

  btnIniciar.addEventListener("click", iniciarJuego);
  btnProbar.addEventListener("click", probarLetra);
  btnGuardar.addEventListener("click", guardarScore);
  btnActualizar.addEventListener("click", listarScores);
  btnPdf.addEventListener("click", descargarPdf);
  btnExcel.addEventListener("click", descargarExcel);
  btnTema.addEventListener("click", alternarTema);
  btnPista.addEventListener("click", pedirPista);
  pistaBox.addEventListener("dblclick", UI.alternarPista);
  ordenarScore.addEventListener("change", listarScores);
  direccionScore.addEventListener("change", listarScores);

  busquedaScore.addEventListener("input", () => {
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(listarScores, 250);
  });

  letraInput.addEventListener("keyup", (evento) => {
    if (evento.key === "Enter") {
      probarLetra();
    }
  });

  // Hace pedidos POST a la API.
  async function apiPost(ruta, datos = {}) {
    const respuesta = await fetch(ruta, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json().catch(() => ({ mensaje: "Error del servidor." }));
      throw new Error(error.mensaje || "Error del servidor.");
    }

    return respuesta.json();
  }

  // Devuelve los filtros actuales de la tabla.
  function obtenerFiltrosScores() {
    return {
      busqueda: busquedaScore.value.trim(),
      ordenarPor: ordenarScore.value,
      direccion: direccionScore.value
    };
  }

  // Reinicia el bloque visual de pista.
  function reiniciarPista(habilitada) {
    pistaTexto.textContent = "Necesitas una ayuda?";
    btnPista.textContent = "Mostrar pista";
    btnPista.disabled = !habilitada;
    pistaBox.classList.remove("is-hidden");
  }

  // Inicia una partida nueva.
  async function iniciarJuego() {
    const nombre = nombreInput.value.trim();

    if (!nombre) {
      UI.mostrarMensaje("Escribe tu nombre antes de jugar.", "error");
      nombreInput.focus();
      return;
    }

    try {
      const datos = await apiPost("/api/palabra");

      if (!datos.ok) {
        throw new Error(datos.mensaje || "No se pudo obtener una palabra en este momento.");
      }

      palabraActual = datos.palabra;
      juego = new Ahorcado(datos.palabra, nombre);
      scoreGuardado = false;

      letraInput.disabled = false;
      btnProbar.disabled = false;
      btnGuardar.disabled = true;
      letraInput.value = "";
      letraInput.focus();
      reiniciarPista(true);

      detenerReloj();
      reloj = setInterval(() => UI.renderizarJuego(juego), 1000);

      UI.renderizarJuego(juego);
      UI.mostrarMensaje("Partida iniciada. Buena suerte.", "success");
    } catch (error) {
      UI.mostrarMensaje(error.message, "error");
    }
  }

  // Solicita una pista al backend.
  async function pedirPista() {
    if (!juego || juego.finalizado || juego.pistaUsada) {
      return;
    }

    try {
      btnPista.disabled = true;
      btnPista.textContent = "Buscando pista...";
      const respuesta = await apiPost("/api/palabra/pista", { palabra: palabraActual || juego.palabra });

      if (!respuesta.ok || !respuesta.pista) {
        juego.pistaUsada = true;
        pistaTexto.textContent = respuesta.mensaje || "No hay una pista disponible para esta palabra.";
        btnPista.textContent = "Sin pista";
        UI.mostrarMensaje(pistaTexto.textContent, "info");
        return;
      }

      juego.pistaUsada = true;
      pistaTexto.textContent = respuesta.pista;
      btnPista.textContent = "Pista mostrada";
      UI.mostrarMensaje("Pista cargada correctamente.", "success");
    } catch (error) {
      btnPista.disabled = false;
      btnPista.textContent = "Mostrar pista";
      UI.mostrarMensaje(error.message, "error");
    }
  }

  // Prueba la letra escrita por el jugador.
  function probarLetra() {
    if (!juego) {
      UI.mostrarMensaje("Inicia una partida primero.", "error");
      return;
    }

    const resultado = juego.probarLetra(letraInput.value);
    letraInput.value = "";
    letraInput.focus();
    UI.renderizarJuego(juego);

    if (!resultado.ok) {
      UI.mostrarMensaje(resultado.mensaje, "error");
      return;
    }

    if (juego.finalizado) {
      finalizarJuego();
      return;
    }

    UI.mostrarMensaje(resultado.correcta ? "Letra correcta." : "Letra incorrecta.", resultado.correcta ? "success" : "info");
  }

  // Finaliza la partida y habilita guardar.
  function finalizarJuego() {
    detenerReloj();
    letraInput.disabled = true;
    btnProbar.disabled = true;
    btnPista.disabled = true;
    btnGuardar.disabled = false;

    if (juego.gano) {
      UI.mostrarMensaje("Ganaste la partida. Ya puedes guardar tu score.", "success");
    } else {
      UI.mostrarMensaje(`Perdiste. La palabra era ${juego.palabra.toUpperCase()}.`, "error");
    }
  }

  // Guarda el score en MySQL.
  async function guardarScore() {
    if (!juego || !juego.finalizado) {
      UI.mostrarMensaje("Termina una partida antes de guardar.", "error");
      return;
    }

    if (scoreGuardado) {
      UI.mostrarMensaje("Este score ya fue guardado.", "info");
      return;
    }

    try {
      const score = juego.obtenerScore(UI.formatearFecha());
      const respuesta = await apiPost("/api/score/guardar", score);
      scoreGuardado = true;
      btnGuardar.disabled = true;
      UI.mostrarMensaje(respuesta.mensaje, "success");
      listarScores();
    } catch (error) {
      UI.mostrarMensaje(error.message, "error");
    }
  }

  // Lista los scores desde MySQL con filtros.
  async function listarScores() {
    try {
      const respuesta = await apiPost("/api/score/listar", obtenerFiltrosScores());
      UI.renderizarScores(respuesta.scores || []);
    } catch (error) {
      UI.renderizarScores([]);
      UI.mostrarMensaje("No se pudo cargar la tabla. Revisa XAMPP y la base Score.", "error");
    }
  }

  // Descarga un archivo generado por el backend.
  async function descargarArchivo(ruta, nombreArchivo, mensajeOk) {
    try {
      const respuesta = await fetch(ruta, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obtenerFiltrosScores())
      });

      if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => ({ mensaje: "No se pudo descargar el archivo." }));
        throw new Error(error.mensaje || "No se pudo descargar el archivo.");
      }

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo;
      enlace.click();
      URL.revokeObjectURL(url);
      UI.mostrarMensaje(mensajeOk, "success");
    } catch (error) {
      UI.mostrarMensaje(error.message, "error");
    }
  }

  // Descarga el PDF de la tabla filtrada.
  function descargarPdf() {
    descargarArchivo("/api/score/pdf", "score-ahorcado.pdf", "PDF descargado correctamente.");
  }

  // Descarga el Excel de la tabla filtrada.
  function descargarExcel() {
    descargarArchivo("/api/score/excel", "score-ahorcado.xlsx", "Excel descargado correctamente.");
  }

  // Detiene el reloj de la partida.
  function detenerReloj() {
    if (reloj) {
      clearInterval(reloj);
      reloj = null;
    }
  }

  // Activa o desactiva el modo noche.
  function alternarTema() {
    document.body.classList.toggle("dark-mode");
    const activo = document.body.classList.contains("dark-mode");
    localStorage.setItem("temaAhorcado", activo ? "noche" : "dia");
    btnTema.textContent = activo ? "Noche" : "Dia";
    UI.dibujarAhorcado(juego ? juego.letrasIncorrectas.length : 0);
  }

  // Aplica el tema guardado.
  function aplicarTemaGuardado() {
    const tema = localStorage.getItem("temaAhorcado");

    if (tema === "noche") {
      document.body.classList.add("dark-mode");
      btnTema.textContent = "Noche";
    } else {
      btnTema.textContent = "Dia";
    }
  }
});