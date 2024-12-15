const sharp = require('sharp');

module.exports = {
  path: '/colour',
  info: 'Get a preview of a color (hex param without #)',
  type: 'get',
  params: [
    {
      name: 'hex',
      required: true,
      default: 'ff00ff'
    }
  ],
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
          res.type('image/jpeg').send(data);
        })
    } catch(err) {
      res.error('Could not generate')
      return;
    }
  }
}