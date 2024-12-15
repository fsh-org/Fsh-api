const sharp = require('sharp');

module.exports = {
  path: '/blur',
  info: 'Blur a image (pass image in body)',
  type: 'post',
  params: [
    {
      name: 'force',
      required: false,
      default: '8'
    }
  ],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    if (Number(req.query['force']) > 1000) {
      res.error('Force too big');
      return;
    }
    if (Number(req.query['force']) < 1) {
      res.error('Force too small');
      return;
    }
    sharp(req.body)
      .blur(Number(req.query['force']) || 8)
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