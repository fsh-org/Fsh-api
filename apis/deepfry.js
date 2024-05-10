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
      .metadata()
      .then(metadata => {
        let w = metadata.width;
        let h = metadata.height;
        sharp(req.body)
          .resize(Math.floor(w/2), Math.floor(h/2))
          .blur(1)
          .normalise({ lower: 20, upper: 80 })
          .modulate({ brightness: 1.5, saturation: 3, gamma: 1.5 })
          .tint('red')
          .convolve({
            width: 3,
            height: 3,
            kernel: [
              0, -1, 0,
              -1, 5, -1,
              0, -1, 0
            ]
          })
          .sharpen()
          .toBuffer()
          .then(outputBuffer => {
            sharp(outputBuffer)
              .resize(w, h)
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
          })
          .catch(err => {
            res.json({
              err: true,
              msg: 'Could not generate'
            })
            return;
          })
      })
  }
}