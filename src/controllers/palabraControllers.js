const palabras = [
  { palabra: "javascript", pista: "Lenguaje usado en el navegador." },
  { palabra: "express", pista: "Framework de servidor para Node.js." },
  { palabra: "mysql", pista: "Motor de base de datos usado con XAMPP." },
  { palabra: "variable", pista: "Espacio donde se guarda un dato." },
  { palabra: "funcion", pista: "Bloque reutilizable de codigo." },
  { palabra: "controlador", pista: "Parte que recibe y responde pedidos." },
  { palabra: "servidor", pista: "Programa que atiende peticiones." },
  { palabra: "frontend", pista: "Parte visual que usa el jugador." },
  { palabra: "backend", pista: "Parte que procesa datos del servidor." },
  { palabra: "ahorcado", pista: "Juego de adivinar letras." },
  { palabra: "responsive", pista: "Diseno que se adapta a pantallas." }
];

// Devuelve una palabra aleatoria para una partida.
function pedirPalabra(req, res) {
  const indice = Math.floor(Math.random() * palabras.length);
  const seleccion = palabras[indice];

  res.json({
    ok: true,
    palabra: seleccion.palabra,
    pista: seleccion.pista
  });
}

module.exports = {
  pedirPalabra
};
