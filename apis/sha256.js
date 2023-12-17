const CRYPTOJS = require("crypto-js");

module.exports = {
  path: '/sha256',
  info: 'Encrypts the text using sha256',
  type: 'get',
  params: ["text", true],
  category: "text",
  execute(req, res){
    res.send(`{"text": "${CRYPTOJS.SHA256(req.query["text"])}"}`)
  }
}