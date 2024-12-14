const sharp = require('sharp');

module.exports = {
  path: '/ad',
  info: 'Make image into ad',
  type: 'post',
  params: [],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
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
        res.error('Could not generate', 500);
        return;
      })
  }
}