const punycode = require('punycode');

module.exports = {
  path: '/puny',
  info: 'Convert a domain into punycode',
  type: 'get',
  params: [
    {
      name: 'domain',
      required: true,
      default: 'fsh.plus'
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['domain']) {
      res.error('You must include a domain');
      return;
    }

    res.json({
      puny: punycode.toASCII(req.query['domain'])
    });
  }
}