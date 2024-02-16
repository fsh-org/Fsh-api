const sharp = require('sharp');

module.exports = {
  path: '/flip',
  info: 'Flip a image verticlly (pass image in body)',
  type: 'post',
  params: [],
  category: "image",

  async execute(req, res) {
    if (!req.body) {
      res.json({
        err: true,
        msg: 'You must pass a image in the request body'
      })
      return;
    }
    sharp(req.body)
      .flip()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
  }
}