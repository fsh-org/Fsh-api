const sharp = require('sharp');

module.exports = {
  path: '/pixelate',
  info: 'Pixelates a image (pass image in body)',
  type: 'post',
  params: ['force', false],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.json({
        err: true,
        msg: 'You must pass a image in the request body'
      })
      return;
    }
    let pixelSize = req.query['force'] || 10;
    sharp(req.body)
    .metadata()
    .then(metadata => {
      // Calculate the resized dimensions for pixelation
      const resizedWidth = Math.ceil(metadata.width / pixelSize);
      const resizedHeight = Math.ceil(metadata.height / pixelSize);
      
      // Pixelate the image
      sharp(req.body)
        .resize(resizedWidth, resizedHeight, {
          kernel: 'nearest'
        })
        .toBuffer()
        .then(outputBuffer => {
          sharp(outputBuffer)
            .resize(metadata.width, metadata.height, {
              kernel: 'nearest'
            })
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