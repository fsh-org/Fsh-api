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
	execute(req, res) {
    (async () => {
    try{
    if(!req.query["text"]) {
      res.send('mini docs<br>text=[TEXT] - Text to generate image<br>Optional:<br>model=[Model] - Very high level but allows for better images (https://huggingface.co/models?pipeline_tag=text-to-image) [if set to dall-e it has a special model that uses dall-e 3 (no negative)]<br>negative=[NON] - Things you dont want to appear (blur)');
      return;
    };
    if (req.query["model"] == "dall-e") {
      let img = await fetch(`https://hercai.onrender.com/v3/text2image?prompt=${req.query["text"].replaceAll(" ","%20")}`);
      img = await img.json();
/*      let buf = await fetch(img.url);
      buf = await buf.arrayBuffer();
      buf = Buffer.from(buf)
      let data = `data:image/png;base64,` + await buf.toString('base64');*/
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
      res.send(`{"err":true,"msg":"${err}"}`)
    }
    })()
	}
}