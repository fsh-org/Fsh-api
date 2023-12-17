const ytstream = require('yt-stream');
const fs = require('fs');

module.exports = {
  path: '/video',
  info: 'info',
  type: 'get',
  params: ["h", true],
  category: "hidden",
  
  async execute(req, res) {
        const stream = await ytstream.stream(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`, {
            quality: 'high',
            type: 'audioandvideo',
            highWaterMark: 1048576 * 32
        });
        stream.stream.pipe(fs.createWriteStream('images/video/some_song.mp4'));
        console.log(stream.video_url);
        console.log(stream.url);
  }
}