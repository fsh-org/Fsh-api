const yts = require('yt-search')

module.exports = {
  path: '/ytsearch',
  info: 'Search youtube',
  type: 'get',
  params: [
    {
      name: 'query',
      required: true,
      default: 'low quality fish funky town'
    }
  ],
  category: "text",
  
  async execute(req, res) {
    if (!req.query['query']) {
      res.error('Include query')
      return;
    }
    const r = await yts(req.query['query'])

    res.json(r)
  }
}