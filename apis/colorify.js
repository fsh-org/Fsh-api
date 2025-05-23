const sharp = require('sharp');

module.exports = {
  path: '/colorify',
  info: 'Overlay a color on a image (color must be in hex, no #)',
  type: 'post',
  params: [
    {
      name: 'hex',
      required: true,
      default: 'ff00ff'
    }
  ],
  category: "image",

  async execute(req, res) {
    if (!req.query['hex']) {
      res.error('You must include a hex param (no #)');
      return;
    }
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .metadata()
      .then(data => {
        sharp({
          create: {
            width: data.width,
            height: data.height,
            channels: 4,
            background: req.query['hex'] ? '#'+req.query['hex'] : '#f00'
          }
        })
          .png()
          .toBuffer()
          .then(buff => {
            sharp(req.body)
              .composite([
                { input: buff, gravity: 'center', blend: 'screen' }
              ])
              .toBuffer()
              .then(outputBuffer => {
                res.json({
                  image: 'data:image/png;base64,' + outputBuffer.toString('base64')
                })
              })
              .catch(() => {
                res.error('Could not generate', 500);
                return;
              })
          })
          .catch(() => {
            res.error('Could not create color layer', 500);
            return;
          })
      })
      .catch(() => {
        res.error('Could not read image', 500);
        return;
      })
  }
}