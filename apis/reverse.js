module.exports = {
  path: '/reverse',
  info: 'Reverses a string',
  type: 'get',
  params: ['text', true],
  category: "text",

  async execute(req, res) {
    if (!req.query['text']) {
      res.error('You must include text param')
      return;
    }
    res.json({
      text: req.query['text'].split('').reverse().join('')
    })
  }
}