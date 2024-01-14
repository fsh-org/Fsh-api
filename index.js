const express = require('express')
const app = express()
const cors = require('cors')
var bodyParser = require('body-parser')

const path = require("path")
const fs = require("fs")

const apis = new Map();

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

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
  for (const file of apisFiles) {
  	const apiFile = require(file);
    h = [];
    if (apiFile.params.length > 1) {
      // added very shitty thing to make more than 2 arguments possible, why didn't it work before? i don't f*cking know
      for (i = -2; i <= apiFile.params.length / 2;) {
        i += 2
        if (apiFile.params[i + 1] == true) {
          h.push(`&lt;${apiFile.params[i]}&gt;`);
        } else {
          if (apiFile.params[i + 1] == false) {
            h.push(`(${apiFile.params[i]})`);
          }
        }
      }
    }
    let r = h.join(" ");
    if (apiFile.params.length > 1) {
      r = ` <ss style="background-color:#444;">{ ${r} }</ss>`
    }
	  h = `<p><b>${apiFile.path}</b>${r} <ss style="background-color:#${apiFile.type == "get" ? "464" : "#644"};">[${apiFile.type}]</ss> - ${apiFile.info}</p>`;
    if (apiFile.category == "text") {
      txt = txt+h;
    }
    if (apiFile.category == "image") {
      img = img+h;
    }
  }
  h = `<h3>Text</h3>
<ty class="centerAPI">
  ${txt}
</ty>
<h3>Image</h3>
<ty class="centerAPI">
  ${img}
</ty>
<!--<h3>Test</h3>
<style>
details{
  border:var(--col) 1px solid;
  border-radius:0.5rem;
  padding:5px;
  margin:5px;
  text-align:left;
}
summary::before {
  content: var(--tex);
  background-color: var(--col);
  margin-left:2px;
  margin-right:2px;
  border-radius:0.25rem;
  padding:0px 2px;
}
.t-get {
  --tex: "Get";
  --col: #88f;
}
.t-post {
  --tex: "Post";
  --col: #f88;
}
</style>
<details class="t-get">
<summary>/potat | arguments</summary>
long description
</details>
<details class="t-post">
<summary>/potat | arguments</summary>
long description
</details>-->`;
  res.send(fs.readFileSync('html/index.html', 'utf8').replaceAll("{a}", h))
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
