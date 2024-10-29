const sharp = require('sharp');

module.exports = {
  path: '/ascii',
  info: 'Turn a image into ascii',
  type: 'get',
  params: [],
  category: "image",
  
  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body')
      return;
    }

    let image = sharp(req.body);

    let { width, height } = await image.metadata();

    let w = width;
    let h = height;
    let f = 6;
    if ((w*h) > 1000000) {
      f = Math.ceil(1 / (1000000 / (w*h)))*6;
    }
    w = Math.floor(width/f);
    h = Math.floor(height/f);

    let { data } = await image
      .resize(w, h, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const chars = '@%#*+=-:. ';
    const charMult = chars.length - 1;

    let asciiArt = `<svg xmlns="http://www.w3.org/2000/svg" width="${w*f}" height="${(h-1)*f}"><rect width="100%" height="100%" fill="#fff"/>`;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let idx = (y * w + x) * 3;

        let brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        asciiArt += `<text x="${x*f}" y="${y*f}" font-family="monospace" font-size="${f*1.5}" fill="black">${chars[Math.floor(brightness / 255 * charMult)]}</text>`;
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
      .catch(err => {
        res.error('Could not generate')
        return;
      })
  }
}