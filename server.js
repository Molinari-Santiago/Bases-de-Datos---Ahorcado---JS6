const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./src/routes/apiRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRoutes);

// Maneja errores generales del servidor.
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        ok: false,
        mensaje: "Ocurrió un error interno en el servidor."
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});