// Fsh api
const path = require("path");
const fs = require("node:fs");
const WebSocketClient = require('websocket').client;

let process = require('process');
process.env = require('./env.js');

const fastify = require('fastify')();
const fbody = require('@fastify/formbody');
const fstatic = require('@fastify/static');
const requestIp = require('request-ip');

process.on('uncaughtException', function(err) {
  console.log('Error!');
  console.log(err);
});

const apis = new Map();

// Responses
fastify.decorateReply('json', function(json) {
  this.header('content-type', 'application/json');
  this.send(JSON.stringify(json, null, 2));
});
fastify.decorateReply('error', function(msg, code = 400) {
  this.status(code);
  this.header('content-type', 'application/json');
  this.send(JSON.stringify({ err: true, msg: msg }, null, 2));
});

// Requests
fastify.addHook('onRequest', async(req, res) => {
  // Cors
  res.header('Allow', 'OPTIONS, GET, POST');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  // Options
  if (req.method.toLowerCase() === 'options') {
    res.status(200).send('');
  }
  // Download
  if (req.url.includes('/download/')) {
    const filename = req.url.split('/download/')[1].split('/').slice(-1)[0];
    res.header('Content-Disposition', `attachment; filename=${filename}`);
  }
  // IP
  req.pip = requestIp.getClientIp(req.raw);
});

// Body
const BodyLimit = 1 * 1024 * 1024 * 1024; // 1GB
fastify.register(fbody, {
  bodyLimit: BodyLimit
});
fastify.addContentTypeParser('*/*', { parseAs: 'buffer', bodyLimit: BodyLimit }, (req, body, done) => {
  done(null, body);
});

// Static
fastify.register(fstatic, {
  root: path.join(__dirname, 'images'),
  prefix: '/images/'
});
fastify.register(fstatic, {
  root: path.join(__dirname, 'images'),
  prefix: '/download/',
  decorateReply: false
});

