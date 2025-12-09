const crypto = require('node:crypto');

module.exports = {
  path: '/sha256',
  info: 'Hashes the text using sha256',
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
      text: Buffer.from(crypto.createHash('sha256').update(req.query['text']).digest()).toString('hex')
    })
  }
}