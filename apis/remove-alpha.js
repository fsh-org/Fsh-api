const sharp = require('sharp');

module.exports = {
  path: '/remove-alpha',
  info: 'Remove alpha of a image',
  type: 'post',
  params: [],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .removeAlpha()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        });
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      });
  }
}