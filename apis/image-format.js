const sharp = require('sharp');
const rewrites = {
  jpg: 'jpeg',
  jfif: 'jpeg',
  'jpg-large': 'jpeg',
  apng: 'png'
};
const rewritesKeys = Object.keys(rewrites);

module.exports = {
  path: '/image-format',
  info: 'Change the format of a image',
  type: 'post',
  params: [],
  category: "image",

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    if (!req.query['format']) {
      res.error('Include a format');
      return;
    }
    let format = req.query['format'];
    format = format.toLowerCase().trim();
    if (rewritesKeys.includes(format)) {
      format = rewrites[format];
    }
    sharp(req.body)
      .toFormat(format)
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/'+format+';base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      })
  }
}