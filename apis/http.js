let codes = require('../text/httpcodes.js')

module.exports = {
  path: '/http',
  info: 'Get info on a http code',
  type: 'get',
  params: [
    {
      name: 'code',
      required: false,
      default: '404'
    }
  ],
  category: "text",

  async execute(req, res) {
    if (req.query['code']) {
      let code = codes[String(req.query['code'])];
      if (code.title?.length) {
        res.json(code);
      } else {
        res.error('Code not found');
      }
    } else {
      let keys = Object.keys(codes);
      res.json(codes[keys[keys.length * Math.random() << 0]]);
    }
  }
}
