const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const app = express();

const {FieldValue} = require('firebase-admin/firestore')
const cors=require('cors');
const fs = require("fs");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
  console.log('Conexió establerta');
}).catch((error) => {
  console.error("No s'ha pogut connectar", error);
});

const Product = sequelize.define("productes", {
  idproducte:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },nom: {
    type: Sequelize.STRING,
    allowNull: false
  },preu:{
    type: Sequelize.INTEGER,
    allowNull: false
  },img:{
    type: Sequelize.STRING,
    allowNull: false
  },tipus:{
    type: Sequelize.STRING,
    allowNull: false
  }
});

sequelize.sync().then(()=>{
  console.log('Base de dades sincroniotzada');
}).catch((error) => {
  console.error("No s'ha pogut sincronitzar", error);
})

app.use(cors());
app.use(express.json());

port = 3080;

app.listen(port, ()=>{
  console.log(`el port::${port} funciona`)
});

app.get('/productes', async (req, res) => {

  Product.findAll().then((data)=>{
    res.json(data)
  }).catch((error)=>{
    console.error("Han fallat els productes", error)
  })

})


var admin = require("firebase-admin");
var serviceAccount = require("./botiga-61177-firebase-adminsdk-a1p5h-9b6614abd8.json");
const {getFirestore} = require("firebase-admin/firestore");
const {request} = require("express");
const {DataTypes} = require("sequelize");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore(app);

baseDades();
async function baseDades() {


  app.get('/api/firebase', async (req, res) => {
    const conn = db.collection("iniciar-registrar").doc("8X8qyKzfzPYPdqlUA6Ut");
    const doc = await conn.get();
    const document = doc.data();

    res.json(document);
  })
}

app.post('/registrar', async (req, res) => {
  const respostaUser = await admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false,
  })
  res.json(respostaUser);
});

app.post('/datausers', async (req, res) => {
  db.collection('iniciar-registrar').doc('8X8qyKzfzPYPdqlUA6Ut').set(
    {
      client: FieldValue.arrayUnion({
        Nom: req.body.nom,
        email: req.body.correu,
        password: 'patata'
      })
    }, {merge: true}).then(r => {
      console.log("dades inserides");
    })
});


app.get('/imatges/:nom',(req,res)=>{
  const nomImatge = req.params.nom;
  const rutaImatge = `../IMG/${nomImatge}`;
  const stream = fs.createReadStream(rutaImatge);
  stream.pipe(res);
})



/*
app.post('/api/formulario', (req, res) => {

  const datos = req.body;


  const nombreArchivo = `datos_${new Date().toISOString()}.txt`;


  fs.writeFile(nombreArchivo, JSON.stringify(datos), (error) => {
    if (error) {
      console.error(`Error al escribir en el archivo ${nombreArchivo}: ${error}`);
      res.status(500).send('Error interno del servidor');
    } else {
      console.log(`Los datos se han guardado en el archivo ${nombreArchivo}`);
      res.status(200).send('Los datos se han guardado correctamente');
    }
  });
});*/
