const fs = require("fs");
const { getAudioBuffer } = require('simple-tts-mp3');

module.exports = {
  path: '/tts',
  info: 'Generates text to speach audio',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    },
    {
      name: 'lang',
      required: false,
      default: 'en'
    }
  ],
  category: "audio",
  
  async execute(req, res) {
    if (!req.query['text']) {
      res.error('Include text')
      return;
    }
    getAudioBuffer(req.query['text'], req.query['lang'] || 'en')
      .then(buffer => {
        var binaryString = '';
        for (var i = 0; i < buffer.length; i++) {
          binaryString += String.fromCharCode(buffer[i]);
        }

        res.json({
          audio: 'data:audio/wav;base64,' + btoa(binaryString)
        })
      })
      .catch(err => {
        res.error('Could not convert')
        return;
      })
  }
}