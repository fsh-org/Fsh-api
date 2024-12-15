const sharp = require('sharp');

module.exports = {
  path: '/invert',
  info: 'Inverts a image (pass image in body)',
  type: 'post',
  params: [],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .negate({ alpha: false })
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