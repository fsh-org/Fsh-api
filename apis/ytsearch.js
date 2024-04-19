const yts = require('yt-search')

module.exports = {
  path: '/ytsearch',
  info: 'Search youtube',
  type: 'get',
  params: ['query', true],
  category: "text",
  
  async execute(req, res) {
    if (!req.query['query']) {
      res.json({
        err: true,
        msg: 'Include query'
      })
      return;
    }
    const r = await yts(req.query['query'])

    res.json(r)
  }
}