const sharp = require('sharp');

module.exports = {
  path: '/jail',
  info: 'Jail a image',
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
        sharp('effects/jail.png')
          .resize(data.width, data.height)
          .toBuffer()
          .then(buff => {
            sharp(req.body)
            .composite([
              { input: buff, gravity: 'center' }
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