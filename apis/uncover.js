const sharp = require('sharp');

module.exports = {
  path: '/uncover',
  info: 'Rick uncovers the image',
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
        sharp('effects/uncover.png')
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
        res.error('Could not generate', 500);
        return;
      })
  }
}