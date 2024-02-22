const sharp = require('sharp');

module.exports = {
  path: '/deepfry',
  info: 'Deepfry a image',
  type: 'post',
  params: [],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.json({
        err: true,
        msg: 'You must pass a image in the request body'
      })
      return;
    }
    sharp(req.body)
      .modulate({ brightness: 5, saturation: 5, gamma: 2 })
      .tint('red')
      .blur(2)
      .sharpen()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(err => {
        res.json({
          err: true,
          msg: 'Could not generate'
        })
        return;
      })
  }
}