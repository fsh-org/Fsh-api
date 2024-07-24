const fs = require("fs")
const path = require("path")

module.exports = {
  path: '/meme',
  info: 'Sends random fsh meme',
  type: 'get',
  params: [],
  category: "image",

  async execute(req, res) {
    if (req.query["a"]) {
      if (req.query["a"].includes("..")) {
        res.error('no', 401)
        return;
      }
      try {
        res.sendFile(path.join(__dirname, `../meme/${req.query["a"]}`))
      } catch (err) {
        res.error('could not send image', 500)
      }
    } else {
      fs.readdir('meme', async (err, files) => {
        let x = Math.floor(Math.random() * files.length);
        res.json({
          link: "https://api.fsh.plus/meme?a="+files[x]
        })
      })
    }
  }
}