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

    let downloadOptions = {
      quality: 'highest',
      filter: 'audioandvideo'
    };
    let videoUrl = 'https://www.youtube.com/watch?v='+id
    ytdl(videoUrl, downloadOptions)
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
  }
}