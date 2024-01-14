const fs = require('fs');
const ytdl = require('ytdl-core');

module.exports = {
  path: '/video',
  info: 'Download a youtube video into a mp4',
  type: 'get',
  params: ["id", true],
  category: "image",

  async execute(req, res) {
    let id = req.query['id'];

    if (!id || !ytdl.validateID(id)) {
      res.json({
        err: true,
        msg: 'Invalid id'
      })
      return;
    }

    if (fs.existsSync(`images/video/${id}.mp4`)) {
      res.json({
        video: `https://api.fsh.plus/images/video/${id}.mp4`
      })
      return;
    }

    let downloadOptions = {
      quality: 'highest',
      filter: 'audioandvideo'
    };
    let videoUrl = 'https://www.youtube.com/watch?v='+id;
    try {
      let info = await ytdl.getInfo(videoUrl)
      ytdl.downloadFromInfo(info, downloadOptions)
        .pipe(fs.createWriteStream(`images/video/${id}.mp4`))
        .on('finish', () => {
          res.json({
            video: `https://api.fsh.plus/images/video/${id}.mp4`
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