module.exports = {
  path: '/base64',
  info: 'Encode and decode base64 and utf8 (set type to encode/dedcode)',
  type: 'get',
  params: ['type', true, 'text', true],
  category: "text",

  async execute(req, res) {
    if (!req.query["type"]) {
      res.error('No conversion type recived')
      return;
    }
    if (!req.query["text"]) {
      res.error('No text recived')
      return;
    }
    if (req.query["type"] === "encode") {
      res.json({
        text: Buffer.from(req.query["text"], 'UTF8').toString('Base64')
      })
      return;
    }
    if (req.query["type"] === "decode") {
      res.json({
        text: Buffer.from(req.query["text"], 'Base64').toString('UTF8')
      })
      return;
    }
    res.error('Type not valid')
  }
}