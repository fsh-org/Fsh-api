const fs = require("fs");
const hfimport = require('@huggingface/inference');
const hf = new hfimport.HfInference(process.env['ai']);
let nanoid;

// get packages that use import bc boooooo
(async()=>{
  const nanid = await import('nanoid');
  nanoid = nanid.nanoid
})();

module.exports = {
  path: '/imagine',
  info: 'Generates image with ai',
  type: 'get',
  params: ["text", true, "negative", false, "model", false],
  category: "image",

  async execute(req, res) {
    if (!req.query["text"]) {
      res.send('mini docs<br>text=[TEXT] - Text to generate image<br>Optional:<br>model=[Model] - Very high level but allows for better images (https://huggingface.co/models?pipeline_tag=text-to-image) [if set to dall-e it has a special model that uses dall-e 3 (no negative and may bot work)]<br>negative=[NON] - Things you dont want to appear (blur)');
      return;
    }

    try{
      if (req.query["model"] == "dall-e") {
        let img = await fetch(`https://hercai.onrender.com/v3/text2image?prompt=${req.query["text"].replaceAll(" ","%20")}`);
        img = await img.json();
        if ((String(img.status)||'2').startsWith('4')) {
          res.status(500)
          res.json({
            err: true,
            msg: 'Error, wait a bit or check prompt'
          })
          return;
        }
        res.json({link: img.url});
        return;
      }

      let img = await hf.textToImage({
        inputs: req.query["text"],
        model: req.query["model"] || 'SG161222/Realistic_Vision_V1.4',
        parameters: {
          negative_prompt: req.query["negative"] || 'blurry',
        }
      });
      let itemname = `${nanoid()}.${img.type.replace('image/', '')}`,
      imgbuffer = Buffer.from(await img.arrayBuffer());
      fs.createWriteStream(`images/imagine/${itemname}`).write(imgbuffer)
      res.json({link: `https://${req.hostname}/images/imagine/${itemname}`})
    } catch (err) {
      res.status(500)
      res.json({
        err: true,
        msg: err
      })
    }
  }
}