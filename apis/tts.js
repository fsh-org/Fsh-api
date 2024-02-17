const fs = require("fs");
const { getAudioBuffer } = require('simple-tts-mp3');

module.exports = {
	path: '/tts',
	info: 'Generates text to speach audio',
	type: 'get',
	params: ["text", true, "lang", false],
	category: "image",
  
	async execute(req, res) {
    if (!req.query['text']) {
      res.json({
        err: true,
        msg: 'Include text'
      })
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
      });
	}
}