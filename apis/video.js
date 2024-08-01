const fs = require('fs');
const ytdl = require('@distube/ytdl-core');

module.exports = {
  path: '/video',
  info: 'Download a youtube video into a mp4',
  type: 'get',
  params: ['id', true, 'max', false],
  category: "image",

  async execute(req, res) {
    let id = req.query['id'];

    if (!id || !ytdl.validateID(id)) {
      res.error('Invalid id')
      return;
    }

    if (fs.existsSync(`images/video/${id}.mp4`)) {
      res.json({
        video: `https://api.fsh.plus/images/video/${id}.mp4`,
        download: `https://api.fsh.plus/download/video/${id}.mp4`
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
          if (req.query['max']?.length) {
            let stats = fs.statSync(`images/video/${id}.mp4`);
            if (stats.size > (Number(req.query['max'])||25000000)) {
              downloadOptions.quality = 'lowest';
              ytdl.downloadFromInfo(info, downloadOptions)
                .pipe(fs.createWriteStream(`images/video/${id}_low.mp4`))
                .on('finish', () => {
                  let stats2 = fs.statSync(`images/video/${id}_low.mp4`);
                  if (stats2.size > (Number(req.query['max'])||25000000)) {
                    res.json({
                      err: true,
                      msg: 'Video bigger than allowed, see full at https://api.fsh.plus/images/video/'+id+'.mp4',
                      full: `https://api.fsh.plus/images/video/${id}.mp4`
                    })
                    return;
                  }
                  res.json({
                    video: `https://api.fsh.plus/images/video/${id}_low.mp4`,
                    download: `https://api.fsh.plus/download/video/${id}_low.mp4`,
                    lower: true,
                    full: `https://api.fsh.plus/images/video/${id}.mp4`
                  })
                  return;
                })
            } else {
              res.json({
                video: `https://api.fsh.plus/images/video/${id}.mp4`,
                download: `https://api.fsh.plus/download/video/${id}.mp4`
              })
            }
          } else {
            res.json({
              video: `https://api.fsh.plus/images/video/${id}.mp4`,
              download: `https://api.fsh.plus/download/video/${id}.mp4`
            })
          }
        })
        .on('error', (error) => {
          res.error('Could not download')
        });
    } catch (err) {
      res.error('Could not download')
    }
  }
}