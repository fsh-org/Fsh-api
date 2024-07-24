const sharp = require('sharp');

module.exports = {
  path: '/colour',
  info: 'Get a preview of a color (hex param without #)',
  type: 'get',
  params: ["hex", true],
  category: "image",

  async execute(req, res) {
    try {
      sharp({
        create: {
          width: 200,
          height: 200,
          channels: 4,
          background: req.query['hex'] ? '#'+req.query['hex'] : '#f00'
        }
      })
        .jpeg()
        .toBuffer()
        .then(data => {
          res.set('Content-Type', 'image/jpeg');
          res.send(data);
        })
    } catch(err) {
      res.error('Could not generate')
      return;
    }
  }
}