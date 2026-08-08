const sharp = require('sharp');

module.exports = {
  path: '/caution',
  info: 'Put text on a caution sign',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'fsh'
    }
  ],
  category: 'image',

  async execute(req, res) {
    if (!req.query['text']) {
      res.error('You must include text');
      return;
    }
    let text = req.query['text'];
    let svg = `<svg style="width:1450px;height:950px;"><text y="400" font-family="Arial" font-size="50px" fill="#000"><tspan x="60" dy="0px">${text.split('\\n').join('</tspan><tspan x="60" dy="60px">')}</tspan></text></svg>`;

    sharp('effects/caution.png')
      .composite([{
        input: Buffer.from(svg),
        gravity: 'northwest'
      }])
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        });
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      })
  }
}