function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}
function toBin(str) {
  return chunkString(str, 1).map(e=>{return e.charCodeAt(0).toString(2).padStart(8, '0')}).join('')
}
function toStr(bin) {
  return chunkString(bin.split('_').slice(-1)[0], Number(bin.includes('_') ? bin.split('_')[0].split('~')[0] : 8) || 8).map(e=>{return String.fromCharCode(parseInt(e, 2))}).join('').replaceAll('\n','\\n')
}

module.exports = {
  path: '/binary',
  info: 'Encode and decode binary and utf8 (set type to encode/dedcode)',
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

  async execute(req, res){
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
        text: toBin(req.query["text"])
      })
      return;
    }
    if (req.query["type"] === "decode") {
      res.json({
        text: toStr(req.query["text"])
      })
      return;
    }
    res.error('Type not valid')
  }
}