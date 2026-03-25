const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2/promise');
var cors = require('cors')
const session = require('express-session')

app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173'
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 60000 } // 1 minuto de duración
  
  
}))

// ✅ Pool de conexiones (mejor que "connection" suelto)
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'login',
});

//__________________________________________________________________
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', async (req, res) => {
  const datos = req.body;
  console.log('POST /login payload:', datos);

  try {
    const [results] = await connection.query(
      "SELECT * FROM `usuarios` WHERE `usuario` = ? AND `clave` = ?",
      [datos.usuario, datos.clave]
    );

    if (results.length > 0) {
      req.session.usuario = datos.usuario; // Guardar el usuario en la sesión
      return res.status(200).send({ ok: true, message: 'Inicio de sesión correcto' });
    } else {
      return res.status(401).send({ ok: false, message: 'Usuario o clave incorrectos' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ ok: false, message: 'Error del servidor' });
  }
});

app.get('/validate', (req, res) => {
  if (req.session.usuario) { 
    return res.status(200).send("sesion valida" );
  }else{  
  return res.status(401).send("sesion no valida");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});