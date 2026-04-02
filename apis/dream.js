const sharp = require('sharp');

module.exports = {
  path: '/dream',
  info: 'Dreamify a image',
  type: 'post',
  params: [],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    sharp(req.body)
      .metadata()
      .then(async(data) => {
        let vignette = Buffer.from(`<svg width="${data.width}" height="${data.height}">
  <radialGradient id="g" cx="50%" cy="50%" r="70%">
    <stop offset="65%" stop-color="rgba(0,0,0,0)" />
    <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
  </radialGradient>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#g)" />
</svg>`);
        sharp(req.body)
          .linear([1.1, 0.95, 0.9], [5, 5, 5])
          .gamma(1.2)
          .modulate({
            saturation: 1.25,
            lightness: 2.5
          })
          .blur(3)
          .composite([
            { input: vignette, blend: 'multiply' }
          ])
          .toBuffer()
          .then(outputBuffer => {
            res.json({
              image: 'data:image/png;base64,' + outputBuffer.toString('base64')
            });
          });
      })
      .catch((err) => {
        res.error('Could not generate'+err, 500);
        return;
      });
  }
}