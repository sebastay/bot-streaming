const Database = require('better-sqlite3');
const db = new Database('inventario.db');

// 1. Asegurar que las tablas existan (Igual que en index.js)
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

// 2. Insertar cuenta de prueba
const nuevaCuenta = {
    servicio: 'Netflix',
    email: 'test-elite@mail.com',
    password: 'password123',
    perfiles: 4
};

const stmtMadre = db.prepare('INSERT INTO cuentas_madre (servicio, email, password) VALUES (?, ?, ?)');
const info = stmtMadre.run(nuevaCuenta.servicio, nuevaCuenta.email, nuevaCuenta.password);

const stmtPerfil = db.prepare('INSERT INTO perfiles (cuenta_id, numero_perfil, pin) VALUES (?, ?, ?)');
for (let i = 1; i <= nuevaCuenta.perfiles; i++) {
    stmtPerfil.run(info.lastInsertRowid, i, `111${i}`);
}

console.log(`✅ Tablas creadas e inventario de ${nuevaCuenta.servicio} cargado.`);



