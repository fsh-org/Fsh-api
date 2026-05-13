const SamJs = require('sam-js');

let sam = new SamJs();

module.exports = {
  path: '/sam',
  info: 'Make SAM say anything',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    }
  ],
  category: 'audio',

  async execute(req, res) {
    let text = req.query['text'];
    if ((text ?? '').length < 1) {
      res.error('You must include text');
      return;
    }

    const audiobuffer = sam.wav(text);

    res.json({
      audio: `data:audio/wav;base64,${Buffer.from(audiobuffer).toString('base64')}`
    });
  }
}