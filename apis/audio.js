const fs = require('fs');
const ytdl = require('ytdl-core');

module.exports = {
  path: '/audio',
  info: 'Download a youtube video into a mp3',
  type: 'get',
  params: ["id", true],
  category: "audio",

  async execute(req, res) {
    let id = req.query['id'];

    if (!id || !ytdl.validateID(id)) {
      res.error('Invalid id')
      return;
    }

    if (fs.existsSync(`images/audio/${id}.mp3`)) {
      res.json({
        audio: `https://api.fsh.plus/images/audio/${id}.mp3`,
        download: `https://api.fsh.plus/download/audio/${id}.mp3`
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
            audio: `https://api.fsh.plus/images/audio/${id}.mp3`,
            download: `https://api.fsh.plus/download/audio/${id}.mp3`
          })
        })
        .on('error', (error) => {
          res.error('Could not download')
        });
    } catch (err) {
      res.error('Could not download')
    }
  }
}