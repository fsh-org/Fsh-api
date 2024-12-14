const sharp = require('sharp');

module.exports = {
  path: '/gun',
  info: 'Gun overlay on a image',
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
        sharp('effects/gun.png')
          .resize(Math.ceil(data.width/2), Math.ceil(data.height/2))
          .toBuffer()
          .then(buff => {
            sharp(req.body)
              .composite([
                { input: buff, gravity: 'southeast' }
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