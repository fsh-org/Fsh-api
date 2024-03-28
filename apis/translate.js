let { translate } = require('@vitalets/google-translate-api')

module.exports = {
  path: '/translate',
  info: 'Transalte text to a language',
  type: 'get',
  params: ['text', true, 'lang', true],
  category: "text",

  async execute(req, res) {
    if (!req.query['text'] || !req.query['lang']) {
      res.json({
        err: true,
        msg: 'You must include both text and lang params'
      })
      return;
    }

    let trans;
    try {
      trans = await translate(req.query['text'], { to: req.query['lang'] });
    } catch (err) {
      res.json({
        err: true,
        msg: 'Could not translate'
      })
      return;
    }
    
    res.json({
      text: trans.text,
      source: trans.raw.src
    })
  }
}