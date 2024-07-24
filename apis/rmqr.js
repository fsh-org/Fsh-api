const sharp = require('sharp')

module.exports = {
  path: '/rmqr',
  info: 'Generate a rmqr image (long qr)',
  type: 'get',
  params: ['text', true, 'strategy', false, 'correction', false, 'size', false],
  category: "image",
  
  async execute(req, res) {
    if (!req.query['text']) {
      res.send('Mini docs<br>text - data to encode<br>strategy - balanced, height or width<br>correction - auto, m (medium 15%) or h (high 30%)')
      return;
    }
    let size = (Number(req.query['size']) || 8) + 0;
    let strategy = req.query['strategy'] || 'balanced';
    if (!['balanced','height','width'].includes(strategy)) {
      res.error('Unknown strategy');
      return;
    }
    strategy = {balanced: 'balanced', height: 'minimize_height', width: 'minimize_width'}[strategy];
    let correction = req.query['correction'] || 'auto';
    if (!['auto','m','h'].includes(correction)) {
      res.error('Unknown correction level');
      return;
    }

    let data = await fetch('https://asia-northeast1-rmqr-generator.cloudfunctions.net/generate-rmqr-code', {
      method: 'POST',
      headers: {
        'user-agent': 'Fsh (Api - user: '+req.clientIp+')',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        text: req.query['text'],
        versionStrategy: strategy,
        errorCorrectionLevel: correction
      })
    });
    data = await data.json();

    let qr = new sharp(Buffer.from(data.qr.flat().map(p=>!p*255)), {
      raw: {
        width: data.width,
        height: data.height,
        channels: 1
      }
    })
      .png()
      .resize(data.width*size, data.height*size, {
        kernel: sharp.kernel.nearest
      })
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
  }
}