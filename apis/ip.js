module.exports = {
  path: '/ip',
  info: 'Returns your ip address',
  type: 'get',
  params: [],
  category: "text",

  async execute(req, res) {
    res.json({
      ip: req.ip.replace('::ffff:',''),
      public: req.clientIp,
      cf: req.headers['cf-connecting-ip'] || 'None'
    })
  }
}