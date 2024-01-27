module.exports = {
  path: '/ip',
  info: 'Returns your ip address',
  type: 'get',
  params: [],
  category: "text",
  execute(req, res){
    // don't abuse req.ip pls
    res.send(`{"ip":"${req.ip.replace('::ffff:','')}"}`)
  }
}