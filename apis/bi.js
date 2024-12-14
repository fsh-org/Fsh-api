const sharp = require('sharp');

module.exports = {
  path: '/bi',
  info: 'Bi overlay on a image',
  type: 'post',
  params: [],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .metadata()
      .then(data => {
        sharp('effects/bi.png')
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
        res.error('Could not generate', 500);
        return;
      })
  }
}