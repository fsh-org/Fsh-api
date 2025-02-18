const fs = require("fs")
const path = require("path")

module.exports = {
  path: '/meme',
  info: 'Sends random fsh meme',
  type: 'get',
  params: [],
  category: "image",

  async execute(req, res) {
    fs.readdir('meme', async (err, files) => {
      let x = Math.floor(Math.random() * files.length);
      res.json({
        link: `https://api.fsh.plus/meme/${files[x]}`
      })
    })
  }
}