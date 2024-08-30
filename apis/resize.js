const sharp = require('sharp');

module.exports = {
  path: '/resize',
  info: 'Resizes a image',
  type: 'post',
  params: [
    {
      name: 'width',
      required: true,
      default: '128'
    },
    {
      name: 'height',
      required: true,
      default: '128'
    }
  ],
  category: "image",
  
  async execute(req, res) {
    if (!req.query['width'] || !req.query['height']) {
      res.error('You must specify a width and height to resize to')
      return;
    }
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body')
      return;
    }
    sharp(req.body)
      .resize(Number(req.query['width']), Number(req.query['height']))
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(err => {
        res.error('Could not generate')
        return;
      })
  }
}