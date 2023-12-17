module.exports = {
  path: '/base64',
  info: 'Encode and decode base64 and utf8 (set type to encode/dedcode)',
  type: 'get',
  params: ["type", true, "text", true],
  category: "text",
  execute(req, res){
    if (!req.query["type"]) {
      res.status(400)
      res.send(`{"error": true, "msg": "No conversion type recived"}`)
      return;
    };
    if (!req.query["text"]) {
      res.status(400)
      res.send(`{"error": true, "msg": "No text recived"}`)
      return;
    };
    if (req.query["type"] == "encode") {
      res.send(`{"text": "${Buffer.from(req.query["text"], 'UTF8').toString('Base64')}"}`)
      return;
    };
    if (req.query["type"] == "decode") {
      res.send(`{"text": "${Buffer.from(req.query["text"], 'Base64').toString('UTF8')}"}`)
      return;
    };
    res.status(400)
    res.send(`{"error": true, "msg": "type not valid"}`)
  }
}