const crypto = require('node:crypto');

module.exports = {
  path: '/sha512',
  info: 'Hashes the text using sha512',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['text']) {
      res.error('Include text');
      return;
    }
    res.json({
      text: Buffer.from(crypto.createHash('sha512').update(req.query['text']).digest()).toString('hex')
    })
  }
}