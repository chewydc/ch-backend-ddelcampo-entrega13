//-------------------------------------------------------------------
// Entregable 12: Variables de Entorno
// Fecha de entrega: 22-12-21
// Alumno: Damian del Campo
//-------------------------------------------------------------------
const express = require('express')
const cluster =require('cluster')
const os =require('os')

const session = require('express-session')

const app = express()
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const passport = require('passport');
const {userModel,advancedOptions,mongoUrl} = require('./options/mongoDB');
const MongoStore = require('connect-mongo')

//-------------------------------------------------------------------
// Seteo la Session
const config = require('./config');
app.use(
  session({
      //Persistencias de sesiones en MongoDB Atlas
      store: MongoStore.create({
      mongoUrl: mongoUrl,
      mongoOptions: advancedOptions
      }),
    secret: config.credenciales.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,  
    cookie: {
      maxAge: 60000
    }
  })
);
app.use(passport.initialize())
app.use(passport.session())
//-------------------------------------------------------------------

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


//-------------------------------------------------------------------
//Declaro Router a utilizar
const routerMensajes = require("./router/mensajes") 
const routerProductos = require("./router/productos")
const routerProductostest = require("./router/productos-test")
const routerInfo = require("./router/info")
const routerRandom = require("./router/random")
const routerWeb = require("./router/webpage")

app.use('/api/mensajes',routerMensajes)
app.use('/api/productos',routerProductos)
app.use('/api/productos-test',routerProductostest)
app.use('/api/info',routerInfo)
app.use('/api/randoms',routerRandom)
app.use('/',routerWeb)
//-------------------------------------------------------------------

//-------------------------------------------------------------------
//Manejo de websockets
io.on('connection', clientSocket => {
  console.log(`#${clientSocket.id} se conect??`)

  clientSocket.on('nuevoProducto', () => {
    console.log("Llego el evento del tipo Prod update")
    io.sockets.emit('updateProd')
  })
  
  clientSocket.on('nuevoMensaje', () => {
    console.log("Llego el evento del tipo Msj update")
    io.sockets.emit('updateMsj')
  })

})
//----------------------------------------------------------
// Tomo el puerto de los argumentos ingresado por linea de comando
const parseArgs = require('minimist');
const options = {
    alias: {
        p: 'puerto',
        m: 'modo'
        },
    default: {
        puerto: 8080,
        modo: 'FORK'
    }
}
const commandLineArgs = process.argv.slice(2);
const { puerto, modo, _ } = parseArgs(commandLineArgs, options);
console.log({ puerto, modo, otros: _ });

//-------------------------------------------------------------------
// Cargo el server
if(modo=='CLUSTER' && cluster.isMaster) {
  const numCPUs = os.cpus().length
  
  console.log(`N??mero de procesadores: ${numCPUs}`)
  console.log(`PID MASTER ${process.pid}`)

  for(let i=0; i<numCPUs; i++) {
      cluster.fork()
  }

  cluster.on('exit', worker => {
      console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString())
      cluster.fork()
  })
}

else {

  const server = httpServer.listen(puerto, () => {
    console.info(`Servidor HTTP escuchando en el puerto ${server.address().port} - PID WORKER ${process.pid}`)
    })
    server.on("error", error => console.log(`Error en servidor ${error}`))

}

