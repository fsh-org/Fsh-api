const sharp = require('sharp');

module.exports = {
  path: '/sepia',
  info: 'Sepia a image (pass image in body)',
  type: 'post',
  params: [],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .recomb([
        [0.3588, 0.7044, 0.1368],
        [0.2990, 0.5870, 0.1140],
        [0.2392, 0.4696, 0.0912]
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
      });
  }
}