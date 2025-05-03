const QRCode = require('qrcode');

module.exports = {
  path: '/qr',
  info: 'Generate a qr code',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'fshy'
    }
  ],
  category: "image",

  async execute(req, res) {
    let txt = req.query['text'];
    if (!txt) {
      res.error('Missing text param')
      return;
    }
    QRCode.toDataURL(txt, function(err, url) {
      if (err) {
        res.error('Could not generate', 500);
        return;
      }
      res.json({
        qr: url
      });
    })
  }
}