module.exports = {
  path: '/hex',
  info: 'Encode and decode hexadecimal and utf8 (set type to encode/dedcode)',
  type: 'get',
  params: [
    {
      name: 'type',
      required: true,
      default: 'encode'
    },
    {
      name: 'text',
      required: true,
      default: 'fshy'
    }
  ],
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
        text: Buffer.from(req.query["text"], 'UTF8').toString('Hex')
      })
      return;
    }
    if (req.query["type"] === "decode") {
      res.json({
        text: Buffer.from(req.query["text"], 'Hex').toString('UTF8')
      })
      return;
    }
    res.error('Type not valid')
  }
}