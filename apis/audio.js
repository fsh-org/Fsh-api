const fs = require('fs');
const ytdl = require('ytdl-core');

module.exports = {
  path: '/audio',
  info: 'Download a youtube video into a mp3',
  type: 'get',
  params: ["id", true],
  category: "image",

  async execute(req, res) {
    let id = req.query['id'];

    if (!ytdl.validateID(id)) {
      res.json({
        err: true,
        msg: 'Invalid id'
      })
      return;
    }

    let downloadOptions = {
      quality: 'highest',
      filter: 'audio'
    };
    let videoUrl = 'https://www.youtube.com/watch?v='+id;
    try {
      let info = await ytdl.getInfo(videoUrl)
      ytdl.downloadFromInfo(info, downloadOptions)
        .pipe(fs.createWriteStream(`images/audio/${id}.mp3`))
        .on('finish', () => {
          res.json({
            audio: `https://api.fsh.plus/images/audio/${id}.mp3`
          })
        })
        .on('error', (error) => {
          res.json({
            err: true,
            msg: 'Could not download'
          })
        });
    } catch (err) {
      res.json({
        err: true,
        msg: 'Could not download'
      })
    }
  }
}