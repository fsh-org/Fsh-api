module.exports = {
  path: '/ip',
  info: 'Returns your ip address',
  type: 'get',
  params: [],
  category: "text",
  execute(req, res){
    // don't abuse pls
    res.json({
      ip: req.ip.replace('::ffff:',''),
      public: req.clientIp,
      cf: req.headers['cf-connecting-ip'] || 'None'
    })
  }
}