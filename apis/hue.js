const sharp = require('sharp');

module.exports = {
  path: '/hue',
  info: 'Change the hue (0-360) of a image (pass image in body)',
  type: 'post',
  params: [
    {
      name: 'hue',
      required: true,
      default: '180'
    }
  ],
  category: 'image',

  async execute(req, res) {
    if (!req.query['hue']) {
      res.error('You must include a hue param (0-360)');
      return;
    }
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .modulate({ hue: Number(req.query['hue']) })
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
  }
}