/* -- Mark the files with fs to var apis -- */
const getAllFiles = function (endsin, dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles ?? [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(endsin, dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(endsin)) arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

const apisFiles = getAllFiles('.js', path.join(__dirname, 'apis'))

/* -- Assigning paths to files + Checks -- */
for (const file of apisFiles) {
	const apiFile = require(file);
  if (!apiFile['path']) {
    throw new Error(`[ERROR] The command at ${file} is missing a required "path" property.`);
  }
  if (!apiFile['type']) {
    console.warn(`[WARNING] The command at ${file} is missing "type" property.`);
  }
  if (!apiFile['info']) {
    console.warn(`[WARNING] The command at ${file} is missing "info" property.`);
  }
  if (!apiFile['category']) {
    console.warn(`[WARNING] The command at ${file} is missing "category" property.`);
  }
  if ('execute' in apiFile) {
    apis.set(apiFile.path, apiFile);
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "execute" property.`);
  }
}

/* -- Main pages -- */
fastify.get('/', (req, res) => {
  let count = 0;
  let html = {
    text: '',
    image: '',
    audio: '',
    hidden: ''
  };

  for (const file of apisFiles) {
    // Get file
    const endpoint = require(file);
    if ((endpoint.category ?? 'hidden') !== 'hidden') count += 1;

    // Params
    let params = [];
    if ((endpoint.params ?? []).length > 0) {
      endpoint.params.forEach(param => {
        params.push(`<div class="r-${param.required ? 'm' : 'o'}">${param.name}</div>`)
      })
    }

    // Detail element
    html[endpoint.category ?? 'hidden'] += `<details class="t-${endpoint.type}">
  <summary>${endpoint.path}${params.length > 0 ? ' | '+params.join(' ') : ''}</summary>
  ${endpoint.info}
</details>`
  }

  // Setup final html
  html = `<div style="flex:1">
  <h2>Text</h2>
  ${html['text']}
</div>
<div style="flex:1">
  <h2>Image</h2>
  ${html['image']}
</div>
<div style="width:300px">
  <h2>Audio</h2>
  ${html['audio']}
</div>
<div style="display:none;flex:1;">
  <h2>Hidden</h2>
  ${html['hidden']}
</div>`;

  res.type('text/html').send(fs.readFileSync('html/index.html', 'utf8').replace("{{endpoints}}", html).replace("{{count}}", count))
})

fastify.get("/search", (req, res) => {
  res.type('text/html').send(fs.readFileSync('html/search.html', 'utf8'))
})

fastify.get("/requests", (req, res) => {
  res.type('text/html').send(fs.readFileSync('html/requests.html', 'utf8'))
})

// TODO: Remove builder or keep it idk
fastify.get("/builder", (req, res) => {
  let u = "";
  for (const file of apisFiles) {
    if (require(file).category != "hidden") {
      u = u + `<option value="${require(file).path}">${require(file).path.replace("/","")}</option>`
    }
  }
  res.type('text/html').send(fs.readFileSync('html/builder.html', 'utf8').replaceAll("{end}", u))
})

/* -- Static media -- */
fastify.get("/styleapi.css", (req, res) => {
  res.type('text/css').send(fs.readFileSync('html/styleAPI.css', 'utf8'))
})
fastify.get("/requests.json", (req, res) => {
  res.type('application/json').send(fs.readFileSync('html/requests.json', 'utf8'))
})

/* -- Backend stuff -- */
fastify.post('/request', async(req, res) => {
  try {
    let url = req.query['url'];
    url = (url.includes('://') ? '' : 'https://') + url;

    let now = (new Date()/1);

    let da = await fetch(url, JSON.parse(req.body));
    let cont = await da.text();

    now = (new Date()/1) - now;

    let hed = {}
    da.headers.forEach((value, key) => {
      hed[key] = value;
    });

    res.json({
      headers: hed,
      status: da.status,
      time: now,
      content: cont
    })
  } catch (err) {
    res.json({
      err: true,
      msg: err
    })
  }
})

/* Fsh pt *//*
fastify.get('/pt', async(req, res) => {
  try {
    let opt = {
      method: req.query['method'] || 'GET',
      headers: {
        authorization: 'Bearer '+req.query['key'],
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }
    if (['post', 'put'].includes(opt.method.toLowerCase())) {
      opt.body = req.query['body'] || '';
      try {
        JSON.parse(opt.body);
      } catch (e) {
        opt.headers['Content-Type'] = 'text/plain'
      }
    }
    let da = await fetch (req.query['url'], opt);
    if (da.status === 204) {res.send('ok');return;}
    let stat = da.status;
    if ((da.headers.get('Content-Type')||'').includes('text/')) {
      da = await da.text();
      res.status(stat);
      res.send(da);
    } else {
      da = await da.json();
      res.status(stat);
      res.json(da);
    }
  } catch (err) {
    res.json({
      err: true,
      msg: err
    })
  }
})
fastify.get('/pt-console', async(req, res) => {
  res.header('Cache-Control', 'no-cache');
  res.header('Content-Type', 'text/event-stream');
  res.header('Connection', 'keep-alive');
  res.flushHeaders();

  let newws = await fetch(`https://${req.query['host']}/api/client/servers/${req.query['id']}/websocket`, {
    method: 'GET',
    headers: {
      authorization: 'Bearer '+req.query['key'],
      accept: "application/json",
      "Content-Type": "application/json"
    }
  });
  newws = await newws.json();
  const client = new WebSocketClient();

  client.on("connectFailed", function(error) {
    console.log(error)
    res.end();
  });

  client.on("connect", async function(connection) {
    await connection.sendUTF(`{"event":"auth","args":["${newws.data.token}"]}`)

    setTimeout(() => {
      connection.sendUTF(`{"event":"send logs","args":[null]}`)
    }, 1000)

    connection.on("error", function(error) {
      res.end();
      connection.close();
    });

    connection.on("message", function(message) {
      if (message.type != "utf8") return;
      if (message.utf8Data.startsWith(`{"event":"token expiring"`)) {
        res.end();
        connection.close();
        return;
      }

      res.write('data: '+message.utf8Data+'\n\n')
    });
  });

  client.connect(newws.data.socket);
});

/* -- Make last path, this takes all remaining paths -- */
fastify.all('*', (req,res)=>{
  let path = '/'+req.url.split('?')[0].split('/').filter(e=>e.length).join('/');
  if(apis.has(path)){
    apis.get(path).execute(req, res);
  } else {
    res.status(404)
    res.type('text/html').send(fs.readFileSync('html/error.html', 'utf8'))
  }
})

fastify.listen({ port: process.env.port }, ()=>{
  console.log('Server online at port '+process.env.port)
})