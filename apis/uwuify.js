const ends = [' >:3', ' ;u;', ' :>', ' x3', ' >///<', ' >~<', ' ^^', ' OwO', ' uwu', ' >.<', ' :3', '~ ', '~~ '];
function uwuify(text) {
  text = text
    .replace('per','paw');
  text = text
    .replace(/r/g, 'w')
    .replace(/l/g, 'w')
    .replace(/R/g, 'W')
    .replace(/L/g, 'W')
    .replace(/the/g, 'da')
    .replace(/The/g, 'Da')
    .replace(/th/g, 'd')
    .replace(/TH/g, 'D')
    .replace(/ove/g, 'uv')
    .replace(/(?:\.|!|\?)/g, function(match){return`${ends[Math.floor(Math.random()*ends.length)]}${match}`});

  return text;
}

module.exports = {
  path: '/uwuify',
  info: 'Make text into uwu speech',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['text']) {
      res.error('You must include the text param');
      return;
    }

    res.json({
      text: uwuify(req.query['text'])
    })
  }
}