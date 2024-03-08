module.exports = {
  path: '/status',
  info: 'Returns a status code',
  type: 'get',
  params: ['status', true],
  category: "hidden",
  
  async execute(req, res) {
    if (!req.query['status']) {
      res.status(400)
      res.json({
        err: true,
        msg: 'include a status'
      })
    }
    try {
    res.status(Number(req.query['status'])||400)
    } catch (err) {res.status(400)}
    res.json({status:Number(req.query['status'])||400})
  }
}