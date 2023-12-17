module.exports = {
  path: '/params',
  info: 'Private',
  type: 'get',
  params: ["file", true],
  category: "hidden",
  execute(req, res) {
    if (req.query["file"].includes("..")) return;
    try {
      let r = require(`${req.query["file"]}`)
      res.send(`${r.params}`)
    } catch (err) {
      return;
    }
  }
}