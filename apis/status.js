module.exports = {
  path: '/status',
  info: 'Returns a status code',
  type: 'get',
  params: [
    {
      name: 'status',
      required: true,
      default: '202'
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['status']) {
      res.error('Include a status');
      return;
    }
    try {
      res.status(Number(req.query['status'] ?? 400));
    } catch (err) {
      res.status(400);
    }
    res.json({
      status: Number(req.query['status'] ?? 400)
    })
  }
}
