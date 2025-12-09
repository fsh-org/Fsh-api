module.exports = {
  path: '/ip',
  info: 'Returns your ip address',
  type: 'get',
  params: [],
  category: 'text',

  async execute(req, res) {
    res.json({
      ip: req.pip.replace('::ffff:','')??req.headers['cf-connecting-ip']??req.ip
    });
  }
}