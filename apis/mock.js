module.exports = {
  path: '/mock',
  info: 'Convert text to a mock version',
  type: 'get',
  params: ["text", true],
  category: "text",
  
  async execute(req, res) {
    if (!req.query['text']) {
      res.json({
        err: true,
        msg: 'Missing text param'
      })
      return;
    }
    let txt = req.query['text'];
    let gg = [];
    for (i in txt) {
      if ((Number(i)+1)%2 == 0) {
        gg.push(txt[i].toUpperCase())
      } else {
        gg.push(txt[i].toLowerCase())
      }
    }
    res.json({
      text: gg.join('')
    })
  }
}