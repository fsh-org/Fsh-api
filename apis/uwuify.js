function uwuify(text) {
  text = text
    .replace('per','paw')
  text = text
    .replace(/r/g, "w")
    .replace(/l/g, "w")
    .replace(/R/g, "W")
    .replace(/L/g, "W")
    .replace(/the/g, "da")
    .replace(/The/g, "Da")
    .replace(/th/g, "d")
    .replace(/TH/g, "D")
    .replace(/ove/g, "uv")
    .replace(/(?:\.|!|\?)/g, function(match){return`${[" ;w;", " ;;w;;", " ;u;", " owo", " uwu", " >.<", " >.>", " :3", "~ ", "~~ "][Math.floor(Math.random()*10)]}${match}`});

  return text;
}

module.exports = {
  path: '/uwuify',
  info: 'Make text into uwu speech',
  type: 'get',
  params: ['text', true],
  category: "text",
  
  async execute(req, res) {
    if (!req.query['text']) {
      res.json({
        err: true,
        msg: 'You must include the text param'
      })
      return;
    }
    
    res.json({
      text: uwuify(req.query['text'])
    })
  }
}