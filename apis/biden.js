const sharp = require('sharp');

module.exports = {
  path: '/biden',
  info: 'Make Joe Biden say anything',
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
    let svg = `<svg style="width: 555px; height: 120px;"><text y="41" font-family="Arial" font-size="12px" fill="#000"><tspan x="60" dy="0px">${text.split('\\n').join('</tspan><tspan x="60" dy="10px">')}</tspan></text></svg>`;

    sharp('effects/biden.png')
      .composite([{
        input: Buffer.from(svg),
        gravity: 'northwest',
      }])
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(() => {
        res.error('Could not generate')
        return;
      })
  }
}