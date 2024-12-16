const crypto = require("crypto");

module.exports = {
  path: '/md5',
  info: 'Encrypts the text using md5',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'fshy'
    }
  ],
  category: "text",

  async execute(req, res) {
    if (!req.query['text']) {
      res.error('Include text');
      return;
    }
    res.json({
      text: Buffer.from(crypto.createHash('md5').update(req.query["text"]).digest()).toString('hex')
    })
  }
}