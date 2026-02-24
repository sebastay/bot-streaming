const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();

app.use(express.json());

// Conexión a la base de datos (se crea el archivo si no existe)
const db = new Database('inventario.db');

// Crear las tablas necesarias
db.exec(`
  CREATE TABLE IF NOT EXISTS cuentas_madre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    servicio TEXT,
    email TEXT,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS perfiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_id INTEGER,
    numero_perfil INTEGER,
    pin TEXT,
    ocupado INTEGER DEFAULT 0,
    FOREIGN KEY(cuenta_id) REFERENCES cuentas_madre(id)
  );
`);

// RUTA PARA VENDER: Devuelve un perfil libre y lo marca como ocupado
app.get('/vender', (req, res) => {
    const { servicio, clave_maestra } = req.query;

    // Seguridad simple: Solo tú puedes disparar la venta
    if (clave_maestra !== "ELITE2026") return res.status(401).send("No autorizado");

    const perfil = db.prepare(`
        SELECT p.id, c.email, c.password, p.numero_perfil, p.pin 
        FROM perfiles p 
        JOIN cuentas_madre c ON p.cuenta_id = c.id 
        WHERE c.servicio = ? AND p.ocupado = 0 
        LIMIT 1
    `).get(servicio);

    if (!perfil) return res.status(404).send(`No hay stock de ${servicio}`);

    db.prepare('UPDATE perfiles SET ocupado = 1 WHERE id = ?').run(perfil.id);

    res.send(`
        📦 PRODUCTO: ${servicio} \n
        📧 CORREO: ${perfil.email} \n
        🔑 CLAVE: ${perfil.password} \n
        👤 PERFIL: ${perfil.numero_perfil} \n
        🔢 PIN: ${perfil.pin}
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Elite activo en puerto ${PORT}`));