const express = require('express')
const app = express()
const cors = require('cors')
var bodyParser = require('body-parser')
const requestIp = require('request-ip');

const path = require("path")
const fs = require("fs")

const apis = new Map();

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(requestIp.mw());

//app.use('/api', express.static('apis'))
//app.use(express.static('html'))
app.use('/highlight', express.static('highlight'))
app.use('/images', express.static('images'))

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

for (const file of apisFiles) {
	const apiFile = require(file);
	if ('execute' in apiFile) {
		apis.set(apiFile.path, apiFile);
	} else {
		console.log(`[WARNING] The command at ${file} is missing a required "execute" property.`);
	}
}

/* -- Main pages -- */
app.get('/', (req,res)=>{
  let h = "";
  let txt = "";
  let img = "";
  let count = 0;
  for (const file of apisFiles) {
  	const apiFile = require(file);
    if ((apiFile.category || 'hidden') != 'hidden') count += 1;
    h = [];
    if ((apiFile.params || []).length > 1) {
      apiFile.params.forEach(g => {
        if (apiFile.params.indexOf(g) % 2 == 0) {
          h.push(`<div class="r-${apiFile.params[apiFile.params.indexOf(g)+1] ? 'm' : 'o'}">${g}</div>`)
        }
      })
    }
    let r = h.join(" ");
    if ((apiFile.params || []).length > 1) {
      r = ` | ${r}`
    }
    h = `<details class="t-${apiFile.type}">
  <summary>${apiFile.path}${r}</summary>
  ${apiFile.info}
</details>`;
    switch (apiFile.category) {
      case 'text':
        txt += h;
        break;
      case 'image':
        img += h;
        break;
    }
  }
  h = `<h2>Text</h2>
  ${txt}
<h2>Image</h2>
  ${img}`;
  res.send(fs.readFileSync('html/index.html', 'utf8').replace("{a}", h).replace("{b}", count))
})

app.get("/builder", (req, res) => {
  let u = "";
  for (const file of apisFiles) {
    if (require(file).category != "hidden") {
      u = u + `<option value="${require(file).path}">${require(file).path.replace("/","")}</option>`
    }
  }
  res.send(fs.readFileSync('html/builder.html', 'utf8').replaceAll("{end}", u))
})

app.get("/styleapi.css", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/styleAPI.css'))
})

app.get("/builder", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/builder.html'))
})

app.get("/requests", (req, res) => {
  res.sendFile(path.join(__dirname, 'html/requests.html'))
})

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!fs.existsSync(path.join(__dirname, 'images', filename))) {res.send('no file');return;}
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.sendFile(path.join(__dirname, 'images', filename))
})
app.get('/download/:dir/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!fs.existsSync(path.join(__dirname, 'images', req.params.dir, filename))) {res.send('no file');return;}
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.sendFile(path.join(__dirname, 'images', req.params.dir, filename))
})

app.get('/pt', async(req, res) => {
  try {
    let opt = {
      method: req.query['method'] || 'GET',
      headers: {
        authorization: 'Bearer '+req.query['key'],
        'content-type': 'application/json'
      }
    }
    if (opt.method != 'GET') opt.body = req.query['body'] || '';
    let da = await fetch (req.query['url'], opt);
    da = await da.json();
    res.json(da)
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
