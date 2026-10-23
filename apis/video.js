const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { spawn } = require('node:child_process');
const ffmpegPath = require('ffmpeg-static');

// Youtube
const { Ytdl, parseVideoId, Quality, chooseFormat } = require('@distube/ytdl-core');
const yt = new Ytdl(process.env.ytdl?{ cookie: process.env.ytdl }:{});
let YTNameCache = new Map();

// Newgrounds
let ngcache = new Map();

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

    if (parseVideoId(id)) {
      let videoPath = path.resolve('images', 'video', `${id}.mp4`);
      if (fs.existsSync(videoPath)&&fs.statSync(videoPath).size!==0) {
        res.json({
          video: `https://api.fsh.plus/images/video/${id}.mp4`,
          download: `https://api.fsh.plus/download/video/${id}.mp4${YTNameCache.has(id)?'?title='+YTNameCache.get(id):''}`
        });
        return;
      }
      try {
        let info = await yt.getInfo(`https://www.youtube.com/watch?v=${id}`);
        let title = encodeURIComponent(`${info.videoDetails.title} - ${info.videoDetails.author.name.replace(' - Topic','')}.mp4`);
        YTNameCache.set(id, title);

        // Get video, download, check
        let videoFormat = chooseFormat(info.formats, {
          quality: Quality.HighestVideo,
          filter: { hasVideo: true }
        });
        if (!videoFormat) {
          res.error('Could not get video', 500);
          return;
        }
        let rawVideoPath = path.resolve('images', 'video', `${id}_raw.mp4`);
        await pipeline(
          yt.download(info, { format: videoFormat }),
          fs.createWriteStream(rawVideoPath)
        );
        if (fs.statSync(rawVideoPath).size===0) {
          res.error('Could not download video', 500);
          fs.unlinkSync(rawVideoPath);
          return;
        }

        // Get audio, download
        let audioFormat = null;
        let audioPath = null;
        if (!videoFormat.hasAudio) {
          audioFormat = chooseFormat(info.formats, {
            quality: Quality.HighestAudio,
            filter: { hasAudio: true, hasVideo: false }
          });
          audioPath = path.resolve('images', 'audio', `${id}.mp3`);
          if (!fs.existsSync(audioPath)) await pipeline(
            yt.download(info, { format: audioFormat }),
            fs.createWriteStream(audioPath)
          );
        }

        if (audioFormat) {
          fs.renameSync(rawVideoPath, videoPath);
          res.json({
            video: `https://api.fsh.plus/images/video/${id}.mp4`,
            download: `https://api.fsh.plus/download/video/${id}.mp4?title=${title}`
          });
          return;
        }

        // Mux them
        let ffmpeg = spawn(ffmpegPath, [
          '-y',
          '-i', rawVideoPath, '-i', audioPath,
          '-map', '0:v:0', '-map', '1:a:0',
          '-c', 'copy', '-shortest', videoPath
        ]);

        ffmpeg.on('close', (code)=>{
          fs.unlinkSync(rawVideoPath);
          if (code!==0) {
            res.error('Could not mux', 500);
            return;
          }
          res.json({
            video: `https://api.fsh.plus/images/video/${id}.mp4`,
            download: `https://api.fsh.plus/download/video/${id}.mp4?title=${title}`
          });
        });
      } catch(err) {
        console.log(err);
        res.error('Could not get', 500);
      }
    } else if ((/^[0-9]+$/).test(id)) {
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