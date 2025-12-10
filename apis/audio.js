const fs = require('node:fs');
const path = require('node:path');

// Youtube
const ytdl = require('@distube/ytdl-core');
function isYT(id) {
 return ytdl.validateID(id);
}

// Newgrounds
let ngcache = new Map();
function isNG(id) {
  return (/^[0-9]+$/).test(id);
}

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


    if (isYT(id)) {
      if (fs.existsSync(path.resolve('images/audio', `${id}.mp3`))&&fs.statSync(path.resolve('images/audio', `${id}.mp3`)).size!==0) {
        res.json({
          audio: `https://api.fsh.plus/images/audio/${id}.mp3`,
          download: `https://api.fsh.plus/download/audio/${id}.mp3`
        });
        return;
      }
      try {
        let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
        ytdl.downloadFromInfo(info, { quality: 'highest', filter: 'audio' })
          .pipe(fs.createWriteStream(path.resolve('images/audio', `${id}.mp3`)))
          .on('finish', ()=>{
            if (fs.statSync(path.resolve('images/audio', `${id}.mp3`)).size===0) {
              res.error('Could not download', 500);
              fs.unlink(path.resolve('images/audio', `${id}.mp3`));
              return;
            }
            res.json({
              audio: `https://api.fsh.plus/images/audio/${id}.mp3`,
              download: `https://api.fsh.plus/download/audio/${id}.mp3`
            });
          })
          .on('error', ()=>{
            res.error('Could not download', 500);
          });
      } catch(err) {
        console.log(err);
        res.error('Could not download', 500);
      }
    } else if (isNG(id)) {
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