const crypto = require("crypto");

module.exports = {
  path: '/md5',
  info: 'Encrypts the text using md5',
  type: 'get',
  params: ['text', true],
  category: "text",

  async execute(req, res) {
    res.json({
      text: Buffer.from(crypto.createHash('md5').update(req.query["text"]).digest()).toString('hex')
    })
  }
}