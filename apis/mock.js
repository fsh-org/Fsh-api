module.exports = {
  path: '/mock',
  info: 'Convert text to a mock version',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'fshy'
    }
  ],
  category: 'text',

  async execute(req, res) {
    let txt = req.query['text'];
    if (!txt) {
      res.error('Missing text param');
      return;
    }
    let gg = [];
    for (i in txt) {
      if ((Number(i)+1)%2 == 0) {
        gg.push(txt[i].toUpperCase());
      } else {
        gg.push(txt[i].toLowerCase());
      }
    }
    res.json({
      text: gg.join('')
    });
  }
}