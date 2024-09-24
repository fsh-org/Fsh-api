// Fsh api

let process = require('process');

const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const requestIp = require('request-ip');

const path = require("path")
const fs = require("fs")

process.on('uncaughtException', function(err) {
  console.log('Error!');
  console.log(err);
});

const apis = new Map();

app.use(bodyParser.urlencoded({
  extended: false,
  limit: '1gb'
}));
app.use(bodyParser.raw({
  type: '*/*',
  limit: '1gb'
}));
app.use(requestIp.mw());

app.use(function(req,res,next){
  res.set('Access-Control-Allow-Origin', '*');
  next()
})
app.use(function(req,res,next){
  res.json = function(json) {
    res.set('content-type', 'application/json');
    // DEPRACATED
    if (json.err) {
      res.status(400)
    }
    // ----------
    res.send(JSON.stringify(json, null, 2));
  }
  res.error = function(msg, code=400) {
    res.status(code);
    res.set('content-type', 'application/json');
    res.send(JSON.stringify({err: true, msg: msg}, null, 2));
  }
  next()
})

app.use('/images', express.static('images'))

app.use(function(req,res,next){
  if (req.url.includes('/download/')) {
    res.setHeader('Content-Disposition', `attachment; filename=${req.url.split('/download/')[1].split('/').slice(-1)[0]}`);
  }
  next()
})
app.use('/download', express.static('images'))

/* -- Mark the files with fs to var apis -- */
const getAllFiles = function (endsin, dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(endsin, dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(endsin))
        arrayOfFiles.push(path.join(dirPath, "/", file));
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
app.get('/', (req, res) => {
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
    if ((endpoint.category || 'hidden') !== 'hidden') count += 1;

    // Params
    let params = [];
    if ((endpoint.params || []).length > 0) {
      endpoint.params.forEach(param => {
        params.push(`<div class="r-${param.required ? 'm' : 'o'}">${param.name}</div>`)
      })
    }

    // Detail element
    html[endpoint.category || 'hidden'] += `<details class="t-${endpoint.type}">
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
</div>`;

  res.send(fs.readFileSync('html/index.html', 'utf8').replace("{{endpoints}}", html).replace("{{count}}", count))
})

app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/search.html'))
})

app.get("/requests", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/requests.html'))
})

// TODO: Remove builder or keep it idk
app.get("/builder", (req, res) => {
  let u = "";
  for (const file of apisFiles) {
    if (require(file).category != "hidden") {
      u = u + `<option value="${require(file).path}">${require(file).path.replace("/","")}</option>`
    }
  }
  res.send(fs.readFileSync('html/builder.html', 'utf8').replaceAll("{end}", u))
})

/* -- Static media -- */
app.get("/styleapi.css", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/styleAPI.css'))
})
app.get("/requests.json", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/requests.json'))
})

/* -- Backend stuff -- */
app.post('/request', async(req, res) => {
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

app.get('/pt', async(req, res) => {
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

/* -- Make last path, this takes all remaining paths -- */
app.all('*', (req,res)=>{
  if(apis.has(req.path)){
    apis.get(req.path).execute(req, res);
  } else {
    res.status(404)
    res.sendFile(path.join(__dirname, 'html/error.html'))
  }
})

app.listen(3000, ()=>{
  console.log('Server online at port 3000')
})
