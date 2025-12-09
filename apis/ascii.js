const sharp = require('sharp');

module.exports = {
  path: '/ascii',
  info: 'Turn a image into ascii',
  type: 'post',
  params: [],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }

    let image = sharp(req.body);

    let { width, height } = await image
      .metadata()
      .catch(() => {
        res.error('Could not read');
        return;
      });

    let w = width;
    let h = height;
    let f = 1;
    let s = 8;
    if ((w*h) > 20000) {
      f = Math.sqrt(20000 / (w*h));
    }
    w = Math.floor(w*f);
    h = Math.floor(h*f);

    let { data } = await image
      .resize(w, h, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const chars = '@%#*+=-:. ';
    const charMult = chars.length - 1;

    let asciiArt = `<svg xmlns="http://www.w3.org/2000/svg" width="${w*s}" height="${(h-1)*s}"><rect width="100%" height="100%" fill="#fff"/>`;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let idx = (y * w + x) * 3;

        let brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        asciiArt += `<text x="${x*s}" y="${y*s}" font-family="Arial" font-size="${s*1.2}" fill="black">${chars[Math.floor(brightness / 255 * charMult)]}</text>`;
      }
    }
    asciiArt += '</svg>';

    sharp(Buffer.from(asciiArt))
      .png()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      });
  }
}