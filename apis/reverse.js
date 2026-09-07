module.exports = {
  path: '/reverse',
  info: 'Reverses a string',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    }
  ],
  category: 'text',

  async execute(req, res) {
    let text = req.query['text'];
    if (!text) {
      res.error('You must include the text param');
      return;
    }
    text = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)]
      .map(s=>s.segment)
      .reverse()
      .join('');
    res.json({ text });
  }
}