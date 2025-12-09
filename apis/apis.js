const fs = require('fs')
var path = require('path')

const getAllFiles = function (endsin, dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(endsin, dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith(endsin))
        arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};

module.exports = {
  path: '/apis',
  info: 'Get a list of the apis',
  type: 'get',
  params: [],
  category: 'text',

  async execute(req, res) {
    const apisFiles = getAllFiles('.js', path.join(__dirname, ''))

    let data = {
      count: 0,
      endpoints: {}
    };

    apisFiles.forEach(fil => {
      let file = require(fil);
      if (file.category != 'hidden') {
        data.count += 1;
        data.endpoints[file.path.replace('/','')] = {
          path: file.path,
          info: file.info,
          type: file.type,
          params: file.params,
          category: file.category
        }
      }
    });

    res.json(data);
  }
}