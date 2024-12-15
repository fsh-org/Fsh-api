const data = require('../text/pt.js')

module.exports = {
  path: '/periodic-table',
  info: 'Get info on a element (search via symbol or number)',
  type: 'get',
  params: [
    {
      name: 'element',
      required: false,
      default: '1'
    }
  ],
  category: "text",

  async execute(req, res) {
    if (!req.query['element']) {
      res.json(data[Math.ceil(Math.random()*data.length-1)]);
    } else {
      if (Number(req.query['element'])) {
        let hg = data[Number(req.query['element'])];
        if (!hg) {
          res.error('Elemenet not found');
          return;
        }
        res.json(hg)
      } else {
        let hg = data.filter(t => {return String(t.symbol).toLowerCase() == req.query['element'].toLowerCase()})[0];
        if (!hg) {
          res.error('Elemenet not found');
          return;
        }
        res.json(hg)
      }
    }
  }
}