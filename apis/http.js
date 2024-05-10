let codes = require('../text/httpcodes.js')

module.exports = {
  path: '/http',
  info: 'Get info on a http code',
  type: 'get',
  params: ['code', false],
  category: "text",
  
  async execute(req, res) {
    if (req.query['code']) {
      let code = codes[String(req.query['code'])];
      if (code.title?.length) {
        res.json(code)
      } else {
        res.json({
          err: true,
          msg: "code not found"
        })
      }
    } else {
      let keys = Object.keys(codes);
      res.json(codes[keys[keys.length * Math.random() << 0]])
    }
  }
}