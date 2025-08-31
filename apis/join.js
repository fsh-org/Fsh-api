const sharp = require('sharp')

const size = 300;

let cache = {};

async function getUrl(url) {
  if (!url.includes('://')) url = 'https://'+url;
  return new Promise(async(resolve) => {
    if (!url) {
      resolve();
      return;
    }
    if (Object.keys(cache).includes(url)) {
      resolve(cache[url]);
      return;
    }
    try {
      let data = await fetch(url);
      if (String(data.status).startsWith(2)) {
        data = await data.arrayBuffer();
        data = Buffer.from(data);
        sharp(data)
          .resize(size, size, { fit: 'cover' })
          .toBuffer()
          .then(dat => {
            cache[url] = dat;
            resolve(dat);
          })
      } else {
        resolve();
      }
    } catch (err) { resolve() }
  });
}

module.exports = {
  path: '/join',
  info: 'Join two or more image urls together',
  type: 'get',
  params: [
    {
      name: 'bg',
      required: false,
      default: '00000000'
    },
    {
      name: 'one',
      required: true,
      default: 'https://fsh.plus/fsh.png'
    },
    {
      name: 'two',
      required: true,
      default: 'https://fsh.plus/fsh.png'
    },
    {
      name: 'three',
      required: false,
      default: ''
    },
    {
      name: 'four',
      required: false,
      default: ''
    },
    {
      name: 'five',
      required: false,
      default: ''
    },
    {
      name: 'six',
      required: false,
      default: ''
    },
    {
      name: 'seven',
      required: false,
      default: ''
    },
    {
      name: 'eight',
      required: false,
      default: ''
    },
    {
      name: 'nine',
      required: false,
      default: ''
    },
  ],
  category: "image",

  async execute(req, res) {
    let one = req.query['one'];
    let two = req.query['two'];
    let three = req.query['three'];
    let four = req.query['four'];
    let five = req.query['five'];
    let six = req.query['six'];
    let seven = req.query['seven'];
    let eight = req.query['eight'];
    let nine = req.query['nine'];

    let images = [one, two, three, four, five, six, seven, eight, nine];
    images = images.filter(e=>(e??'').length);
    if (images.length < 2) {
      res.error('You must include at least two images');
      return;
    }

    for (let i=0;i<images.length;i++) {
      images[i] = await getUrl(images[i]);
    }
    images = images.filter(e=>(e??'').length);
    if (images.length < 2) {
      res.error('Too many images failed to load');
      return;
    }

    let count = images.length;
    let cols, rows;
    if (count <= 2) { cols = count; rows = 1; }
    else if (count <= 4) { cols = rows = 2; }
    else if (count <= 6) { cols = 3; rows = 2; }
    else { cols = rows = 3; }

    images = images.map((buf, i) => {
      let row = Math.floor(i/cols);
      let col = i%cols;
      return { input: buf, top: row * size, left: col * size };
    });

    await sharp({
      create: {
        width: cols * size,
        height: rows * size,
        channels: 4,
        background: (req.query['bg']?'#'+req.query['bg']:'#000')
      }
    })
      .composite(images)
      .png()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        });
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      });
  }
}