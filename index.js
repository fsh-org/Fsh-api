// Fsh api
const path = require('node:path');
const fs = require('node:fs');

let process = require('process');
process.env = require('./env.js');

const fastify = require('fastify')({
  bodyLimit: 100 * 1024 * 1024 // 100MB
});
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
    const filename = req.query.title??req.url.split('/download/')[1].split('/').slice(-1)[0];
    res.header('Content-Disposition', `attachment; filename="${filename.replaceAll(/[^a-zA-Z0-9!#$&\.^_|~\-]+/g,'')}"; filename*=UTF-8''${encodeURIComponent(filename).replaceAll(/[!'\(\)\*]/g, c=>'%'+c.charCodeAt(0).toString(16).toUpperCase())}`);
  }
  // IP
  req.pip = requestIp.getClientIp(req.raw);
});

// Body
const BodyLimit = 100 * 1024 * 1024; // 100MB
fastify.register(fbody, {
  bodyLimit: BodyLimit
});
fastify.addContentTypeParser(/^image\/.*/, { parseAs: 'buffer', bodyLimit: BodyLimit }, (req, body, done) => {
  done(null, body);
});
fastify.addContentTypeParser(/^application\/.*/, { parseAs: 'buffer', bodyLimit: BodyLimit }, (req, body, done) => {
  done(null, body);
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
fastify.register(fstatic, {
  root: path.join(__dirname, 'meme'),
  prefix: '/meme/',
  decorateReply: false
});

/* -- Mark the files with fs to var apis -- */
const getAllFiles = function (endsin, dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles ?? [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(endsin, dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith(endsin)) arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};

const apisFiles = getAllFiles('.js', path.join(__dirname, 'apis'))

/* -- Assigning paths to files + Checks -- */
for (const file of apisFiles) {
  const apiFile = require(file);
  if (!apiFile['path']) throw new Error(`[ERROR] The command at ${file} is missing a required "path" property.`);
  if (!apiFile['type']) console.warn(`[WARNING] The command at ${file} is missing "type" property.`);
  if (!apiFile['info']) console.warn(`[WARNING] The command at ${file} is missing "info" property.`);
  if (!apiFile['category']) console.warn(`[WARNING] The command at ${file} is missing "category" property.`);
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
      });
    }

    // Detail element
    html[endpoint.category ?? 'hidden'] += `<details class="t-${endpoint.type}">
  <summary>
    ${endpoint.path}
    ${params.length > 0 ? ' | '+params.join(' ') : ''}
    ${endpoint.type==='get'?`<a href="https://api.fsh.plus${endpoint.path}?${endpoint.params.filter(p=>p.required).map(p=>p.name+'='+p.default).join('&')}"><button><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path d="M109.25 0C119.605 0 128 8.395 128 18.75s-8.395 18.75-18.75 18.75H57.5c-11.046 0-20 8.954-20 20v141c0 11.046 8.954 20 20 20h141c11.046 0 20-8.954 20-20v-51.75c0-10.355 8.395-18.75 18.75-18.75S256 136.395 256 146.75V226c0 16.569-13.431 30-30 30H30c-16.568 0-30-13.431-30-30V30C0 13.432 13.432 0 30 0zM156 18.75C156 8.395 164.395 0 174.75 0H236c11.046 0 20 8.954 20 20v61.25c0 10.355-8.395 18.75-18.75 18.75s-18.75-8.395-18.75-18.75V57.5c0-11.046-8.954-20-20-20h-23.75c-10.355 0-18.75-8.395-18.75-18.75"/><path d="M114.742 114.742c-7.323 7.322-7.323 19.194 0 26.516 7.322 7.323 19.194 7.323 26.516 0zM235 21 221.742 7.742l-107 107L128 128l13.258 13.258 107-107z"/></svg></button></a>`:''}
  </summary>
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

  res.type('text/html').send(fs.readFileSync('html/index.html', 'utf8').replace('{{endpoints}}', html).replace('{{count}}', count));
});

fastify.get('/search', (req, res) => {
  res.type('text/html').send(fs.readFileSync('html/search.html', 'utf8'));
});
fastify.get('/requests', (req, res) => {
  res.type('text/html').send(fs.readFileSync('html/requests.html', 'utf8'));
});

/* -- Static media -- */
fastify.get('/favicon.ico', (req, res) => {
  res.type('image/vnd.microsoft.icon').send(fs.readFileSync('html/favicon.ico'));
});
fastify.get('/styleapi.css', (req, res) => {
  res.type('text/css').send(fs.readFileSync('html/styleAPI.css', 'utf8'));
});
fastify.get('/requests.json', (req, res) => {
  res.type('application/json').send(fs.readFileSync('html/requests.json', 'utf8'));
});
fastify.get('/robots.txt', (req, res) => {
  res.type('application/json').send(fs.readFileSync('html/robots.txt', 'utf8'));
});

// TODO: Remove builder or keep it idk
fastify.get('/builder', (req, res) => {
  let u = '';
  for (const file of apisFiles) {
    if (require(file).category === 'hidden') continue;
    u += `<option value="${require(file).path}">${require(file).path.replace('/','')}</option>`;
  }
  res.type('text/html').send(fs.readFileSync('html/builder.html', 'utf8').replaceAll('{end}', u));
});

/* -- Backend stuff -- */
fastify.post('/request', async(req, res) => {
  try {
    let url = req.query['url'];
    url = (url.includes('://') ? '' : 'https://') + url;

    let typ;
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(req.body);
    if (['image','video','audio'].includes((body.headers['content-type']??'text/plain').split('/')[0])) body.body = Buffer.from(body.body.replace(/^data:(image|video|audio)\/\w+;base64,/i, ''), 'base64');
    if (body.mime) typ = body.mime;

    let now = (new Date()/1);

    let da = await fetch(url, body);
    now = Date.now() - now;

    let cont;
    let alt = '';
    typ ??= da.headers.get('content-type')??'text/plain';
    typ = typ.split('/')[0];
    if (['image', 'audio', 'video'].includes(typ)) {
      cont = await da.arrayBuffer();
      alt = `data:${da.headers.get('content-type')};base64,${Buffer.from(cont).toString('base64')}`;
      cont = new TextDecoder().decode(cont);
    } else {
      cont = await da.text();
    }

    let hed = {}
    da.headers.forEach((value, key) => {
      hed[key] = value;
    });

    res.json({
      url: da.url,
      status: da.status,
      time: now,
      headers: hed,
      content: cont,
      alt
    });
  } catch (err) {
    res.json({
      err: true,
      msg: err.toString()
    });
  }
});

/* Fsh pt */
fastify.get('/pt-console', async(req, res) => {
  res.raw.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Allow': 'OPTIONS, GET, POST',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  });
  res.raw.flushHeaders?.();

  let newws = await fetch(`https://${req.query['host']}/api/client/servers/${req.query['id']}/websocket`, {
    method: 'GET',
    headers: {
      authorization: 'Bearer '+req.query['key'],
      accept: 'application/json',
      'content-type': 'application/json'
    }
  });
  newws = await newws.json();
  let ws = new WebSocket(newws.data.socket);

  ws.onopen = function() {
    ws.send(`{"event":"auth","args":["${newws.data.token}"]}`)

    setTimeout(() => {
      ws.send(`{"event":"send logs","args":[null]}`)
    }, 1000)
  }
  ws.onmessage = function(event) {
    if (event.data.startsWith(`{"event":"token expiring"`)) {
      res.raw.end();
      ws.close();
      return;
    }
    res.raw.write(`data: ${event.data}\n\n`)
  }
  ws.onerror = function() {
    res.raw.end();
    ws.close();
  }
  ws.onclose = function() {
    res.raw.end();
  }
  req.raw.on('close', () => {
    res.raw.end();
    ws.close();
  });
});

/* -- Make last path, this takes all remaining paths -- */
fastify.setNotFoundHandler((req,res)=>{
  let path = new URL(req.url, 'https://api.fsh.plus').pathname.replace(/\/+$/m, '');
  if(apis.has(path)){
    apis.get(path).execute(req, res);
  } else {
    res.status(404).type('text/html').send(fs.readFileSync('html/error.html', 'utf8'));
  }
});

fastify.listen({ host: process.env.host, port: process.env.port }, ()=>{
  console.log(`Server online at ${process.env.host}:${process.env.port}`);
});