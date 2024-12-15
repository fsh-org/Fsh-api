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
          .resize(size, size, { fit: 'fill' })
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
    images = images.filter(e => (e ?? '').length);

    if (images.length < 2) {
      res.error('You must include at least two images');
      return;
    }

    for (let i=0;i<images.length;i++) {
      images[i] = await getUrl(images[i]);
    }
    images = images.filter(e => (e ?? '').length);

    if (images.length < 2) {
      res.error('Too many images failed to load');
      return;
    }

    let layers;
    let w;
    let h;
    switch (images.length) {
      case 2:
        w = size*2+5
        h = size
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'northeast'}
        ];
        break;
      case 3:
        w = size*2+5
        h = size*2+5
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'northeast'},
          {input: images[2], gravity: 'southwest'}
        ];
        break;
      case 4:
        w = size*2+5
        h = size*2+5
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'northeast'},
          {input: images[2], gravity: 'southwest'},
          {input: images[3], gravity: 'southeast'}
        ];
        break;
      case 5:
        w = size*3+10
        h = size*2+5
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'north'},
          {input: images[2], gravity: 'northeast'},
          {input: images[3], gravity: 'southwest'},
          {input: images[4], gravity: 'south'}
        ];
        break;
      case 6:
        w = size*3+10
        h = size*2+5
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'north'},
          {input: images[2], gravity: 'northeast'},
          {input: images[3], gravity: 'southwest'},
          {input: images[4], gravity: 'south'},
          {input: images[5], gravity: 'southeast'}
        ];
        break;
      case 7:
        w = size*3+10
        h = size*3+10
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'north'},
          {input: images[2], gravity: 'northeast'},
          {input: images[3], gravity: 'west'},
          {input: images[4], gravity: 'center'},
          {input: images[5], gravity: 'east'},
          {input: images[6], gravity: 'southwest'}
        ];
        break;
      case 8:
        w = size*3+10
        h = size*3+10
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'north'},
          {input: images[2], gravity: 'northeast'},
          {input: images[3], gravity: 'west'},
          {input: images[4], gravity: 'center'},
          {input: images[5], gravity: 'east'},
          {input: images[6], gravity: 'southwest'},
          {input: images[7], gravity: 'south'}
        ];
        break;
      case 9:
        w = size*3+10
        h = size*3+10
        layers = [
          {input: images[0], gravity: 'northwest'},
          {input: images[1], gravity: 'north'},
          {input: images[2], gravity: 'northeast'},
          {input: images[3], gravity: 'west'},
          {input: images[4], gravity: 'center'},
          {input: images[5], gravity: 'east'},
          {input: images[6], gravity: 'southwest'},
          {input: images[7], gravity: 'south'},
          {input: images[8], gravity: 'southeast'}
        ];
        break;
    }
    
    sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: (req.query['bg'] ? '#'+req.query['bg'] : '#000')
      }
    })
      .composite(layers)
      .png()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      })
  }
}