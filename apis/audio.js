const fs = require('node:fs');
const path = require('node:path');

// Youtube
const { Ytdl, parseVideoId, Quality } = require('@distube/ytdl-core');
const yt = new Ytdl(process.env.ytdl?{ cookie: process.env.ytdl }:{});
let YTNameCache = new Map();

// Newgrounds
let ngcache = new Map();

// Main
module.exports = {
  path: '/audio',
  info: 'Download an audio from: youtube, newgrounds',
  type: 'get',
  params: [
    {
      name: 'id',
      required: true,
      default: 'dQw4w9WgXcQ'
    }
  ],
  category: 'audio',

  async execute(req, res) {
    let id = req.query['id'];
    if (!id) {
      res.error('Provide an id');
      return;
    }

    id = id.toString().replaceAll(/[^a-zA-Z0-9_-]/g,'');

    if (parseVideoId(id)) {
      let audioPath = path.resolve('images', 'audio', `${id}.mp3`);
      if (fs.existsSync(audioPath)&&fs.statSync(audioPath).size!==0) {
        res.json({
          audio: `https://api.fsh.plus/images/audio/${id}.mp3`,
          download: `https://api.fsh.plus/download/audio/${id}.mp3${YTNameCache.has(id)?'?title='+YTNameCache.get(id):''}`
        });
        return;
      }
      try {
        let info = await yt.getInfo(`https://www.youtube.com/watch?v=${id}`);
        yt.download(info, { quality: Quality.HighestAudio, filter: { hasAudio: true, hasVideo: false } })
          .pipe(fs.createWriteStream(audioPath))
          .on('finish', ()=>{
            if (fs.statSync(audioPath).size===0) {
              res.error('Could not download file', 500);
              fs.unlinkSync(audioPath);
              return;
            }
            let title = encodeURIComponent(`${info.videoDetails.title} - ${info.videoDetails.author.name.replace(' - Topic','')}.mp3`);
            YTNameCache.set(id, title);
            res.json({
              audio: `https://api.fsh.plus/images/audio/${id}.mp3`,
              download: `https://api.fsh.plus/download/audio/${id}.mp3?title=${title}`
            });
          })
          .on('error', ()=>{
            res.error('Could not download', 500);
          });
      } catch(err) {
        console.log(err);
        res.error('Could not get', 500);
      }
    } else if ((/^[0-9]+$/).test(id)) {
      if (ngcache.has(id)) {
        res.json({
          audio: ngcache.get(id),
          download: ngcache.get(id)
        });
        return;
      }
      fetch(`https://www.newgrounds.com/audio/listen/${id}`)
        .then(ng=>ng.text())
        .then(ng=>{
          let url = ng.match(/<meta property="og:audio" content="(https:\/\/audio\.ngfiles\.com\/[0-9]+\/[0-9]+?_.+?\[a-zA-Z0-9]+?.\?[a-zA-Z0-9]+?)">/)[1];
          ngcache.set(id, url);
          res.json({
            audio: url,
            download: url
          });
        })
        .catch(err=>{
          res.error('Could not download', 500);
        });
    }
  }
}