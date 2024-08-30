let { translate } = require('@vitalets/google-translate-api')

module.exports = {
  path: '/translate',
  info: 'Transalte text to a language',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    },
    {
      name: 'lang',
      required: true,
      default: 'es'
    }
  ],
  category: "text",

  async execute(req, res) {
    if (!req.query['text'] || !req.query['lang']) {
      res.error('You must include both text and lang params')
      return;
    }

    let trans;
    try {
      trans = await translate(req.query['text'], { to: req.query['lang'] });
    } catch (err) {
      res.error('Could not translate', 500)
      return;
    }
    
    res.json({
      text: trans.text,
      source: trans.raw.src
    })
  }
}