let http = require( 'http');
let https = require( 'https');
let fs = require( 'fs');
let express = require('express')
let WebSocketServer = new require('ws');


function runserver(bpath) {

  const SERVER_CERT = process.env.DBG_SERVER_CERT //|| '/etc/letsencrypt/live/fapp.space/fullchain.pem';
  const SERVER_KEY  = process.env.DBG_SERVER_KEY //|| '/etc/letsencrypt/live/fapp.space/privkey.pem';
  const HOST  = process.env.HOST ||  'localhost'//|| '/etc/letsencrypt/live/fapp.space/privkey.pem';
  const PORT = process.env.PORT || 8333;

  const __debug__ = process.env.NODE_ENV === 'development';

  console.log('---config---')
  console.log('HOST:',HOST)
  console.log('PORT:',PORT)
  console.log('SERVER_CERT (opt):',SERVER_CERT)
  console.log('SERVER_KEY  (opt):',SERVER_KEY)
  console.log('------------')

  if(__debug__) {
    console.log('-- DEBUG! --')
    console.log('------------')
  }



  let server = {close:function(cb){cb && cb()}};//makeServer();server.listen(PORT)
  let io = {close:function(cb){cb && cb()}};;//new WebSocketServer.Server({ server });io = run(io)

  let app = express()

  server = makeServer(app)
  server.listen({
    host: HOST,
    port: PORT
  },()=>{
    console.log(`The server is running at ${HOST}:${PORT}/`);
    const url = `http://${HOST}:${PORT}`;

    const ChromeLauncher = require('chrome-launcher');

    //const newFlags = ChromeLauncher.defaultFlags().filter(flag => flag !== '--disable-extensions' && flag !== '--mute-audio');

    ChromeLauncher.launch({
      ignoreDefaultFlags: true,
      startingUrl: url,
      chromeFlags: [
        '--new-window',
        '--disable-sync',
        '--no-first-run',
        '--disable-background-networking',
        '--disable-translate',
        '--disable-features=TranslateUI',
      ],
    }).then(chrome => {
      //console.log(`Chrome debugging port running on ${chrome.port}`);
    });

  })


  //debug proxy
  if(__debug__) {
    app.get('/', (req, res, next) => {
      return res.send(`
  --| DEBUG MODE |-- <br/>
  server: ${HOST}:${PORT} <br/>
  run app: yarn dev_app <br/>
  `);
    });
  }

  app.use('/', express.static(bpath));

  io = new WebSocketServer.Server({ server });
  io = run(io)


  let _CONNECTIONS_CNT = 0;
  let _CONNECTIONS = [];

  async function onConnection(ws,req) {

    ws.isServer = req.url.substr(-3) !== 'dbg' ;
    ws.id = _CONNECTIONS_CNT++;
    ws.isAlive = true;
    ws.ip = ws._socket.remoteAddress;

    console.log(`---| ws connected |--- \nid\t\t${ws.id}\nisServer\t${ws.isServer}\nIP\t\t${ws._socket.remoteAddress}\nuser-agent\t${req.headers['user-agent']}\n`);

    _CONNECTIONS.push(ws);

    ws.on('pong', function(){
      this.isAlive = true;
    });

    ws.on('message', (message) => {
  /*    try {
          let obj = JSON.parse(message);
          log_out(obj);
      }catch(e) {}
  */
      _CONNECTIONS.map(it=>{
        if(it.id !== ws.id && !it.isServer) {
          it.send(message);
        }
      })

    });

    ws.on('close', ()    => {
      console.log(`---| ws close |---\nid\t\t${ws.id}\nIP\t\t${ws.ip}\nisServer\t${ws.isServer}\n`)
      close(ws);
    });

    ws.on('error', (err) => {
      console.log('ws error: ',err)
      close(ws);
    });

    function close(ws) {
      _CONNECTIONS = _CONNECTIONS.filter(it=>it.id !== ws.id);
    }
  }

  //console.log(`Create Server at HOST(${HOST}) PORT( ${PORT} )\n`)

  function makeServer(app) {
    let options = null;
    if(SERVER_CERT) {
      options = {
        cert: fs.readFileSync(SERVER_CERT),
        key: fs.readFileSync(SERVER_KEY),
      };
    }

    return http.createServer(app,options);
  }

  function run(io) {
    io.on('connection', onConnection);
    function noop(){}

    const interval = setInterval(function ping() {
      io.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        //console.log('server.js [263] -> ping: ')
        ws.ping(noop);
      });
    }, 3000);
    return io;
  }


/*  function log_out({type,name,args}) {

    let str = JSON.stringify(args);
    let out = str.substr(0,70)+"... ["+str.length+"]";
    if(type === 'action') {
      console.log(`\x1b[93m${type} \t \x1b[36m${name} \t\t\t \x1b[37m${out}\x1b[0m`)
    }
    if(type === 'state') {
      console.log(`\x1b[33m${type} \t \x1b[36m${name}\x1b[0m`)
    }
    if(type === 'emit') {
      console.log(`\x1b[32m${type} \t \x1b[36m${name} \t\t\t \x1b[37m${out}\x1b[0m`)
    }
    if(type === 'error') {
      console.log(`\x1b[91m${type} \t \x1b[36m${name} \t\t\t \x1b[37m${out}\x1b[0m`)
    }
  }*/

} //runserver
const is_debug = process.env.NODE_ENV === 'development';

if(is_debug) {
  runserver('build')
}
export default runserver;