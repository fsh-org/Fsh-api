const crypto = require("crypto");

module.exports = {
  path: '/sha256',
  info: 'Encrypts the text using sha256',
  type: 'get',
  params: ['text', true],
  category: "text",

  async execute(req, res) {
    res.json({
      text: Buffer.from(crypto.createHash('sha256').update(req.query["text"]).digest()).toString('hex')
    })
  }
}