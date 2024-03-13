const punycode = require('punycode');

module.exports = {
  path: '/puny',
  info: 'Convert a domain into punycode',
  type: 'get',
  params: ['domain', true],
  category: "text",
  
  async execute(req, res) {
    if (!req.query['domain']) {
      res.json({
        err: true,
        msg: 'You must include a domain'
      });
      return;
    }

    res.json({
      puny: punycode.toASCII(req.query['domain'])
    })
  }
}