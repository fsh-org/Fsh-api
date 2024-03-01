const sharp = require('sharp');

module.exports = {
  path: '/ad',
  info: 'Make image into ad',
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
      .resize(163,163)
      .toBuffer()
      .then(data => {
        sharp('effects/ad.png')
          .composite([
            { input: data, top: 58, left: 114 }
          ])
          .toBuffer()
          .then(outputBuffer => {
            res.json({
              image: 'data:image/png;base64,' + outputBuffer.toString('base64')
            }) 
          })
      })
      .catch(err => {
        console.log(err)
        res.json({
          err: true,
          msg: 'Could not generate'
        })
        return;
      })
  }
}