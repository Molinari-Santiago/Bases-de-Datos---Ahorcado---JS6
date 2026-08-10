class Ahorcado {
  // Crea una partida nueva.
  constructor(palabra, nombre) {
    this.palabras = [this.normalizarTexto(palabra)];
    this.palabra = this.palabras[0];
    this.nombre = nombre;
    this.letrasCorrectas = [];
    this.letrasIncorrectas = [];
    this.intentosMaximos = 6;
    this.inicio = Date.now();
    this.finalizado = false;
    this.gano = false;
    this.puntos = 0;
    this.pistaUsada = false;
  }

  // Limpia el texto para comparar letras.
  normalizarTexto(texto) {
    return String(texto)
      .toLowerCase()
      .replace(/\u00f1/g, "__enie__")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/__enie__/g, "\u00f1")
      .replace(/[^a-z\u00f1]/g, "");
  }

  // Prueba una letra en la palabra actual.
  probarLetra(letra) {
    if (this.finalizado) {
      return { ok: false, mensaje: "La partida ya termino." };
    }

    const letraLimpia = this.normalizarTexto(letra).charAt(0);

    if (!letraLimpia) {
      return { ok: false, mensaje: "Ingresa una letra valida." };
    }

    if (this.letrasCorrectas.includes(letraLimpia) || this.letrasIncorrectas.includes(letraLimpia)) {
      return { ok: false, mensaje: "Esa letra ya fue usada." };
    }

    if (this.palabra.includes(letraLimpia)) {
      this.letrasCorrectas.push(letraLimpia);
    } else {
      this.letrasIncorrectas.push(letraLimpia);
    }

    this.revisarEstado();
    this.calcularPuntos();

    return {
      ok: true,
      correcta: this.palabra.includes(letraLimpia),
      finalizado: this.finalizado,
      gano: this.gano
    };
  }

  // Revisa si el jugador gano o perdio.
  revisarEstado() {
    const letrasUnicas = [...new Set(this.palabra.split(""))];
    const completo = letrasUnicas.every((letra) => this.letrasCorrectas.includes(letra));

    if (completo) {
      this.finalizado = true;
      this.gano = true;
    }

    if (this.letrasIncorrectas.length >= this.intentosMaximos) {
      this.finalizado = true;
      this.gano = false;
    }
  }

  // Calcula los puntos de la partida.
  calcularPuntos() {
    const aciertos = this.letrasCorrectas.length * 25;
    const castigo = this.letrasIncorrectas.length * 12;
    const bonusVictoria = this.gano ? Math.max(30, 150 - this.obtenerTiempo()) : 0;
    this.puntos = Math.max(0, aciertos - castigo + bonusVictoria);
    return this.puntos;
  }

  // Devuelve la palabra con guiones bajos.
  obtenerPalabraOculta() {
    return this.palabra
      .split("")
      .map((letra) => (this.letrasCorrectas.includes(letra) ? letra.toUpperCase() : "_"))
      .join(" ");
  }

  // Devuelve el tiempo en segundos.
  obtenerTiempo() {
    return Math.floor((Date.now() - this.inicio) / 1000);
  }

  // Devuelve los intentos restantes.
  obtenerIntentosRestantes() {
    return Math.max(0, this.intentosMaximos - this.letrasIncorrectas.length);
  }

  // Devuelve datos listos para guardar.
  obtenerScore(fecha) {
    this.calcularPuntos();

    return {
      nombre: this.nombre,
      tiempo: this.obtenerTiempo(),
      puntos: this.puntos,
      fecha
    };
  }
}

window.Ahorcado = Ahorcado;