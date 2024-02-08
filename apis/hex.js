module.exports = {
  path: '/hex',
  info: 'Encode and decode hexadecimal and utf8 (set type to encode/dedcode)',
  type: 'get',
  params: ["type", true, "text", true],
  category: "text",
  execute(req, res){
    if (!req.query["type"]) {
      res.json({
        err: true,
        msg: "No conversion type recived"
      })
      return;
    }
    if (!req.query["text"]) {
      res.json({
        err: true,
        msg: "No text recived"
      })
      return;
    }
    if (req.query["type"] == "encode") {
      res.send(`{"text": "${Buffer.from(req.query["text"], 'UTF8').toString('Hex')}"}`)
      return;
    }
    if (req.query["type"] == "decode") {
      res.json({
        text: Buffer.from(req.query["text"], 'Hex').toString('UTF8')
      })
      return;
    }
    res.json({
      err: true,
      msg: "type not valid"
    })
  }
}