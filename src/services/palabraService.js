const API_PALABRA = "https://random-words-api.vercel.app/word/spanish";
const API_DICCIONARIO = "https://freedictionaryapi.com/api/v1/entries/es";
const MAX_INTENTOS = 8;

// Normaliza una palabra para usarla en el juego.
function normalizarPalabra(palabra) {
  return String(palabra || "").trim().toLowerCase();
}

// Valida que una palabra sea util para jugar.
function esPalabraValida(palabra) {
  const limpia = normalizarPalabra(palabra);
  const soloLetrasEspanol = /^[a-zA-Z\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00fc\u00dc\u00f1\u00d1]+$/u;

  return (
    limpia.length >= 5 &&
    limpia.length <= 12 &&
    !limpia.includes(" ") &&
    !limpia.includes("-") &&
    soloLetrasEspanol.test(limpia)
  );
}

// Extrae una palabra desde respuestas posibles de la API.
function extraerPalabra(data) {
  if (Array.isArray(data)) {
    return extraerPalabra(data[0]);
  }

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    return data.word || data.palabra || data.value || "";
  }

  return "";
}

// Obtiene una palabra valida desde la API externa.
async function obtenerPalabraAleatoria() {
  for (let intento = 0; intento < MAX_INTENTOS; intento += 1) {
    try {
      const respuesta = await fetch(API_PALABRA);

      if (!respuesta.ok) {
        continue;
      }

      const data = await respuesta.json();
      const palabra = normalizarPalabra(extraerPalabra(data));

      if (esPalabraValida(palabra)) {
        return palabra;
      }
    } catch (error) {
      console.log("Error al obtener palabra:", error.message);
    }
  }

  return null;
}

// Busca una definicion dentro de una respuesta compleja.
function buscarDefinicion(data) {
  if (!data) {
    return "";
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const encontrada = buscarDefinicion(item);

      if (encontrada) {
        return encontrada;
      }
    }
  }

  if (typeof data === "object") {
    const posibles = [data.definition, data.definicion, data.description, data.meaning];

    for (const posible of posibles) {
      if (typeof posible === "string" && posible.trim().length > 12) {
        return posible.trim();
      }
    }

    for (const valor of Object.values(data)) {
      const encontrada = buscarDefinicion(valor);

      if (encontrada) {
        return encontrada;
      }
    }
  }

  return "";
}

// Obtiene una pista desde el diccionario externo.
async function obtenerPista(palabra) {
  const limpia = normalizarPalabra(palabra);

  if (!esPalabraValida(limpia)) {
    return "";
  }

  try {
    const url = `${API_DICCIONARIO}/${encodeURIComponent(limpia)}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      return "";
    }

    const data = await respuesta.json();
    return buscarDefinicion(data);
  } catch (error) {
    console.log("Error al obtener pista:", error.message);
    return "";
  }
}

module.exports = {
  obtenerPalabraAleatoria,
  obtenerPista,
  esPalabraValida
};
