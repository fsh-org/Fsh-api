const sharp = require('sharp')

const size = 300;

let cache = {};

async function getUrl(url) {
  return new Promise(async(resolve, reject) => {
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
          .resize(size, size)
          .toBuffer()
          .then(dat => {
            cache[url] = dat;
            resolve(dat);
          })
      } else {
        resolve();
      }
    } catch (err) { resolve(); }
  });
}

module.exports = {
  path: '/join',
  info: 'Join two image urls together',
  type: 'get',
  params: ["one", true, "two", true, "three", false, "four", false, "five", false, "six", false, "seven", false, "eight", false, "nine", false],
  category: "image",

  async execute(req, res) {
    let one = req.query['one']
    let two = req.query['two']
    let three = req.query['three']
    let four = req.query['four']
    let five = req.query['five']
    let six = req.query['six']
    let seven = req.query['seven']
    let eight = req.query['eight']
    let nine = req.query['nine']

    if (!one || !two) {
      res.json({
        err: true,
        msg: 'You must include both "one" and "two" parameters'
      })
      return;
    }

    one = await getUrl(one);
    if (!one) {
      res.json({
        err: true,
        msg: 'Could not get images'
      })
      return;
    }
    two = await getUrl(two);
    if (!two) {
      res.json({
        err: true,
        msg: 'Could not get images'
      })
      return;
    }

    three = await getUrl(three);
    four = await getUrl(four);
    five = await getUrl(five);
    six = await getUrl(six);
    seven = await getUrl(seven);
    eight = await getUrl(eight);
    nine = await getUrl(nine);

    let layers = [
      {input: one, gravity: 'northwest'},
      {input: two, gravity: 'northeast'}
    ];

    if (three) {
      layers.push({input: three, gravity: 'southwest'})
    }
    if (four) {
      layers.push({input: four, gravity: 'southeast'})
    }
    if (five) {
      layers.push({input: five, gravity: 'north'})
    }
    if (six) {
      layers.push({input: six, gravity: 'south'})
    }
    if (seven) {
      layers.push({input: seven, gravity: 'east'})
    }
    if (eight) {
      layers.push({input: eight, gravity: 'west'})
    }
    if (nine) {
      layers.push({input: nine, gravity: 'center'})
    }
    
    sharp({
      create: {
        width: five || six || seven || eight || nine ? (size*3)+10 : (size*2)+5,
        height: (three || four ? seven || eight || nine ? (size*3)+10 : (size*2)+5 : size),
        channels: 4,
        background: '#000'
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
      .catch(err => {
        res.json({
          err: true,
          msg: 'Could not generate'
        })
        return;
      })
  }
}