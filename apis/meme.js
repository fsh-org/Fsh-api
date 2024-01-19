const fs = require("fs")
const path = require("path")

module.exports = {
  path: '/meme',
  info: 'Sends random fsh meme',
  type: 'get',
  params: [],
  category: "image",
  execute(req, res){
    if (req.query["a"] == null) {
      fs.readdir('meme', async (err, files) => {
        let x = Math.floor(Math.random() * files.length);
        res.send(`{"link":"https://api.fsh.plus/meme?a=${files[x]}"}`)
      });
    } else {
      if (req.query["a"].includes("..")) {
        res.status(400)
        res.send("no");
        return;
      }
      try {
        res.sendFile(path.join(__dirname, `../meme/${req.query["a"]}`))
      } catch (err) {
        res.status(400)
        res.send("err")
      }
    }
  }
}