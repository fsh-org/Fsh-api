const fs = require('node:fs');
const path = require('node:path');

// Youtube
const ytdl = require('@distube/ytdl-core');
const YTDLAgent = ytdl.createAgent(JSON.parse(process.env.ytdl??'[]'));
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
  path: '/video',
  info: 'Download a video from: youtube, newgrounds',
  type: 'get',
  params: [
    {
      name: 'id',
      required: true,
      default: 'dQw4w9WgXcQ'
    }
  ],
  category: 'image',

  async execute(req, res) {
    let id = req.query['id'];
    if (!id) {
      res.error('Provide an id');
      return;
    }

    id = id.toString().replaceAll(/[^a-zA-Z0-9_-]/g,'');

    if (isYT(id)) {
      if (fs.existsSync(path.resolve('images/video', `${id}.mp4`))&&fs.statSync(path.resolve('images/video', `${id}.mp4`)).size!==0) {
        res.json({
          video: `https://api.fsh.plus/images/video/${id}.mp4`,
          download: `https://api.fsh.plus/download/video/${id}.mp4`
        });
        return;
      }
      try {
        let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`, { agent: YTDLAgent });
        ytdl.downloadFromInfo(info, { quality: 'highest', filter: 'audioandvideo', agent: YTDLAgent })
          .pipe(fs.createWriteStream(path.resolve('images/video', `${id}.mp4`)))
          .on('finish', ()=>{
            if (fs.statSync(path.resolve('images/video', `${id}.mp4`)).size===0) {
              res.error('Could not download', 500);
              fs.unlink(path.resolve('images/video', `${id}.mp4`));
              return;
            }
            res.json({
              video: `https://api.fsh.plus/images/video/${id}.mp4`,
              download: `https://api.fsh.plus/download/video/${id}.mp4`
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
          video: ngcache.get(id),
          download: ngcache.get(id)
        });
        return;
      }
      fetch(`https://www.newgrounds.com/portal/video/${id}`, {
        headers: {
          'x-requested-with': 'XMLHttpRequest'
        }
      })
        .then(ng=>ng.json())
        .then(ng=>{
          let highest = Object.keys(ng.sources).map(k=>k.replace('p','')).toSorted((a,b)=>b-a)[0]+'p';
          if (ng.sources[highest].length>1) ng.sources[highest].sort((a,b)=>(b.type==='video/mp4')-(a.type==='video/mp4'));
          ngcache.set(id, ng.sources[highest][0].src);
          res.json({
            video: ng.sources[highest][0].src,
            download: ng.sources[highest][0].src
          });
        })
        .catch(err=>{
          res.error('Could not download', 500);
        });
    }
  }
}