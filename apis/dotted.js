const sharp = require('sharp');

module.exports = {
  path: '/dotted',
  info: 'Turn an image into a dotted brightness representation',
  type: 'post',
  params: [
    {
      name: 'size',
      required: false,
      default: '6'
    }
  ],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    let Chunk = Math.floor(Number(req.query.size))||6;
    if (Chunk<=0) {
      res.error('Size must be greater than 0');
      return;
    }

    let image = sharp(req.body);
    let metadata = await image.metadata();
    let { data, info } = await image
      .resize({
        width: Math.ceil(metadata.width/Chunk),
        height: Math.ceil(metadata.height/Chunk),
        fit: 'fill'
      })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let inner = '';

    for (let y=0; y<info.height; y++) {
      for (let x=0; x<info.width; x++) {
        let radius = (1-data[y*info.width+x]/255)*Math.SQRT2*Chunk/2;
        if (radius<=0) continue;
        inner += `<circle cx="${x*Chunk+Chunk/2}" cy="${y*Chunk+Chunk/2}" r="${radius}" fill="black"/>`;
      }
    }

    let dots = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(metadata.width/Chunk)*Chunk}" height="${Math.ceil(metadata.height/Chunk)*Chunk}">
  <rect width="100%" height="100%" fill="white"/>
  ${inner}
</svg>`))
      .toBuffer()
      .then(outputBuffer=>{
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        });
      })
      .catch((err)=>{
        console.log(err)
        res.error('Could not generate', 500);
        return;
      });
  }
}