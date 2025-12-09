const sharp = require('sharp');

module.exports = {
  path: '/wanted',
  info: 'Wanted poster image insert',
  type: 'post',
  params: [],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .resize(200, 200)
      .toBuffer()
      .then(buff => {
        sharp('effects/wanted.png')
          .composite([
            { input: buff, gravity: 'center', top: 110, left: 53 }
          ])
          .toBuffer()
          .then(outputBuffer => {
            res.json({
              image: 'data:image/png;base64,' + outputBuffer.toString('base64')
            })
          })
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      })
  }
}