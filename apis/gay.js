const sharp = require('sharp');

module.exports = {
  path: '/gay',
  info: 'Gay overlay on a image',
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
      .then(data => {
        sharp('effects/gay.png')
          .resize(data.width, data.height)
          .toBuffer()
          .then(buff => {
            sharp(req.body)
            .composite([
              { input: buff, gravity: 'center', blend: 'screen' }
            ])
            .toBuffer()
            .then(outputBuffer => {
              res.json({
                image: 'data:image/png;base64,' + outputBuffer.toString('base64')
              })
            })
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