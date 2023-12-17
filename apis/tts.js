const fs = require("fs");
const hfimport = require('@huggingface/inference');
const hf = new hfimport.HfInference(process.env['ai']);

module.exports = {
	path: '/tts',
	info: 'Generates text with ai',
	type: 'get',
	params: ["text", true, "model", false],
	category: "hidden",
	execute(req, res) {
    (async () => {
    try{
      if(!req.query["text"]) {
        res.send('mini docs<br>text=[TEXT] - Text for speech<br>Optional:<br>model=[Model] - Very high level but allows for better results');
        return;
      };
      let img = await hf.textToSpeech({
        model: req.query["model"] || 'espnet/kan-bayashi_ljspeech_vits',
        inputs: req.query["text"]
      })
      console.log(img)
      res.send(img)
    } catch (err) {
      res.status(500)
      res.send(`{"err":true,"msg":"${err}"}`)
    }
    })()
	}
}