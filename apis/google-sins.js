const sharp = require('sharp');

module.exports = {
  path: '/google-sins',
  info: 'Search for something unforgivable',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'fsh'
    }
  ],
  category: "image",

  async execute(req, res) {
    if (!req.query['text']) {
      res.error('You must include text');
      return;
    }
    let text = req.query['text'];
    let svg = `<svg style="width:670px;height:150px;"><text x="0" y="36" font-family="Arial" font-size="45px" fill="#000"><tspan x="0" dy="0px">${text.split('\\n').join('</tspan><tspan x="0" dy="40px">')}</tspan></text></svg>`;

    sharp('effects/google-sins.jpg')
      .composite([{
        input: Buffer.from(svg),
        gravity: 'southeast'
      }])
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        });
      })
      .catch((err) => {
        console.log(err);
        res.error('Could not generate');
        return;
      });
  }
}