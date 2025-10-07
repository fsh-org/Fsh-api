const fs = require('node:fs');
const { InferenceClient } = require('@huggingface/inference');
const hf = new InferenceClient(process.env['ai'], { retry_on_error: false });
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
  params: [
    {
      name: 'text',
      required: true,
      default: 'A spining grey fish'
    },
    {
      name: 'negative',
      required: false,
      default: 'blurry'
    },
    {
      name: 'model',
      required: false,
      default: 'stabilityai/stable-diffusion-xl-base-1.0'
    }
  ],
  category: "image",

  async execute(req, res) {
    if (!req.query["text"]) {
      res.type('text/html').send('mini docs<br>text=[TEXT] - Text to generate image<br>Optional:<br>model=[Model] - Very high level but allows for better images (https://huggingface.co/models?pipeline_tag=text-to-image)<br>negative=[NON] - Things you dont want to appear (blur)');
      return;
    }

    try {
      let img = await hf.textToImage({
        inputs: req.query["text"],
        model: req.query["model"] ?? 'stabilityai/stable-diffusion-xl-base-1.0',
        parameters: {
          negative_prompt: req.query["negative"] ?? 'blurry',
        }
      });
      let itemname = `${nanoid()}.${img.type.replace('image/', '')}`,
      imgbuffer = Buffer.from(await img.arrayBuffer());
      fs.createWriteStream(`images/imagine/${itemname}`).write(imgbuffer);
      res.json({link: `https://api.fsh.plus/images/imagine/${itemname}`});
    } catch (err) {
      res.error('Could not generate', 500);
    }
  }
}