//-------------------------------------------------------------------
// Entregable 12: Variables de Entorno
// Fecha de entrega: 22-12-21
// Alumno: Damian del Campo
//-------------------------------------------------------------------
const {Router} = require('express')
const routerInfo = new Router()
const os = require('os')


routerInfo.get('/', (req,res)=> {
    res.json(
        {
            Arg: process.argv.slice(2), 
            SO: process.platform,
            Node: process.version,       
            Memoria: process.memoryUsage().rss,
            execPath: process.execPath,
            PID: process.pid, 
            ProjectFolder: process.cwd(),
            NroSrv: os.cpus().length
        }
    );
})

module.exports=routerInfo